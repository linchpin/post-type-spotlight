import { test, expect } from '../fixtures/playground-fixture';
import path from 'path';

/**
 * Who gets the Spotlight row in the block editor, and where.
 *
 * Every other editor spec runs as the administrator the blueprint logs in,
 * which is how a row that only administrators could see went unnoticed: it
 * read the enabled post types from /wp/v2/settings, which answers no one
 * without `manage_options`.
 */
test.describe( 'Block editor Spotlight row by role', () => {
	/** Open a post in the editor and wait for the canvas. */
	const openEditor = async ( page, wpBaseUrl, postId: string ) => {
		await page.goto(
			`${ wpBaseUrl }/wp-admin/post.php?post=${ postId }&action=edit`
		);
		await expect(
			page.locator( '.edit-post-visual-editor, .editor-visual-editor' )
		).toBeVisible();

		const welcome = page.locator( '.components-modal__screen-overlay' );
		if ( await welcome.isVisible().catch( () => false ) ) {
			await page.keyboard.press( 'Escape' );
			await expect( welcome ).toBeHidden();
		}
	};

	test( 'an author can feature their own post', async ( {
		page,
		wpBaseUrl,
		runPhp,
		screenshotDir,
	} ) => {
		const postId = (
			await runPhp( `
				$author = wp_insert_user( array( 'user_login' => 'pts-author', 'user_pass' => 'pts-author-pass', 'role' => 'author', 'user_email' => 'pts-author@example.com' ) );
				update_user_meta( $author, 'wp_persisted_preferences', array( 'core/edit-post' => array( 'welcomeGuide' => false ), 'core' => array( 'welcomeGuide' => false ) ) );
				$id = wp_insert_post( array( 'post_title' => 'An author post', 'post_status' => 'publish', 'post_author' => $author ) );
				wp_set_object_terms( $id, 'featured', 'pts_feature_tax' );
				echo $id;
			` )
		).trim();

		/*
		 * The blueprint logs the administrator in on any request that does not
		 * carry this cookie, so it has to be set before logging in as someone
		 * else.
		 */
		await page.context().clearCookies();
		await page.context().addCookies( [
			{
				name: 'playground_auto_login_already_happened',
				value: '1',
				url: wpBaseUrl,
			},
		] );
		/*
		 * The first request still passes through Playground's auto-login
		 * redirects before the form settles, and filling it mid-way loses the
		 * password. Wait for the page to go quiet, then for the login's own
		 * redirect into wp-admin.
		 */
		await page.goto( `${ wpBaseUrl }/wp-login.php` );
		await page.waitForLoadState( 'networkidle' );
		await page.locator( '#user_login' ).fill( 'pts-author' );
		await page.locator( '#user_pass' ).fill( 'pts-author-pass' );
		await expect( page.locator( '#user_pass' ) ).toHaveValue(
			'pts-author-pass'
		);
		await Promise.all( [
			page.waitForURL( /\/wp-admin\// ),
			page.locator( '#wp-submit' ).click(),
		] );

		// Make sure the session really is the author's, not the blueprint's admin.
		await expect(
			page.locator( '#wp-admin-bar-my-account' )
		).toContainText( 'pts-author' );

		await openEditor( page, wpBaseUrl, postId );

		const toggle = page.locator( '.pts-spotlight__toggle' );
		await expect( toggle ).toHaveText( 'Featured' );

		await toggle.scrollIntoViewIfNeeded();
		await toggle.click();
		await expect( toggle ).toHaveText( 'Not featured' );

		await page.screenshot( {
			path: path.join( screenshotDir, 'editor-author-spotlight.png' ),
			animations: 'disabled',
		} );

		await page.getByRole( 'button', { name: 'Save', exact: true } ).click();
		await expect(
			page.locator( '.components-snackbar', { hasText: 'updated' } )
		).toBeVisible();

		const featured = await runPhp(
			`echo has_term( 'featured', 'pts_feature_tax', ${ postId } ) ? 'yes' : 'no';`
		);
		expect( featured.trim() ).toBe( 'no' );
	} );

	test( 'the row stays off post types that are not enabled', async ( {
		page,
		wpBaseUrl,
		runPhp,
	} ) => {
		const ids = JSON.parse(
			await runPhp( `
				update_option( 'pts_featured_post_types_settings', array( 'page' ) );
				echo wp_json_encode( array(
					'post' => wp_insert_post( array( 'post_title' => 'A post', 'post_status' => 'publish' ) ),
					'page' => wp_insert_post( array( 'post_title' => 'A page', 'post_status' => 'publish', 'post_type' => 'page' ) ),
				) );
			` )
		);

		await openEditor( page, wpBaseUrl, String( ids.page ) );
		await expect( page.locator( '.pts-spotlight__toggle' ) ).toBeVisible();

		await openEditor( page, wpBaseUrl, String( ids.post ) );
		// Wait for a core row, so the absence below is not just a slow render.
		await expect(
			page.locator( '.editor-post-panel__row-label', {
				hasText: 'Status',
			} )
		).toBeVisible();
		await expect( page.locator( '.pts-post-settings-panel' ) ).toHaveCount(
			0
		);
	} );
} );
