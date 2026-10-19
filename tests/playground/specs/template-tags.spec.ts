import { test, expect } from '../fixtures/playground-fixture';

/**
 * post_type_spotlight_is_featured() is the public way for a theme to ask
 * whether a post is featured, so it has to agree with the term the editor
 * writes - and stay quiet, rather than error, when there is nothing to check.
 *
 * blueprint.json seeds four posts, the first two of them featured.
 */
test.describe( 'Template tags', () => {
	test( 'post_type_spotlight_is_featured reports the featured term', async ( {
		runPhp,
	} ) => {
		const result = await runPhp( `
			$ids = get_posts( array( 'post_type' => 'post', 'numberposts' => -1, 'fields' => 'ids' ) );
			$out = array();
			foreach ( $ids as $id ) {
				$out[] = array(
					'title'    => get_the_title( $id ),
					'expected' => has_term( 'featured', 'pts_feature_tax', $id ),
					'byId'     => post_type_spotlight_is_featured( $id ),
					'byPost'   => post_type_spotlight_is_featured( get_post( $id ) ),
				);
			}
			echo wp_json_encode( $out );
		` );

		const rows = JSON.parse( result );
		const featured = rows.filter( ( row ) => row.expected );

		// Guards the blueprint as much as the function: with no featured posts
		// seeded, every row agreeing on false would prove nothing.
		expect( featured.map( ( row ) => row.title ).sort() ).toEqual( [
			'A second featured story',
			'Featured announcement',
		] );

		for ( const row of rows ) {
			expect( row.byId, row.title ).toBe( row.expected );
			expect( row.byPost, row.title ).toBe( row.expected );
		}
	} );

	test( 'post_type_spotlight_is_featured reads the current post in the loop', async ( {
		runPhp,
	} ) => {
		const result = await runPhp( `
			$query = new WP_Query( array( 'post_type' => 'post', 'posts_per_page' => -1 ) );
			$out   = array();
			while ( $query->have_posts() ) {
				$query->the_post();
				$out[ get_the_title() ] = post_type_spotlight_is_featured();
			}
			wp_reset_postdata();
			echo wp_json_encode( $out );
		` );

		expect( JSON.parse( result ) ).toMatchObject( {
			'Featured announcement': true,
			'A second featured story': true,
			'An ordinary post': false,
			'Another ordinary post': false,
		} );
	} );

	test( 'post_type_spotlight_is_featured is false when there is nothing to check', async ( {
		runPhp,
	} ) => {
		const result = await runPhp( `
			$featured = get_posts( array( 'post_type' => 'post', 'numberposts' => 1, 'fields' => 'ids', 'tax_query' => array( array( 'taxonomy' => 'pts_feature_tax', 'field' => 'slug', 'terms' => 'featured' ) ) ) );
			$out = array(
				'missing' => post_type_spotlight_is_featured( PHP_INT_MAX ),
				'noLoop'  => post_type_spotlight_is_featured(),
			);
			// A site that has not enabled any post type never registers the taxonomy.
			unregister_taxonomy( 'pts_feature_tax' );
			$out['unregistered'] = post_type_spotlight_is_featured( $featured[0] );
			echo wp_json_encode( $out );
		` );

		expect( JSON.parse( result ) ).toEqual( {
			missing: false,
			noLoop: false,
			unregistered: false,
		} );
	} );
} );
