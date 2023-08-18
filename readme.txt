=== Post Type Spotlight ===
Contributors: linchpin_agency, desrosj, aware
Tags: featured, post type, sticky, posts, custom post types
Requires at least: 5.1.0
Tested up to: 6.3
Stable tag: 3.0.0
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Easily allows you to designate posts, pages, attachments and custom post types as featured.

== Description ==

The plugin displays a checkbox in the publish meta box to feature a post. The checkbox only appears on admin selected post types which can be selected in the Settings->Writing screen.

When a post is designated as featured:

*   It receives 'featured' and `featured-{$posttype}` classes via the post_class filter.
*   Shows featured posts as such in the post type's admin screen
*   Assigns a post a hidden taxonomy term (featured) that can easily be queried.

*Note: For the plugin to work on attachments, you must be using 3.5 or above. All other features will work on 3.1.0 and up.*

== Installation ==

1. Upload the plugin folder to the `/wp-content/plugins/` directory
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Navigate to the Settings->Writing section and select the post types you would like to have the featured abilities.

== Frequently Asked Questions ==

= Isn't this the same as sticky posts? =

This is not the same as sticky posts. Sticky functionality can only be applied to the core 'post' post type. [More information on why](http://core.trac.wordpress.org/ticket/12702#comment:28 "Custom Post Types and Sticky Posts")

= How do I find just my featured posts? =

This snippet of code will fetch the 10 most recent posts that are featured.

``<?php
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
?>``

== Screenshots ==

1. The publish area with the featured toggle.
2. The featured list block
3. The settings page
4. Options on the edit screen
5. Markup example when using `post_class();`
6. Classic Editor Checkbox Toggle

== Changelog ==

= 3.0.0 =

* Improved compatibility with the Block Editor and the enhancements it brings
* Added npm as base package manager
* Added ESLint for JS linting
* Added Stylelint for CSS linting
* Added EditorConfig for consistent coding styles
* Added Husky for pre-commit hooks
* Added Prettier for code formatting
* Added PHPCS for PHP linting
* Added WPCS for WordPress PHP linting
* Added Composer for PHP package management
* Added wp-scripts for WordPress build scripts
* Added webpack for JS module bundling
* Added a new Featured Posts Variation of the Query Loop
* Added the ability to filter teh Featured Posts Query Loop to only show featured posts
* Added the ability to filter the Featured Posts Query Loop to show all posts excluding featured posts
* Added the ability to filter the Featured Posts Query Loop to show all posts and show featured posts first (similar to sticky)
* Added the ability to sort post lists by featured posts.
* Removed Babel for js transpiling as it wasn't needed any more
* Removed Yarn as package manager
* Removed Gulp as build tool
* Numerous bug fixes, minor security updates within build process (non frontend facing) and improvements

= 2.2.0 =
* Updated the build process
* Updated PHPCS and WPCS
* Updated Branding
* Updated readme by making it more readable
* Added Gutenberg/Block Editor support

= 2.1.5 =
* Add support for translate.wordpress.org.

= 2.1.4 =
* Don't show the featured taxonomy on nav menu edit areas.

= 2.1.3 =
* Fix another potential PHP notice.

= 2.1.2 =
* Fix PHP warning when checking for the old method of querying for featured posts.

= 2.1.1 =
* Fix deprecated widget instantiation method.

= 2.1 =
* Don't erase other terms in the pts_feature_tax assigned to the post on save. This opens up potential to have more than one type of "featured", (e.g. recommended).

= 2.0 =
* Changing how featured posts are designated. Instead of post meta, the plugin now uses a hidden taxonomy.
* Added a widget for showing featured posts.
* Fixed the post_class filter to work properly on secondary loops.
* Fixed bug where the featured column would not show when viewing Media in the admin with list view.
* Fixed bug where saving settings did not always work.
* Changed the featured star in the admin to use the WordPress Dashicon font.

= 1.0 =
* Hello world!
* Add settings to the Settings->Writing page allowing admins to select the post types that can be featured.
* Add a check box in the publish meta box for marking a post as featured.
* Featured posts receive a featured and featured-{$posttype} class on them via the post_class filter.
* Admin post type screens have a column for Featured noting which posts are in fact featured.
