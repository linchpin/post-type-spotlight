/**
 * Seed the Post Type Spotlight "Featured" checkbox when a Quick Edit row opens.
 *
 * WordPress' inline editor only copies core fields into the edit row, so the
 * current featured state is read from the hidden marker rendered in the
 * Featured column and applied to the checkbox by hand.
 *
 * @since 3.1.0
 */
( function( $ ) {
	'use strict';

	if ( 'undefined' === typeof window.inlineEditPost ) {
		return;
	}

	var wpInlineEdit = window.inlineEditPost.edit;

	window.inlineEditPost.edit = function( id ) {
		wpInlineEdit.apply( this, arguments );

		var postId = 0;

		if ( 'object' === typeof id ) {
			postId = parseInt( this.getId( id ), 10 );
		}

		if ( ! postId ) {
			return;
		}

		var $checkbox = $( '#edit-' + postId ).find( 'input[name="_pts_featured_post"]' );

		if ( ! $checkbox.length ) {
			return;
		}

		var featured = $( '#post-' + postId ).find( '.pts-featured-state' ).data( 'ptsFeatured' );

		$checkbox.prop( 'checked', 1 === parseInt( featured, 10 ) );
	};
} )( jQuery );
