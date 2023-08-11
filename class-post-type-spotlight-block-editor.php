<?php // phpcs:ignore WordPress.Files.FileName.InvalidClassFileName

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'Post_Type_Spotlight_Block_Editor' ) ) {

	/**
	 * Post_Type_Spotlight class.
	 */
	class Post_Type_Spotlight_Block_Editor {


		public function __construct() {
			add_action( 'init', [ $this, 'block_init' ] );
			add_action( 'init', [ $this, 'block_scripts' ] );

		}


		/**
		 * Register our plugin scripts
		 *
		 * @since 0.1.0
		 *
		 * @return void
		 */
		public function block_scripts() {
			$script_asset_path = POST_TYPE_SPOTLIGHT_PATH . 'blocks/build/index.asset.php';

			if ( ! file_exists( $script_asset_path ) ) {
				throw new \Error(
					$script_asset_path . ' Missing: You need to run `npm start` or `npm run build` for the "post-type-spotlight/blocks" script first.'
				);
			}

			$index_js      = POST_TYPE_SPOTLIGHT_PLUGIN_URL . 'blocks/build/index.js';

			$script_asset = require $script_asset_path;

			$dependencies = array_merge(
				$script_asset['dependencies'],
				[
					'wp-edit-post',
				]
			);

			wp_register_script(
				'post-type-spotlight-block-editor',
				$index_js,
				$dependencies,
				$script_asset['version'],
				true
			);

			wp_enqueue_script( 'post-type-spotlight-block-editor' );

		}


		/**
		 * Registers the block using the metadata loaded from the `block-{type}.json` file.
		 * Behind the scenes, it registers also all assets so they can be enqueued
		 * through the block editor in the corresponding context.
		 *
		 * Each block registered within the \Blocks namespace for examples
		 * @see https://developer.wordpress.org/block-editor/how-to-guides/block-tutorial/writing-your-first-block-type/
		 *
		 * @since 0.2.1
		 */
		public function block_init() {
			$blocks = [];

			$blocks = apply_filters( 'post_type_spotlight', $blocks );

			if ( empty( $blocks ) ) {
				return;
			}

			foreach ( $blocks as $block_key => $block_args ) {
				$block_path = trailingslashit( POST_TYPE_SPOTLIGHT_PATH ) . "blocks/build/blocks/{$block_key}/block.json";

				if ( file_exists( $block_path ) ) {
					register_block_type( $block_path, $block_args );
				} else {
					wp_die( esc_html( 'could not find file: ' . $block_path ) );
				}
			}

		}
	}

}
