import { test, expect } from '../fixtures/playground-fixture';
import path from 'path';

/**
 * The Spotlight control is a PluginPostStatusInfo slotfill, so it renders in
 * the Summary panel of the editor sidebar alongside Status, Format and
 * Discussion. It is the piece most likely to break silently on a WordPress
 * upgrade - a renamed slot or a changed panel class just renders nothing.
 */
test.describe( 'Block editor', () => {
	/** Open a post in the editor, clear the welcome modal, reveal the sidebar. */
	const openEditor = async ( page, wpBaseUrl, postId ) => {
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

		const sidebar = page
			.locator(
				'.edit-post-sidebar, .editor-sidebar, .interface-complementary-area'
			)
			.first();

		if ( ! ( await sidebar.isVisible().catch( () => false ) ) ) {
			await page
				.getByRole( 'button', { name: /Settings/i } )
				.first()
				.click();
			await expect( sidebar ).toBeVisible();
		}

		return sidebar;
	};

	/**
	 * Click the Spotlight toggle.
	 *
	 * Scrolls it into view and waits out any snackbar first. The row sits at
	 * the bottom of the sidebar, which is exactly where WordPress drops its
	 * snackbar notices, and a covered element makes Playwright wait on
	 * actionability until the whole test times out - the click reports as a
	 * timeout on a locator that plainly resolved, which reads like a missing
	 * control rather than an obscured one.
	 */
	const clickToggle = async ( page, toggle ) => {
		await page
			.locator( '.components-snackbar-list__notice-container' )
			.first()
			.waitFor( { state: 'detached' } )
			.catch( () => {} );

		await toggle.scrollIntoViewIfNeeded();
		await toggle.click();
	};

	const featuredPostId = async ( runPhp ) =>
		(
			await runPhp(
				"$p = get_posts( array( 'post_type' => 'post', 'numberposts' => 1, 'fields' => 'ids', 'tax_query' => array( array( 'taxonomy' => 'pts_feature_tax', 'field' => 'slug', 'terms' => 'featured' ) ) ) ); echo $p ? $p[0] : 0;"
			)
		).trim();

	test( 'renders Spotlight as a Summary panel row', async ( {
		page,
		wpBaseUrl,
		runPhp,
		screenshotDir,
	} ) => {
		const sidebar = await openEditor(
			page,
			wpBaseUrl,
			await featuredPostId( runPhp )
		);

		const toggle = page.locator( '.pts-spotlight__toggle' );
		await expect( toggle ).toBeVisible();
		await expect( toggle ).toHaveText( 'Featured' );

		// It has to be a real editor-post-panel__row, not a lookalike: that
		// class is what puts the label in the same column as Status and
		// Format, and it comes from core's stylesheet rather than ours.
		const row = page.locator( '.editor-post-panel__row', { has: toggle } );
		await expect(
			row.locator( '.editor-post-panel__row-label' )
		).toHaveText( 'Spotlight' );

		// Label columns must line up with the core rows. If our markup drifts
		// from core's, this is what catches it.
		const ours = await row
			.locator( '.editor-post-panel__row-label' )
			.boundingBox();
		const status = await page
			.locator( '.editor-post-panel__row-label', { hasText: 'Status' } )
			.first()
			.boundingBox();
		expect( Math.abs( ours.x - status.x ) ).toBeLessThan( 2 );
		expect( Math.abs( ours.width - status.width ) ).toBeLessThan( 2 );

		// The mark must be constrained. Passed to Button's icon prop it renders
		// as <LogoMark size={24} /> with no width or height at all, and an
		// unconstrained SVG pushed the button's own label out of view.
		const icon = await toggle.locator( 'svg' ).boundingBox();
		expect( icon.width ).toBeLessThanOrEqual( 28 );
		expect( icon.height ).toBeLessThanOrEqual( 28 );

		// A truthy aria-pressed makes WordPress paint its dark is-pressed pill,
		// which is wrong for a value sitting in a column of blue values.
		await expect( toggle ).not.toHaveClass( /is-pressed/ );

		// The row has to sit on the same vertical rhythm as the rows above it.
		// PluginPostStatusInfo wraps every fill in a `.components-panel__row`,
		// which carries `margin-top: 8px` and `min-height: 36px` that the core
		// rows do not have, and left alone it pushes Spotlight visibly away
		// from the group. The inline style in the block editor class zeroes it.
		const rowBox = await row.boundingBox();
		const format = page
			.locator( '.editor-post-panel__row', { hasText: 'Format' } )
			.first();
		const formatBox = await format.boundingBox();
		const discussion = await page
			.locator( '.editor-post-panel__row', { hasText: 'Discussion' } )
			.first()
			.boundingBox();

		const coreStep = formatBox.y - discussion.y;
		const ourStep = rowBox.y - formatBox.y;
		expect( Math.abs( ourStep - coreStep ) ).toBeLessThan( 3 );

		// And the control itself should be the height core's own icon-bearing
		// row is, rather than the taller default a compact Button would take.
		const statusRowBox = await page
			.locator( '.editor-post-panel__row', { hasText: 'Status' } )
			.first()
			.boundingBox();
		expect( Math.abs( rowBox.height - statusRowBox.height ) ).toBeLessThan(
			3
		);

		await page.screenshot( {
			path: path.join( screenshotDir, 'editor-spotlight-featured.png' ),
			animations: 'disabled',
		} );
		await sidebar.screenshot( {
			path: path.join( screenshotDir, 'editor-sidebar-featured.png' ),
			animations: 'disabled',
		} );
	} );

	test( 'toggles between Featured and Not featured on click', async ( {
		page,
		wpBaseUrl,
		runPhp,
		screenshotDir,
	} ) => {
		const sidebar = await openEditor(
			page,
			wpBaseUrl,
			await featuredPostId( runPhp )
		);

		const toggle = page.locator( '.pts-spotlight__toggle' );
		await expect( toggle ).toHaveText( 'Featured' );

		// One click, not a popover: this is a binary value.
		await clickToggle( page, toggle );
		await expect( toggle ).toHaveText( 'Not featured' );

		// The label carries the state, so the mark goes with it.
		await expect( toggle.locator( 'svg' ) ).toHaveCount( 0 );

		await sidebar.screenshot( {
			path: path.join( screenshotDir, 'editor-sidebar-not-featured.png' ),
			animations: 'disabled',
		} );

		await clickToggle( page, toggle );
		await expect( toggle ).toHaveText( 'Featured' );
		await expect( toggle.locator( 'svg' ) ).toHaveCount( 1 );

		const body = await page.textContent( 'body' );
		expect( body ).not.toContain( 'Fatal error' );
	} );
} );
