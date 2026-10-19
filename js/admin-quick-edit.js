/**
 * Seed the Post Type Spotlight checkboxes when a Quick Edit row opens.
 *
 * WordPress' inline editor only copies core fields into the edit row, so the
 * current featured state and any other feature types are read from the hidden
 * marker rendered in the Featured column and applied to the checkboxes by hand.
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

		var $editRow = $( '#edit-' + postId );
		var $checkbox = $editRow.find( 'input[name="_pts_featured_post"]' );

		if ( ! $checkbox.length ) {
			return;
		}

		var $state = $( '#post-' + postId ).find( '.pts-featured-state' );

		$checkbox.prop( 'checked', 1 === parseInt( $state.data( 'ptsFeatured' ), 10 ) );

		// jQuery parses the JSON array in data-pts-feature-types for us.
		var featureTypes = $state.data( 'ptsFeatureTypes' );

		if ( ! Array.isArray( featureTypes ) ) {
			featureTypes = [];
		}

		$editRow.find( 'input[name="_pts_feature_types[]"]' ).each( function() {
			this.checked = -1 !== featureTypes.indexOf( this.value );
		} );
	};
} )( jQuery );
