# Frequently Asked Questions #

## Isn't this the same as sticky posts? ##

This is not the same as sticky posts. Sticky functionality can only be applied to the core 'post' post type. [More information on why](http://core.trac.wordpress.org/ticket/12702#comment:28 "Custom Post Types and Sticky Posts")

## How do I find just my featured posts? ##

This snippet of code will fetch the 10 most recent posts that are featured.
`<?php
	$featured_posts = new WP_Query( array(
		'post_type' => 'post',
		'posts_per_page' => 10,
		'tax_query' => array(
			array(
				'taxonomy' => 'pts_feature_tax',
				'field' => 'slug',
				'terms' => array( 'featured' ),
			)
		)
	) );

	if ( $featured_posts->have_posts() ) : while ( $featured_posts->have_posts() ) : $featured_posts->the_post();

		//output featured posts here

	endwhile; endif;
?>`
