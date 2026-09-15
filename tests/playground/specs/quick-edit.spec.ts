import { test, expect } from '../fixtures/playground-fixture';
import path from 'path';

/**
 * Issue #96 and the Quick Edit work that came with it.
 *
 * The enqueue regression is the one worth pinning down. block_scripts() used to
 * run on `init` and guard itself with $_GET['post'] / $_GET['post_type'], so the
 * editor assets loaded only on screens where WordPress happened to put one of
 * those in the URL. Add New Post carries neither, which meant the whole control
 * was missing on the single most common screen for using it - silently, because
 * nothing errors when a script simply is not enqueued.
 *
 * enqueue_block_editor_assets fires wherever the block editor loads, which is
 * exactly the condition the guard was approximating.
 */
test.describe( 'Issue 96: block editor assets', () => {
	const editorLoaded = async ( page ) => {
		await expect(
			page.locator( '.edit-post-visual-editor, .editor-visual-editor' )
		).toBeVisible();

		const welcome = page.locator( '.components-modal__screen-overlay' );
		if ( await welcome.isVisible().catch( () => false ) ) {
			await page.keyboard.press( 'Escape' );
			await expect( welcome ).toBeHidden();
		}
	};

	test( 'loads on Add New Post, which carries no query args', async ( {
		page,
		wpBaseUrl,
	} ) => {
		await page.goto( `${ wpBaseUrl }/wp-admin/post-new.php` );
		await editorLoaded( page );

		// The script itself, not just the control: if this is absent the panel
		// cannot render and the failure says so directly.
		await expect(
			page.locator( 'script[src*="post-type-spotlight"]' )
		).toHaveCount( 1 );

		await expect(
			page.locator( '.pts-post-settings-panel' )
		).toBeVisible();
	} );

	test( 'loads on Add New Page, where post_type is in the URL', async ( {
		page,
		wpBaseUrl,
	} ) => {
		await page.goto(
			`${ wpBaseUrl }/wp-admin/post-new.php?post_type=page`
		);
		await editorLoaded( page );

		await expect(
			page.locator( '.pts-post-settings-panel' )
		).toBeVisible();
	} );
} );

/**
 * Quick Edit gets its own checkbox, because the inline editor only copies core
 * fields into the edit row and saves over admin-ajax.php, which the normal
 * save_post path ignores.
 */
test.describe( 'Quick Edit', () => {
	/** Open the Quick Edit row for a post by title. */
	const openQuickEdit = async ( page, title ) => {
		const row = page.locator( '#the-list tr', {
			has: page.locator( '.row-title', { hasText: title } ),
		} );

		await row.hover();
		await row.locator( '.editinline' ).click();

		// .inline-editor, not .inline-edit-row: WordPress keeps two hidden
		// template rows (#inline-edit and #bulk-edit) carrying that class, and
		// only the row actually being edited gains .inline-editor.
		const editRow = page.locator( 'tr.inline-edit-row.inline-editor' );
		await expect( editRow ).toBeVisible();

		return editRow;
	};

	test( 'offers a featured checkbox seeded from the current state', async ( {
		page,
		wpBaseUrl,
		screenshotDir,
	} ) => {
		await page.goto( `${ wpBaseUrl }/wp-admin/edit.php?post_type=post` );

		// The blueprint features this one.
		const editRow = await openQuickEdit( page, 'Featured announcement' );

		const checkbox = editRow.locator( 'input[name="_pts_featured_post"]' );
		await expect( checkbox ).toBeVisible();

		// Seeded by js/admin-quick-edit.js from the hidden marker in the
		// Featured column, since WordPress does not copy it across itself.
		await expect( checkbox ).toBeChecked();

		await page.screenshot( {
			path: path.join( screenshotDir, 'quick-edit-featured.png' ),
			animations: 'disabled',
		} );
	} );

	test( 'does not seed the checkbox for an unfeatured post', async ( {
		page,
		wpBaseUrl,
	} ) => {
		await page.goto( `${ wpBaseUrl }/wp-admin/edit.php?post_type=post` );

		const editRow = await openQuickEdit( page, 'An ordinary post' );

		await expect(
			editRow.locator( 'input[name="_pts_featured_post"]' )
		).not.toBeChecked();
	} );

	test( 'features a post from the Quick Edit row', async ( {
		page,
		wpBaseUrl,
		runPhp,
	} ) => {
		await page.goto( `${ wpBaseUrl }/wp-admin/edit.php?post_type=post` );

		const editRow = await openQuickEdit( page, 'An ordinary post' );
		await editRow.locator( 'input[name="_pts_featured_post"]' ).check();
		await editRow.locator( '.save' ).click();

		await expect(
			page.locator( 'tr.inline-edit-row.inline-editor' )
		).toHaveCount( 0 );

		// Assert on the stored term rather than the re-rendered row: inline
		// edits save over admin-ajax.php, which the normal save_post path
		// ignores, so this is what proves save_quick_edit ran.
		const featured = await runPhp(
			"$q = get_posts( array( 'post_type' => 'post', 'title' => 'An ordinary post', 'numberposts' => 1, 'fields' => 'ids' ) ); echo $q && has_term( 'featured', 'pts_feature_tax', $q[0] ) ? 'yes' : 'no';"
		);
		expect( featured.trim() ).toBe( 'yes' );
	} );
} );
