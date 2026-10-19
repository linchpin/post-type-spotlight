<?php
/**
 * Template tags for themes and other plugins.
 *
 * @package post-type-spotlight
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'post_type_spotlight_is_featured' ) ) {

	/**
	 * Whether a post is featured, or carries another feature type.
	 *
	 * A wrapper for has_term() against the hidden `pts_feature_tax` taxonomy,
	 * so callers do not need to know how featured state is stored. Like
	 * is_sticky(), it reads the current post in the loop when given none.
	 * Pass a feature type's slug to ask about that type instead of `featured`.
	 *
	 * Returns false rather than an error for a missing post or for a site where
	 * no post type has been enabled yet, which leaves the taxonomy unregistered.
	 *
	 * @since 3.2.0
	 *
	 * @param int|WP_Post|null $post         Optional. Post ID or object. Defaults to the current post.
	 * @param string           $feature_type Optional. Slug of the feature type to check. Default 'featured'.
	 * @return bool Whether the post carries that feature type.
	 */
	function post_type_spotlight_is_featured( $post = null, $feature_type = 'featured' ) {
		return has_term( $feature_type, 'pts_feature_tax', $post );
	}
}

if ( ! function_exists( 'post_type_spotlight_get_feature_types' ) ) {

	/**
	 * Every feature type on the site, with `featured` first.
	 *
	 * A feature type is a term in `pts_feature_tax`. `featured` is the one the
	 * plugin creates and every screen was built around, so it always leads;
	 * the rest follow by name.
	 *
	 * @since 3.2.0
	 *
	 * @return WP_Term[] The feature types. Empty when the taxonomy is not registered.
	 */
	function post_type_spotlight_get_feature_types() {
		if ( ! taxonomy_exists( 'pts_feature_tax' ) ) {
			return array();
		}

		$terms = get_terms(
			array(
				'taxonomy'   => 'pts_feature_tax',
				'hide_empty' => false,
				'orderby'    => 'name',
			)
		);

		if ( is_wp_error( $terms ) ) {
			return array();
		}

		$featured = array();
		$others   = array();

		foreach ( $terms as $term ) {
			if ( 'featured' === $term->slug ) {
				$featured[] = $term;
			} else {
				$others[] = $term;
			}
		}

		return array_merge( $featured, $others );
	}
}
