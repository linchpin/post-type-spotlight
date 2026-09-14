import { test, expect } from '../fixtures/playground-fixture';

/**
 * The cheapest possible guard, and the one that catches the most: if the
 * plugin fatals on load or fails to register its taxonomy, every other spec
 * fails for a reason that looks unrelated to the cause.
 */
test.describe( 'Plugin activation', () => {
	test( 'activates and registers its taxonomy', async ( { runPhp } ) => {
		const active = await runPhp(
			"echo is_plugin_active( 'post-type-spotlight/post-type-spotlight.php' ) ? 'yes' : 'no';"
		);
		expect( active.trim() ).toBe( 'yes' );

		const taxonomy = await runPhp(
			"echo taxonomy_exists( 'pts_feature_tax' ) ? 'yes' : 'no';"
		);
		expect( taxonomy.trim() ).toBe( 'yes' );

		// The hidden term the plugin self-heals on admin_init.
		const term = await runPhp(
			"$t = term_exists( 'featured', 'pts_feature_tax' ); echo $t ? 'yes' : 'no';"
		);
		expect( term.trim() ).toBe( 'yes' );
	} );

	test( 'admin screens load without a PHP notice', async ( {
		page,
		wpBaseUrl,
	} ) => {
		for ( const url of [
			'/wp-admin/index.php',
			'/wp-admin/options-writing.php',
			'/wp-admin/edit.php?post_type=post',
		] ) {
			await page.goto( `${ wpBaseUrl }${ url }` );
			const body = await page.textContent( 'body' );
			expect( body, `on ${ url }` ).not.toContain( 'Fatal error' );
			expect( body, `on ${ url }` ).not.toContain( 'Warning:' );
			expect( body, `on ${ url }` ).not.toContain( 'Deprecated:' );
		}
	} );
} );
