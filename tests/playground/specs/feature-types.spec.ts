import { test, expect } from '../fixtures/playground-fixture';
import path from 'path';

/**
 * Feature types beyond `featured`.
 *
 * Every other spec runs on the blueprint as it is - `featured` and nothing
 * else - and so doubles as the check that a site with one type sees no change.
 * These add a second type and check each screen grows a control for it.
 *
 * The blueprint seeds four posts, the first two featured. Each test boots its
 * own Playground, so each seeds the types it needs.
 */
const FEATURED = 'Featured announcement';
const ORDINARY = 'An ordinary post';
const ORDINARY_TWO = 'Another ordinary post';

/** Create the Recommended type and put it on `titles`. */
const seedRecommended = async ( runPhp, titles: string[] = [] ) => {
	const encoded = Buffer.from( JSON.stringify( titles ), 'utf8' ).toString(
		'base64'
	);

	await runPhp( `
		wp_insert_term( 'Recommended', 'pts_feature_tax' );
		foreach ( json_decode( base64_decode( '${ encoded }' ) ) as $title ) {
			$ids = get_posts( array( 'post_type' => 'post', 'title' => $title, 'numberposts' => 1, 'fields' => 'ids' ) );
			wp_set_object_terms( $ids[0], 'recommended', 'pts_feature_tax', true );
		}
	` );
};

/** Slugs of the feature types a post carries, by title. */
const featureTypesOf = async ( runPhp, title: string ) => {
	const encoded = Buffer.from( title, 'utf8' ).toString( 'base64' );

	const result = await runPhp( `
		$ids = get_posts( array( 'post_type' => 'post', 'title' => base64_decode( '${ encoded }' ), 'numberposts' => 1, 'fields' => 'ids' ) );
		$slugs = wp_get_object_terms( $ids[0], 'pts_feature_tax', array( 'fields' => 'slugs' ) );
		sort( $slugs );
		echo wp_json_encode( $slugs );
	` );

	return JSON.parse( result );
};

const postId = async ( runPhp, title: string ) =>
	(
		await runPhp(
			`$p = get_posts( array( 'post_type' => 'post', 'title' => '${ title }', 'numberposts' => 1, 'fields' => 'ids' ) ); echo $p[0];`
		)
	).trim();

test.describe( 'Feature types', () => {
	test( 'template tags read any feature type', async ( { runPhp } ) => {
		await seedRecommended( runPhp, [ ORDINARY ] );

		const result = await runPhp( `
			$ordinary = get_posts( array( 'post_type' => 'post', 'title' => '${ ORDINARY }', 'numberposts' => 1 ) );
			echo wp_json_encode( array(
				'types'       => wp_list_pluck( post_type_spotlight_get_feature_types(), 'slug' ),
				'recommended' => post_type_spotlight_is_featured( $ordinary[0], 'recommended' ),
				'featured'    => post_type_spotlight_is_featured( $ordinary[0] ),
				'classes'     => get_post_class( '', $ordinary[0] ),
			) );
		` );

		const { types, recommended, featured, classes } = JSON.parse( result );

		// `featured` leads whatever the alphabet says.
		expect( types ).toEqual( [ 'featured', 'recommended' ] );
		expect( recommended ).toBe( true );
		expect( featured ).toBe( false );
		expect( classes ).toEqual(
			expect.arrayContaining( [
				'pts-recommended',
				'pts-recommended-post',
			] )
		);
		expect( classes ).not.toContain( 'featured' );
	} );

	test( 'the editor Spotlight row lists every type', async ( {
		page,
		wpBaseUrl,
		runPhp,
		screenshotDir,
	} ) => {
		await seedRecommended( runPhp );

		await page.goto(
			`${ wpBaseUrl }/wp-admin/post.php?post=${ await postId(
				runPhp,
				FEATURED
			) }&action=edit`
		);

		const welcome = page.locator( '.components-modal__screen-overlay' );
		if ( await welcome.isVisible().catch( () => false ) ) {
			await page.keyboard.press( 'Escape' );
		}

		const toggle = page.locator( '.pts-spotlight__toggle' );
		await expect( toggle ).toHaveText( 'Featured' );

		// Two types: a popover rather than a one-click toggle.
		await toggle.scrollIntoViewIfNeeded();
		await toggle.click();

		const popover = page.locator( '.pts-spotlight__types' );
		await expect(
			popover.getByRole( 'checkbox', { name: 'Featured' } )
		).toBeChecked();
		await expect(
			popover.getByRole( 'checkbox', { name: 'Recommended' } )
		).not.toBeChecked();

		await popover.getByRole( 'checkbox', { name: 'Recommended' } ).check();
		await expect( toggle ).toHaveText( 'Featured, Recommended' );

		await page.screenshot( {
			path: path.join( screenshotDir, 'editor-feature-types.png' ),
			animations: 'disabled',
		} );

		await page.keyboard.press( 'Escape' );
		await page.getByRole( 'button', { name: 'Save', exact: true } ).click();
		await expect(
			page.locator( '.components-snackbar', { hasText: 'updated' } )
		).toBeVisible();

		expect( await featureTypesOf( runPhp, FEATURED ) ).toEqual( [
			'featured',
			'recommended',
		] );
	} );

	test( 'the post list gains a view and Quick Edit checkbox per type', async ( {
		page,
		wpBaseUrl,
		runPhp,
		screenshotDir,
	} ) => {
		await seedRecommended( runPhp, [ ORDINARY ] );

		await page.goto( `${ wpBaseUrl }/wp-admin/edit.php?post_type=post` );

		await expect(
			page.locator( '.subsubsub a[href*="term=recommended"]' )
		).toHaveText( 'Recommended' );
		await expect(
			page
				.locator( '#the-list tr', { hasText: ORDINARY } )
				.locator( '.column-lp-featured' )
		).toHaveText( 'Recommended' );

		const row = page.locator( '#the-list tr', {
			has: page.locator( '.row-title', { hasText: ORDINARY_TWO } ),
		} );
		await row.hover();
		await row.locator( '.editinline' ).click();

		const editRow = page.locator( 'tr.inline-edit-row.inline-editor' );
		const recommended = editRow.locator(
			'input[name="_pts_feature_types[]"][value="recommended"]'
		);
		await expect( recommended ).not.toBeChecked();

		await page.screenshot( {
			path: path.join( screenshotDir, 'quick-edit-feature-types.png' ),
			animations: 'disabled',
		} );

		await recommended.check();
		await editRow.locator( '.save' ).click();
		await expect( editRow ).toHaveCount( 0 );

		expect( await featureTypesOf( runPhp, ORDINARY_TWO ) ).toEqual( [
			'recommended',
		] );

		// The view filters by its own type, and now holds both posts.
		await page.goto(
			`${ wpBaseUrl }/wp-admin/edit.php?post_type=post&taxonomy=pts_feature_tax&term=recommended`
		);
		await expect( page.locator( '#the-list tr' ) ).toHaveCount( 2 );
		await expect( page.locator( '.subsubsub a.current' ) ).toHaveText(
			'Recommended'
		);
	} );

	test( 'the Featured List block reads its feature type', async ( {
		page,
		wpBaseUrl,
		runPhp,
	} ) => {
		await seedRecommended( runPhp, [ ORDINARY ] );

		const list = ( queryType: string, featureType?: string ) =>
			`<!-- wp:query ${ JSON.stringify( {
				namespace: 'post-type-spotlight/featured-list',
				query: {
					perPage: 10,
					postType: 'post',
					order: 'desc',
					orderBy: 'date',
					inherit: false,
					queryType,
					...( featureType ? { featureType } : {} ),
				},
			} ) } --><div class="wp-block-query"><!-- wp:post-template --><!-- wp:post-title /--><!-- /wp:post-template --></div><!-- /wp:query -->`;

		const content = [
			list( 'featured-only' ),
			list( 'featured-only', 'recommended' ),
			list( 'featured-exclude', 'recommended' ),
			list( 'featured-only', 'deleted-type' ),
		].join( '\n' );

		const encoded = Buffer.from( content, 'utf8' ).toString( 'base64' );
		const pageId = (
			await runPhp(
				`echo wp_insert_post( array( 'post_title' => 'PTS feature types fixture', 'post_type' => 'page', 'post_status' => 'publish', 'post_content' => base64_decode( '${ encoded }' ) ) );`
			)
		).trim();

		await page.goto( `${ wpBaseUrl }/?page_id=${ pageId }` );

		const loops = await page
			.locator( '.wp-block-query' )
			.evaluateAll( ( nodes ) =>
				nodes.map( ( node ) =>
					Array.from(
						node.querySelectorAll( '.wp-block-post-title' )
					).map( ( title ) => title.textContent.trim() )
				)
			);

		// No featureType at all: the Featured List it always was.
		expect( loops[ 0 ] ).toHaveLength( 2 );
		expect( loops[ 0 ] ).toContain( FEATURED );
		expect( loops[ 1 ] ).toEqual( [ ORDINARY ] );
		expect( loops[ 2 ] ).not.toContain( ORDINARY );
		expect( loops[ 2 ] ).toEqual(
			expect.arrayContaining( [ FEATURED, ORDINARY_TWO ] )
		);
		// A deleted type lists nothing rather than falling back to featured.
		expect( loops[ 3 ] ).toEqual( [] );
	} );
} );
