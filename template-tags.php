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
	 * Whether a post is featured.
	 *
	 * A wrapper for has_term() against the hidden `pts_feature_tax` taxonomy,
	 * so callers do not need to know how featured state is stored. Like
	 * is_sticky(), it reads the current post in the loop when given none.
	 *
	 * Returns false rather than an error for a missing post or for a site where
	 * no post type has been enabled yet, which leaves the taxonomy unregistered.
	 *
	 * @since 3.2.0
	 *
	 * @param int|WP_Post|null $post Optional. Post ID or object. Defaults to the current post.
	 * @return bool Whether the post carries the featured term.
	 */
	function post_type_spotlight_is_featured( $post = null ) {
		return has_term( 'featured', 'pts_feature_tax', $post );
	}
}
