import { test, expect } from '../fixtures/playground-fixture';

/**
 * The Featured Posts widget, rendered with a sidebar's arguments.
 *
 * Driven through the_widget() rather than a sidebar on the front end: the
 * Playground's default theme is a block theme with no widget areas, and
 * the_widget() hands the widget the same before/after arguments a sidebar
 * would.
 *
 * blueprint.json seeds four posts, the first two of them featured.
 */
test.describe( 'Featured Posts widget', () => {
	test( 'closes its wrapper and raises no warnings', async ( { runPhp } ) => {
		const result = await runPhp( `
			$errors = array();
			set_error_handler(
				function ( $number, $message ) use ( &$errors ) {
					$errors[] = $message;
					return true;
				}
			);

			ob_start();
			the_widget(
				'PTS_Featured_Posts_Widget',
				array( 'title' => 'Picks', 'post_type' => 'post', 'number' => 5 ),
				array(
					'before_widget' => '<section class="pts-widget-test">',
					'after_widget'  => '</section>',
					'before_title'  => '<h2>',
					'after_title'   => '</h2>',
				)
			);
			$html = trim( ob_get_clean() );
			restore_error_handler();

			preg_match_all( '#<h3 title="([^"]*)"#', $html, $titles );

			echo wp_json_encode(
				array(
					'opens'  => substr_count( $html, '<section' ),
					'closes' => substr_count( $html, '</section>' ),
					'last'   => substr( $html, -10 ),
					'titles' => $titles[1],
					'errors' => $errors,
				)
			);
		` );

		const { opens, closes, last, titles, errors } = JSON.parse( result );

		// Without the featured posts in it, an empty widget would pass too.
		expect( titles.sort() ).toEqual( [
			'A second featured story',
			'Featured announcement',
		] );
		expect( opens ).toBe( 1 );
		expect( closes ).toBe( 1 );
		expect( last ).toBe( '</section>' );
		expect( errors ).toEqual( [] );
	} );
} );
