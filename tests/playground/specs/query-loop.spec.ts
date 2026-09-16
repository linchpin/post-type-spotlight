import { test, expect } from '../fixtures/playground-fixture';

/**
 * The Featured List variation of the Query Loop block.
 *
 * Everything here runs against the front end rather than the editor. The
 * variation's whole job is to turn a `queryType` saved in block markup into a
 * different set of posts on the page, and that translation happens in PHP -
 * an editor assertion would confirm the control moves without confirming the
 * query it is meant to change.
 *
 * The blueprint seeds four posts, two of them featured. Their titles are the
 * fixture.
 */
const FEATURED = 'Featured announcement';
const FEATURED_TWO = 'A second featured story';
const ORDINARY = 'An ordinary post';
const ORDINARY_TWO = 'Another ordinary post';

/** Markup for the variation, as the inserter would save it. */
const featuredList = ( queryType: string, perPage = 10 ) =>
	`<!-- wp:query {"namespace":"post-type-spotlight/featured-list","query":{"perPage":${ perPage },"pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date","author":"","search":"","exclude":[],"sticky":"","inherit":false,"queryType":"${ queryType }"}} -->
<div class="wp-block-query"><!-- wp:post-template -->
<!-- wp:post-title /-->
<!-- /wp:post-template --></div>
<!-- /wp:query -->`;

/** An untouched Query Loop, for checking the plugin leaves others alone. */
const plainQuery = `<!-- wp:query {"query":{"perPage":10,"pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date","author":"","search":"","exclude":[],"sticky":"","inherit":false}} -->
<div class="wp-block-query"><!-- wp:post-template -->
<!-- wp:post-title /-->
<!-- /wp:post-template --></div>
<!-- /wp:query -->`;

test.describe( 'Featured List query loop', () => {
	/*
	 * Block markup is a wall of JSON inside double quotes, and the PHP that
	 * stores it is itself inside a JavaScript template string. Encoding sidesteps
	 * three layers of escaping that would otherwise decide whether a test passes.
	 */
	const publishPage = async ( runPhp, content: string ) => {
		const encoded = Buffer.from( content, 'utf8' ).toString( 'base64' );

		const id = await runPhp(
			`echo wp_insert_post( array( 'post_title' => 'PTS query loop fixture', 'post_type' => 'page', 'post_status' => 'publish', 'post_content' => base64_decode( '${ encoded }' ) ) );`
		);

		return id.trim();
	};

	/**
	 * Titles each loop on the page rendered, one array per loop, in order.
	 *
	 * Scoped to `.wp-block-post-template` rather than the page. Block themes
	 * render the page's own title with `.wp-block-post-title` too, so a
	 * document-wide lookup returns the fixture page's heading alongside the
	 * posts and every count is one too many.
	 */
	const renderedTitles = async ( page, wpBaseUrl, pageId: string ) => {
		await page.goto( `${ wpBaseUrl }/?page_id=${ pageId }` );

		const templates = page.locator( '.wp-block-post-template' );
		await expect( templates.first() ).toBeAttached();

		const groups: string[][] = [];

		for ( let index = 0; index < ( await templates.count() ); index++ ) {
			const titles = await templates
				.nth( index )
				.locator( '.wp-block-post-title' )
				.allInnerTexts();

			groups.push(
				titles.map( ( title ) => title.trim() ).filter( Boolean )
			);
		}

		return groups;
	};

	/**
	 * How many posts are published in total.
	 *
	 * Read from WordPress rather than counted from the blueprint, because the
	 * blueprint's four posts are not the only ones - a fresh install ships with
	 * Hello world! - and hard-coding the total makes the tests fail the next
	 * time WordPress changes what it seeds.
	 */
	const publishedPosts = async ( runPhp ) =>
		Number(
			( await runPhp( "echo wp_count_posts( 'post' )->publish;" ) ).trim()
		);

	test( 'Only featured shows the featured posts and nothing else', async ( {
		page,
		wpBaseUrl,
		runPhp,
	} ) => {
		const pageId = await publishPage(
			runPhp,
			featuredList( 'featured-only' )
		);

		const [ titles ] = await renderedTitles( page, wpBaseUrl, pageId );

		expect( titles.sort() ).toEqual( [ FEATURED_TWO, FEATURED ].sort() );
	} );

	test( 'Exclude featured shows everything else', async ( {
		page,
		wpBaseUrl,
		runPhp,
	} ) => {
		const pageId = await publishPage(
			runPhp,
			featuredList( 'featured-exclude' )
		);

		const [ titles ] = await renderedTitles( page, wpBaseUrl, pageId );

		expect( titles ).toHaveLength( ( await publishedPosts( runPhp ) ) - 2 );
		expect( titles ).toContain( ORDINARY );
		expect( titles ).toContain( ORDINARY_TWO );
		expect( titles ).not.toContain( FEATURED );
		expect( titles ).not.toContain( FEATURED_TWO );
	} );

	/*
	 * The one query type that is a sort rather than a filter, so it is also the
	 * only one whose failure looks like success: it returns every post either
	 * way, and only the order says whether it worked.
	 */
	test( 'Featured first keeps every post and moves the featured ones up', async ( {
		page,
		wpBaseUrl,
		runPhp,
	} ) => {
		const pageId = await publishPage(
			runPhp,
			featuredList( 'featured-first' )
		);

		const [ titles ] = await renderedTitles( page, wpBaseUrl, pageId );

		expect( titles ).toHaveLength( await publishedPosts( runPhp ) );
		expect( titles.slice( 0, 2 ).sort() ).toEqual(
			[ FEATURED_TWO, FEATURED ].sort()
		);
	} );

	/*
	 * The Display panel was hidden by the variation's `allowedControls`, so
	 * "how many featured posts" had no answer. This is the control it exposes.
	 */
	test( 'Items per page limits how many featured posts show', async ( {
		page,
		wpBaseUrl,
		runPhp,
	} ) => {
		const pageId = await publishPage(
			runPhp,
			featuredList( 'featured-only', 1 )
		);

		const [ titles ] = await renderedTitles( page, wpBaseUrl, pageId );

		expect( titles ).toHaveLength( 1 );
		expect( [ FEATURED, FEATURED_TWO ] ).toContain( titles[ 0 ] );
	} );

	/*
	 * The editor draws its preview from the REST API, not from WP_Query, so the
	 * query types reach it by an entirely separate route: `queryType` rides along
	 * as a request parameter rather than as block context. Same three answers,
	 * different plumbing - and a preview that disagrees with the published page
	 * is the failure people actually report.
	 *
	 * Asserted through rest_do_request() rather than the editor UI because the
	 * question is what the API returns, and driving the block inspector to find
	 * out would test the sidebar instead.
	 */
	test( 'The editor preview query returns the same posts', async ( {
		runPhp,
	} ) => {
		const countFor = async ( queryType: string ) =>
			Number(
				(
					await runPhp(
						`$r = new WP_REST_Request( 'GET', '/wp/v2/posts' ); $r->set_param( 'queryType', '${ queryType }' ); $r->set_param( 'per_page', 100 ); echo count( rest_do_request( $r )->get_data() );`
					)
				).trim()
			);

		const total = await publishedPosts( runPhp );

		expect( await countFor( 'featured-only' ) ).toBe( 2 );
		expect( await countFor( 'featured-exclude' ) ).toBe( total - 2 );
		// A sort, not a filter: every post is still in the result set.
		expect( await countFor( 'featured-first' ) ).toBe( total );
	} );

	/*
	 * A Featured List used to attach its filter to every Query Loop rendered
	 * after it, so a plain loop lower down the same page silently lost its
	 * unfeatured posts.
	 */
	test( 'A plain query loop on the same page is left alone', async ( {
		page,
		wpBaseUrl,
		runPhp,
	} ) => {
		const pageId = await publishPage(
			runPhp,
			`${ featuredList( 'featured-only' ) }\n\n${ plainQuery }`
		);

		const [ featuredOnly, plain ] = await renderedTitles(
			page,
			wpBaseUrl,
			pageId
		);

		expect( featuredOnly ).toHaveLength( 2 );
		expect( plain ).toHaveLength( await publishedPosts( runPhp ) );
		expect( plain ).toContain( ORDINARY );
		expect( plain ).toContain( ORDINARY_TWO );
	} );
} );
