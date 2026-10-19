import { test, expect } from '../fixtures/playground-fixture';
import path from 'path';

/**
 * Settings > Post Type Spotlight, where feature types are managed.
 *
 * The screen is a React app over the post-type-spotlight/v1 routes, so these
 * drive it as an administrator would and then check what was stored, rather
 * than trusting the table to have re-rendered from the right data.
 */
const SCREEN = '/wp-admin/options-general.php?page=post-type-spotlight';

/** Slugs of every feature type, sorted. */
const storedTypes = async ( runPhp ) =>
	JSON.parse(
		await runPhp( `
			$slugs = wp_list_pluck( get_terms( array( 'taxonomy' => 'pts_feature_tax', 'hide_empty' => false ) ), 'slug' );
			sort( $slugs );
			echo wp_json_encode( $slugs );
		` )
	);

/** A table row, by the feature type's name. */
const row = ( page, name: string ) =>
	page.locator( '.dataviews-view-table tbody tr', { hasText: name } );

test.describe( 'Admin screen', () => {
	test( 'lists Featured as built in, with no way to change it', async ( {
		page,
		wpBaseUrl,
		screenshotDir,
	} ) => {
		await page.goto( `${ wpBaseUrl }${ SCREEN }` );

		const featured = row( page, 'Featured' );
		await expect( featured ).toContainText( 'Built in' );
		await expect( featured ).toContainText( 'featured' );
		await expect(
			featured.getByRole( 'button', { name: 'Edit' } )
		).toHaveCount( 0 );
		await expect(
			featured.getByRole( 'button', { name: 'Delete' } )
		).toHaveCount( 0 );

		await page.screenshot( {
			path: path.join( screenshotDir, 'admin-feature-types.png' ),
			fullPage: true,
			animations: 'disabled',
		} );

		const body = await page.textContent( 'body' );
		expect( body ).not.toContain( 'Fatal error' );
	} );

	test( 'adds, renames and deletes a feature type', async ( {
		page,
		wpBaseUrl,
		runPhp,
	} ) => {
		await page.goto( `${ wpBaseUrl }${ SCREEN }` );

		const form = page.locator( '.post-type-spotlight-admin__form' ).first();
		await form.getByLabel( 'Name' ).fill( 'Staff Pick' );
		await form.getByLabel( 'Description' ).fill( 'Chosen by the newsroom' );
		await form.getByRole( 'button', { name: 'Add feature type' } ).click();

		await expect(
			page.locator( '.components-snackbar', { hasText: 'added' } )
		).toBeVisible();
		await expect( row( page, 'Staff Pick' ) ).toContainText( 'staff-pick' );
		await expect( form.getByLabel( 'Name' ) ).toHaveValue( '' );
		expect( await storedTypes( runPhp ) ).toEqual( [
			'featured',
			'staff-pick',
		] );

		await row( page, 'Staff Pick' )
			.getByRole( 'button', { name: 'Edit' } )
			.click();
		const modal = page.getByRole( 'dialog', { name: 'Edit feature type' } );
		await expect( modal.getByLabel( 'Slug' ) ).toBeDisabled();
		await modal.getByLabel( 'Name' ).fill( 'Staff Picks' );
		await modal.getByRole( 'button', { name: 'Save' } ).click();

		await expect( modal ).toHaveCount( 0 );
		await expect( row( page, 'Staff Picks' ) ).toBeVisible();
		// Renamed, but the slug - which lists and code refer to - held.
		expect( await storedTypes( runPhp ) ).toEqual( [
			'featured',
			'staff-pick',
		] );

		await row( page, 'Staff Picks' )
			.getByRole( 'button', { name: 'Delete' } )
			.click();
		const confirm = page.getByRole( 'dialog', {
			name: 'Delete feature type',
		} );
		await expect( confirm ).toContainText( 'No post carries it' );
		await confirm.getByRole( 'button', { name: 'Delete' } ).click();

		await expect( row( page, 'Staff Picks' ) ).toHaveCount( 0 );
		expect( await storedTypes( runPhp ) ).toEqual( [ 'featured' ] );
	} );

	test( 'the routes refuse non-administrators and protect Featured', async ( {
		runPhp,
	} ) => {
		const result = await runPhp( `
			$call = function ( $method, $route, $params = array() ) {
				$request = new WP_REST_Request( $method, $route );
				foreach ( $params as $key => $value ) {
					$request->set_param( $key, $value );
				}
				return rest_get_server()->dispatch( $request )->get_status();
			};
			$featured = get_term_by( 'slug', 'featured', 'pts_feature_tax' );
			$route    = '/post-type-spotlight/v1/admin/feature-types';

			$editor = wp_insert_user( array( 'user_login' => 'pts-editor', 'user_pass' => wp_generate_password(), 'role' => 'editor', 'user_email' => 'pts-editor@example.com' ) );
			wp_set_current_user( $editor );
			$out = array(
				'editorList'   => $call( 'GET', $route ),
				'editorCreate' => $call( 'POST', $route, array( 'name' => 'Nope' ) ),
			);

			wp_set_current_user( 1 );
			$out['adminList']      = $call( 'GET', $route );
			$out['deleteFeatured'] = $call( 'DELETE', $route . '/' . $featured->term_id );
			$out['editFeatured']   = $call( 'POST', $route . '/' . $featured->term_id, array( 'name' => 'Renamed' ) );
			$out['blankName']      = $call( 'POST', $route, array( 'name' => '   ' ) );
			$out['blankSlug']      = $call( 'POST', $route, array( 'name' => 'Blank slug', 'slug' => '' ) );
			$out['duplicate']      = $call( 'POST', $route, array( 'name' => 'Blank slug' ) );
			$out['featuredSlug']   = get_term( $featured->term_id )->slug;
			echo wp_json_encode( $out );
		` );

		expect( JSON.parse( result ) ).toEqual( {
			editorList: 403,
			editorCreate: 403,
			adminList: 200,
			deleteFeatured: 403,
			editFeatured: 403,
			blankName: 400,
			// An empty slug is made from the name, not an error.
			blankSlug: 201,
			duplicate: 400,
			featuredSlug: 'featured',
		} );
	} );
} );
