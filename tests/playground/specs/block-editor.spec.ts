import { test, expect } from '../fixtures/playground-fixture';
import path from 'path';

/**
 * The block editor toggle is a PluginPostStatusInfo slotfill, so it renders
 * inside the Summary panel of the editor settings sidebar. It is the piece
 * most likely to break silently on a WordPress upgrade — a renamed slot just
 * renders nothing — which is what a screenshot on every pull request catches.
 *
 * The control is a ToggleControl labelled "Feature <Post type>", so it is
 * reached by its label rather than by a plugin-specific id, which it has none
 * of: WordPress generates `inspector-toggle-control-N`.
 */
test.describe( 'Block editor', () => {
	test( 'renders the featured toggle in the post sidebar', async ( {
		page,
		wpBaseUrl,
		runPhp,
		screenshotDir,
	} ) => {
		const postId = (
			await runPhp(
				"$q = get_posts( array( 'post_type' => 'post', 'numberposts' => 1, 'fields' => 'ids' ) ); echo $q ? $q[0] : 0;"
			)
		).trim();

		expect( Number( postId ) ).toBeGreaterThan( 0 );

		await page.goto(
			`${ wpBaseUrl }/wp-admin/post.php?post=${ postId }&action=edit`
		);

		// Wait for the editor canvas before looking for a slotfill inside it.
		await expect(
			page.locator( '.edit-post-visual-editor, .editor-visual-editor' )
		).toBeVisible();

		// Dismiss the welcome modal, which otherwise covers the sidebar.
		const welcome = page.locator( '.components-modal__screen-overlay' );
		if ( await welcome.isVisible().catch( () => false ) ) {
			await page.keyboard.press( 'Escape' );
			await expect( welcome ).toBeHidden();
		}

		// The settings sidebar holds the slotfill and can start collapsed, in
		// which case the toggle is in the DOM but not visible.
		const sidebar = page.locator(
			'.edit-post-sidebar, .editor-sidebar, .interface-complementary-area'
		);
		if ( ! ( await sidebar.isVisible().catch( () => false ) ) ) {
			await page
				.getByRole( 'button', { name: /Settings/i } )
				.first()
				.click();
			await expect( sidebar.first() ).toBeVisible();
		}

		const toggle = page.getByLabel( /^Feature /i ).first();
		await expect( toggle ).toBeVisible();

		// The slotfill sits at the bottom of the Summary panel, so it lands on
		// the very edge of a 900px viewport and the screenshot clips it.
		await toggle.scrollIntoViewIfNeeded();

		await page.screenshot( {
			path: path.join(
				screenshotDir,
				'block-editor-featured-toggle.png'
			),
			fullPage: false,
			animations: 'disabled',
		} );

		const body = await page.textContent( 'body' );
		expect( body ).not.toContain( 'Fatal error' );
	} );
} );
