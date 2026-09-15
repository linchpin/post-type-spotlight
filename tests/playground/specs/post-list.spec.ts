import { test, expect } from '../fixtures/playground-fixture';
import path from 'path';

/**
 * The admin list table is where the plugin's output is most visible: a
 * Featured column, and a "Featured" view filter that queries the hidden
 * taxonomy.
 *
 * The column key is `lp-featured` (see manage_posts_columns), not `featured`.
 */
test.describe( 'Posts list table', () => {
	test( 'shows the Featured column and view filter', async ( {
		page,
		wpBaseUrl,
		screenshotDir,
	} ) => {
		await page.goto( `${ wpBaseUrl }/wp-admin/edit.php?post_type=post` );

		const body = await page.textContent( 'body' );
		expect( body ).not.toContain( 'Fatal error' );

		await expect( page.locator( 'th#lp-featured' ) ).toBeVisible();
		await expect( page.locator( 'th#lp-featured' ) ).toHaveText(
			'Featured'
		);

		// The "Featured" link the plugin adds to the views row, with its count.
		const view = page.locator(
			'.subsubsub a[href*="taxonomy=pts_feature_tax"]'
		);
		await expect( view ).toBeVisible();
		await expect( view.locator( '..' ) ).toContainText( '(2)' );

		await page.screenshot( {
			path: path.join( screenshotDir, 'posts-list-featured-column.png' ),
			fullPage: true,
			animations: 'disabled',
		} );
	} );

	test( 'the Featured view filters to featured posts only', async ( {
		page,
		wpBaseUrl,
		screenshotDir,
	} ) => {
		await page.goto( `${ wpBaseUrl }/wp-admin/edit.php?post_type=post` );

		// Click the real link rather than a hand-built URL. The href used to
		// carry pts_feature_tax=featured, which the taxonomy does not register
		// as a query var, so the view listed every post. Navigating the way a
		// user does is what catches that.
		await page
			.locator( '.subsubsub a[href*="taxonomy=pts_feature_tax"]' )
			.click();
		await page.waitForLoadState( 'domcontentloaded' );

		const body = await page.textContent( 'body' );
		expect( body ).not.toContain( 'Fatal error' );

		// The blueprint features exactly two of the five posts present.
		await expect( page.locator( '#the-list tr' ) ).toHaveCount( 2 );

		// .row-title specifically: every row also carries Edit/Trash/View
		// links whose accessible names quote the same post title.
		await expect(
			page.locator( '#the-list .row-title', {
				hasText: 'Featured announcement',
			} )
		).toBeVisible();

		await page.screenshot( {
			path: path.join( screenshotDir, 'posts-list-featured-view.png' ),
			fullPage: true,
			animations: 'disabled',
		} );
	} );
} );
