import { test, expect } from '../fixtures/playground-fixture';
import path from 'path';

/**
 * The Settings > Writing screen is where an admin chooses which post types can
 * be featured. It is also the screen behind `sanitize_settings()`, where the
 * settings field name and the option name deliberately differ, so a round trip
 * through it is worth asserting rather than just photographing.
 */
test.describe( 'Settings: Featured Post Types', () => {
	test( 'renders the Featured Post Types section', async ( {
		page,
		wpBaseUrl,
		screenshotDir,
	} ) => {
		await page.goto( `${ wpBaseUrl }/wp-admin/options-writing.php` );

		const body = await page.textContent( 'body' );
		expect( body ).not.toContain( 'Fatal error' );

		await expect(
			page.getByRole( 'heading', { name: 'Featured Post Types' } )
		).toBeVisible();

		// The blueprint enables post and page, so both boxes arrive checked.
		await expect(
			page.locator( '#pts_featured_post_types_post' )
		).toBeChecked();
		await expect(
			page.locator( '#pts_featured_post_types_page' )
		).toBeChecked();

		await page.screenshot( {
			path: path.join( screenshotDir, 'settings-writing.png' ),
			fullPage: true,
			animations: 'disabled',
		} );
	} );

	test( 'saving the form persists the selected post types', async ( {
		page,
		wpBaseUrl,
		runPhp,
		screenshotDir,
	} ) => {
		await page.goto( `${ wpBaseUrl }/wp-admin/options-writing.php` );

		// Turn page off, leave post on, and save.
		await page.locator( '#pts_featured_post_types_page' ).uncheck();
		await page.locator( '#submit' ).click();
		await page.waitForLoadState( 'networkidle' );

		await expect(
			page.locator( '#pts_featured_post_types_post' )
		).toBeChecked();
		await expect(
			page.locator( '#pts_featured_post_types_page' )
		).not.toBeChecked();

		// Assert on the stored option, not just the re-rendered form. This is
		// the path that used to read an unslashed, unsanitized superglobal.
		const stored = await runPhp(
			"echo wp_json_encode( get_option( 'pts_featured_post_types_settings' ) );"
		);
		expect( JSON.parse( stored ) ).toEqual( [ 'post' ] );

		await page.screenshot( {
			path: path.join( screenshotDir, 'settings-writing-saved.png' ),
			fullPage: true,
			animations: 'disabled',
		} );

		// Restore the blueprint state for whatever runs next.
		await runPhp(
			"update_option( 'pts_featured_post_types_settings', array( 'post', 'page' ) );"
		);
	} );
} );
