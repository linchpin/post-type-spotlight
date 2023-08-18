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

			add_action( 'init', [ $this, 'filter_rest_query' ] );
			add_action( 'init', [ $this, 'block_init' ] );
			add_action( 'init', [ $this, 'block_scripts' ] );

			add_filter( 'pre_render_block', [ $this, 'pre_render_block' ], 999, 3 );

			// This is used to sort the featured posts first if selected in the block options
			add_filter('posts_orderby', [ $this, 'orderby_featured_first' ], 10, 2 );

		}


		/**
		 * @since 3.0.0
		 *
		 * @return void
		 */
		public function filter_rest_query() {

			$pts_settings = get_option( 'pts_featured_post_types_settings', array() );

			if ( ! is_array( $pts_settings ) ) {
				$pts_settings = [ $pts_settings ];
			}

			foreach ( $pts_settings as $post_type ) {
				add_filter( "rest_{$post_type}_query", [ $this, 'filter_request_by_query_type' ], 10, 2 );
			}

		}


		/**
		 * Callback to handle the custom query params. Updates the block editor.
		 *
		 * @see https://developer.wordpress.org/block-editor/how-to-guides/block-tutorial/extending-the-query-loop-block/
		 * @see https://github.com/ryanwelcher/advanced-query-loop/blob/trunk/includes/query-loop.php
		 *
		 * @param array           $args    The query args.
		 * @param WP_REST_Request $request The request object.
		 */
		public function add_custom_query_params( $args, $request ) {

			// Generate a new custom query with all potential query vars.
			$custom_args = [];

			$queryType = $request->get_param( 'queryType' );

			if ( $queryType ) {
				$custom_args['queryType'] = $queryType;
			}

			// Merge all queries.
			return array_merge(
				$args,
				array_filter( $custom_args )
			);

		}


		/**
		 * Before rendering our block on the front end change it up a bit.
		 *
		 * @since 3.0.0
		 *
		 * @param $pre_render
		 * @param $parsed_block
		 *
		 * @return mixed
		 */
		public function pre_render_block( $pre_render, $parsed_block ) {
			if ( isset( $parsed_block['attrs']['namespace'] ) && 'post-type-spotlight/featured-list' === $parsed_block['attrs']['namespace'] ) {

				// Hijack the global query. It's a hack, but it works.
				if ( true === $parsed_block['attrs']['query']['inherit'] ) {
					global $wp_query;
					$query_args = array_merge(
						$wp_query->query_vars,
						array(
							'posts_per_page' => $parsed_block['attrs']['query']['perPage'],
							'order'          => $parsed_block['attrs']['query']['order'],
							'orderby'        => $parsed_block['attrs']['query']['orderBy'],
						)
					);

					$wp_query = new \WP_Query( array_filter( $query_args ) );
				} else {
					add_filter(
						'query_loop_block_query_vars',
						function( $default_query ) use ( $parsed_block ) {
							$custom_query = $parsed_block['attrs']['query'];

							$featured_term = get_term_by('slug', 'featured', 'pts_feature_tax');
							// Generate a new custom query with all potential query vars.
							$custom_args = [];


							$queryType = $parsed_block['attrs']['query']['queryType'];

							$custom_args['tax_query'] = [
								[
									'taxonomy' => 'pts_feature_tax',
									'terms'    => [ $featured_term->term_id ],
									'operator' => 'IN',
									'include_children' => false,
								],
							];

							if ( $queryType === 'featured-exclude' ) {
								$custom_args['tax_query'][0]['operator'] = 'NOT IN';
							}

							if ( ! empty( $default_query['tax_query'] ) ) {

								foreach ( $default_query['tax_query'] as $index => $tax_query ) {
									if ( $tax_query['taxonomy'] === 'pts_feature_tax' ) {
										// If somehow they added the pts tax to their query, and it's a block remove
										// the default since the block does it already.
										unset( $default_query['tax_query'][ $index ] );
									}
								}

								if ( empty( $default_query['tax_query'] ) ) {
									unset( $default_query['tax_query'] );
								} else {

									$custom_tax_query = array_merge(
										$default_query['tax_query'],
										$custom_args['tax_query']
									);

								}
							}

							$data = array_merge(
								$default_query,
								$custom_args
							);

							if ( ! empty( $custom_tax_query ) ) {
								$data['tax_query'] = $custom_tax_query;
								if ( count( $custom_tax_query ) > 1 ) {
									$data['tax_query']['relation'] = 'AND';
								}
							}

							return $data;
						},
						10,
						2
					);
				}
			}

			return $pre_render;

		}

		/**
		 * When using PTS in the block editor, we need to filter the request
		 * to order the posts by displayType attribute.
		 *
		 * Only Show Featured
		 * Show Featured First
		 * Exclude Featured
		 *
		 * @param $args
		 * @param $request
		 *
		 * @return void
		 */
		public function filter_request_by_query_type(  $args, $request ) {
			$queryType = $request->get_param( 'queryType' );
			$custom_args = [];

			if ( ! empty( $queryType ) ) {

				if ( $queryType !== 'featured-first' ) {
					$custom_args[ 'tax_query' ] = [
						[
							'taxonomy'         => 'pts_feature_tax',
							'field'            => 'slug',
							'terms'            => [ 'featured' ],
							'operator'         => 'IN',
							'include_children' => false,
						],
					];
				}

				if ( $queryType === 'featured-exclude' ) {
					$custom_args['tax_query'][0]['operator'] = 'NOT IN';
				}
			}

			return array_merge( $args, $custom_args );

		}


		/**
		 * Alter the order by clause to sort featured posts first.
		 *
		 * @param $orderby
		 * @param $query
		 *
		 * @return mixed|string
		 */
		public function orderby_featured_first( $orderby, $query ) {

			global $wpdb;

			if ( ! isset( $_REQUEST['queryType'] ) ) {
				return $orderby;
			}

			if ( $_REQUEST['queryType'] !== 'featured-first' ) {
				return $orderby;
			}

			$term = get_term_by('slug', 'featured', 'pts_feature_tax' );

			// If the term doesn't exist or there's an error, just return the original orderby
			if ( false === $term || is_wp_error( $term ) ) {
				return $orderby;
			}

			// Add the custom sorting using the CASE statement directly in the ORDER BY clause
			$orderby = "
        CASE
            WHEN EXISTS (
                SELECT 1
                FROM {$wpdb->term_relationships}
                WHERE {$wpdb->term_relationships}.object_id = {$wpdb->posts}.ID
                AND {$wpdb->term_relationships}.term_taxonomy_id = {$term->term_taxonomy_id}
            )
            THEN 1
            ELSE 0
        END DESC, {$orderby}";

			return $orderby;
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
