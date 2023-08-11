<?php // phpcs:ignore WordPress.Files.FileName.InvalidClassFileName,

/**
 * Plugin Name: Post Type Spotlight
 * Plugin URI: https://wordpress.org/plugins/post-type-spotlight/
 * Description: Allows admin chosen post types to have a featured post check box on the edit screen. Also adds appropriate classes to front end post display, and allows featured posts to be queried via a taxonomy query.
 * Requires at least: 6.0
 * x-release-please-start-version
 * Version: 2.2.0
 * x-release-please-end
 * Author: Linchpin & Jonathan Desrosiers
 * Author URI: https://linchpin.com/?utm_source=post-type-spotlight&utm_medium=plugin-admin-page&utm_campaign=wp-plugin
 * License: GPLv2
 * Text Domain: post-type-spotlight
 * Domain Path: /languages
 */

// Make sure we don't expose any info if called directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Globals
 */

if ( ! defined( 'POST_TYPE_SPOTLIGHT_VERSION' ) ) {
	// x-release-please-start-version
	define( 'POST_TYPE_SPOTLIGHT_VERSION', '2.2.0' );
	// x-release-please-end
}

if ( ! defined( 'POST_TYPE_SPOTLIGHT_RELEASE_DATE' ) ) {
	define( 'POST_TYPE_SPOTLIGHT_RELEASE_DATE', '01/15/2020' );
}

// Define the main plugin file to make it easy to reference in subdirectories.
if ( ! defined( 'POST_TYPE_SPOTLIGHT_FILE' ) ) {
	define( 'POST_TYPE_SPOTLIGHT_FILE', __FILE__ );
}

if ( ! defined( 'POST_TYPE_SPOTLIGHT_PATH' ) ) {
	define( 'POST_TYPE_SPOTLIGHT_PATH', trailingslashit( __DIR__ ) );
}

if ( ! defined( 'POST_TYPE_SPOTLIGHT_PLUGIN_URL' ) ) {
	define( 'POST_TYPE_SPOTLIGHT_PLUGIN_URL', trailingslashit( plugin_dir_url( __FILE__ ) ) );
}

if ( ! defined( 'POST_TYPE_SPOTLIGHT_PLUGIN_NAME' ) ) {
	define( 'POST_TYPE_SPOTLIGHT_PLUGIN_NAME', esc_html__( 'Post Type Spotlight', 'post-type-spotlight' ) );
}

require_once 'class-post-type-spotlight.php';
require_once 'class-post-type-spotlight-block-editor.php';

new Post_Type_Spotlight();
new Post_Type_Spotlight_Block_Editor();
