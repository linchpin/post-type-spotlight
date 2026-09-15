import { test, expect } from '../fixtures/playground-fixture';
import path from 'path';

/**
 * Activating the plugin changes nothing an author can see until a post type is
 * ticked under Settings > Writing, so a fresh install gets a notice pointing at
 * that screen.
 *
 * "Fresh" is derived from the absence of the `pts_featured_post_types_settings`
 * row rather than from an activation hook, which is the part worth pinning
 * down: saving the Writing screen has to create that row even when nothing is
 * ticked, or the notice would outlive a deliberate choice to feature nothing.
 *
 * The blueprint boots with post and page enabled, so each test clears the
 * option first to reach the state a real activation starts from.
 */
test.describe( 'Onboarding notice', () => {
	const asFreshInstall =
		"delete_option( 'pts_featured_post_types_settings' ); delete_option( 'pts_onboarding_dismissed' );";

	test( 'points a fresh install at Settings > Writing', async ( {
		page,
		wpBaseUrl,
		runPhp,
		screenshotDir,
	} ) => {
		await runPhp( asFreshInstall );

		await page.goto( `${ wpBaseUrl }/wp-admin/index.php` );

		const notice = page.locator( '.pts-onboarding-notice' );
		await expect( notice ).toBeVisible();
		await expect( notice ).toContainText(
			'no post types can be featured yet'
		);

		const cta = notice.getByRole( 'link', { name: 'Choose post types' } );
		await expect( cta ).toHaveAttribute(
			'href',
			/options-writing\.php#pts-featured-post-types$/
		);

		await page.screenshot( {
			path: path.join( screenshotDir, 'onboarding-notice.png' ),
			fullPage: true,
			animations: 'disabled',
		} );
	} );

	test( 'stays quiet on the screen it points at', async ( {
		page,
		wpBaseUrl,
		runPhp,
	} ) => {
		await runPhp( asFreshInstall );

		await page.goto( `${ wpBaseUrl }/wp-admin/options-writing.php` );

		await expect( page.locator( '.pts-onboarding-notice' ) ).toHaveCount(
			0
		);

		// The anchor the notice and the Plugins row link both aim at.
		await expect(
			page.locator( '#pts-featured-post-types' )
		).toBeVisible();
	} );

	test( 'ends once the Writing screen is saved, even with nothing ticked', async ( {
		page,
		wpBaseUrl,
		runPhp,
	} ) => {
		await runPhp( asFreshInstall );

		await page.goto( `${ wpBaseUrl }/wp-admin/options-writing.php` );

		// Nothing is ticked with the option gone; save that as the choice.
		await expect(
			page.locator( '#pts_featured_post_types_post' )
		).not.toBeChecked();
		await page.locator( '#submit' ).click();
		await page.waitForLoadState( 'networkidle' );

		// The row has to exist now, holding an empty array rather than false.
		const stored = await runPhp(
			"echo wp_json_encode( get_option( 'pts_featured_post_types_settings' ) );"
		);
		expect( JSON.parse( stored ) ).toEqual( [] );

		await page.goto( `${ wpBaseUrl }/wp-admin/index.php` );
		await expect( page.locator( '.pts-onboarding-notice' ) ).toHaveCount(
			0
		);

		// Restore the blueprint state for whatever runs next.
		await runPhp(
			"update_option( 'pts_featured_post_types_settings', array( 'post', 'page' ) );"
		);
	} );

	test( 'stays dismissed after the X is clicked', async ( {
		page,
		wpBaseUrl,
		runPhp,
	} ) => {
		await runPhp( asFreshInstall );

		await page.goto( `${ wpBaseUrl }/wp-admin/index.php` );

		const notice = page.locator( '.pts-onboarding-notice' );
		await expect( notice ).toBeVisible();

		// Core hides the notice on click; the plugin's own script is what
		// records the choice, so wait on the request rather than the markup.
		const dismissed = page.waitForResponse( ( response ) =>
			response.url().includes( 'admin-ajax.php' )
		);
		await notice.locator( '.notice-dismiss' ).click();
		expect( ( await dismissed ).status() ).toBe( 200 );

		const stored = await runPhp(
			"echo get_option( 'pts_onboarding_dismissed' ) ? 'yes' : 'no';"
		);
		expect( stored.trim() ).toBe( 'yes' );

		// The part a page-load-only dismissal would get wrong.
		await page.goto( `${ wpBaseUrl }/wp-admin/index.php` );
		await expect( page.locator( '.pts-onboarding-notice' ) ).toHaveCount(
			0
		);

		await runPhp(
			"delete_option( 'pts_onboarding_dismissed' ); update_option( 'pts_featured_post_types_settings', array( 'post', 'page' ) );"
		);
	} );

	test( 'adds a Settings link to the plugin row', async ( {
		page,
		wpBaseUrl,
	} ) => {
		await page.goto( `${ wpBaseUrl }/wp-admin/plugins.php` );

		const settings = page.locator(
			'tr[data-plugin="post-type-spotlight/post-type-spotlight.php"] a[href*="options-writing.php#pts-featured-post-types"]'
		);
		await expect( settings ).toBeVisible();
		await expect( settings ).toHaveText( 'Settings' );
	} );
} );
