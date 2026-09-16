<?php // phpcs:ignore WordPress.Files.FileName.InvalidClassFileName

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'Post_Type_Spotlight_Block_Editor' ) ) {

	/**
	 * Post_Type_Spotlight class.
	 */
	class Post_Type_Spotlight_Block_Editor {

		/**
		 * Namespace of the Query Loop variation this plugin registers.
		 *
		 * Mirrors `VARIATION_NAME` in blocks/src/query-loop/constants.js.
		 *
		 * @since 3.2.0
		 * @var string
		 */
		const VARIATION_NAMESPACE = 'post-type-spotlight/featured-list';

		/**
		 * Query types the variation's Spotlight control can write.
		 *
		 * Mirrors the `QUERY_TYPES` export in blocks/src/query-loop/constants.js.
		 * Anything outside this list is ignored rather than trusted, because the
		 * value arrives either from saved block markup or from an unregistered
		 * REST parameter - neither of which WordPress validates for us.
		 *
		 * @since 3.2.0
		 * @var string[]
		 */
		const QUERY_TYPES = [ 'featured-only', 'featured-first', 'featured-exclude' ];

		/**
		 * WP_Query argument that asks for featured posts to be sorted first.
		 *
		 * WP_Query keeps query vars it does not recognise, so this travels from
		 * wherever the query is built through to the `posts_orderby` filter that
		 * acts on it. That is what lets one flag serve both the front end and the
		 * editor preview, which build their queries by completely different routes.
		 *
		 * @since 3.2.0
		 * @var string
		 */
		const FEATURED_FIRST_QUERY_VAR = 'pts_featured_first';

		public function __construct() {

			add_action( 'init', [ $this, 'filter_rest_query' ] );
			add_action( 'init', [ $this, 'block_init' ] );
			add_action( 'enqueue_block_editor_assets', [ $this, 'block_scripts' ] );

			// Front end: apply the variation's query type where core builds the
			// Query Loop's WP_Query arguments.
			add_filter( 'render_block_data', [ $this, 'force_custom_query' ] );
			add_filter( 'query_loop_block_query_vars', [ $this, 'filter_query_loop_block_query_vars' ], 10, 2 );

			// Both ends: "Featured first" is a sort order rather than a filter.
			add_filter( 'posts_orderby', [ $this, 'orderby_featured_first' ], 10, 2 );

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
		 * Apply a Spotlight query type to a set of WP_Query arguments.
		 *
		 * The single place the three query types are turned into query arguments,
		 * shared by the front end and the editor preview so the two cannot drift.
		 *
		 * @since 3.2.0
		 *
		 * @param array  $args       WP_Query arguments to add to.
		 * @param string $query_type One of self::QUERY_TYPES. Anything else is ignored.
		 *
		 * @return array The arguments, filtered if the query type was one we handle.
		 */
		private function apply_query_type( $args, $query_type ) {

			if ( ! in_array( $query_type, self::QUERY_TYPES, true ) ) {
				return $args;
			}

			/*
			 * "Featured first" reorders the result set rather than narrowing it:
			 * every post still belongs in it. So it adds no taxonomy clause and
			 * instead flags the query for orderby_featured_first() below.
			 */
			if ( 'featured-first' === $query_type ) {
				$args[ self::FEATURED_FIRST_QUERY_VAR ] = true;

				return $args;
			}

			$clause = [
				'taxonomy'         => 'pts_feature_tax',
				'field'            => 'slug',
				'terms'            => [ 'featured' ],
				'operator'         => 'featured-exclude' === $query_type ? 'NOT IN' : 'IN',
				'include_children' => false,
			];

			$existing = isset( $args['tax_query'] ) && is_array( $args['tax_query'] )
				? array_filter( $args['tax_query'] )
				: [];

			/*
			 * Nest rather than append. Core hands us a flat list of clauses for
			 * most queries, but once post formats are involved it hands us a
			 * nested one with its own relation; appending to that would bolt this
			 * clause onto whichever group happened to be last. Wrapping leaves
			 * whatever core built intact and ANDs this on top of it.
			 */
			$args['tax_query'] = empty( $existing )
				? [ $clause ]
				: [
					'relation' => 'AND',
					$existing,
					[ $clause ],
				];

			return $args;
		}


		/**
		 * Keep the Featured List variation on its own query.
		 *
		 * An inherited query is the one the template already ran, which core
		 * renders straight from the global `WP_Query` without ever calling
		 * `build_query_vars_from_query_block()` - so `query_loop_block_query_vars`
		 * never fires and the featured filter has nowhere to apply. The variation
		 * does not offer the Query type control for that reason, but core's
		 * Settings panel has a Reset all button that sets `inherit` back to true
		 * regardless, and with the control hidden there would be no way back.
		 *
		 * Forcing it false here means a Featured List keeps listing featured posts
		 * whatever state its markup is in. `render_block_data` is the right place
		 * because it runs before the block's context is assembled from these same
		 * attributes, so the Post Template downstream sees the corrected value.
		 *
		 * @since 3.2.0
		 *
		 * @param array $parsed_block The block about to be rendered.
		 *
		 * @return array The block, with an inherited query turned off if it is ours.
		 */
		public function force_custom_query( $parsed_block ) {

			if ( ! isset( $parsed_block['attrs']['namespace'] ) || self::VARIATION_NAMESPACE !== $parsed_block['attrs']['namespace'] ) {
				return $parsed_block;
			}

			// `attrs` is whatever JSON the block comment carried, so `query` is
			// only an array by convention. Writing an offset into a string is a
			// fatal in PHP 8.
			if ( isset( $parsed_block['attrs']['query'] ) && ! is_array( $parsed_block['attrs']['query'] ) ) {
				return $parsed_block;
			}

			$parsed_block['attrs']['query']['inherit'] = false;

			return $parsed_block;
		}


		/**
		 * Filter the front end Query Loop by the block's Spotlight query type.
		 *
		 * The query type travels in the block's `query` attribute, which core
		 * passes down to the Post Template as block context - so it is readable
		 * here without the block having to be inspected directly.
		 *
		 * Registered once, on every Query Loop, and keyed off that context. The
		 * previous approach added this filter from `pre_render_block` and never
		 * removed it, so once a page contained one Featured List every Query Loop
		 * rendered after it was filtered down to featured posts too.
		 *
		 * @since 3.2.0
		 *
		 * @param array    $query The query arguments core built for the block.
		 * @param WP_Block $block The Post Template block being rendered.
		 *
		 * @return array The query arguments.
		 */
		public function filter_query_loop_block_query_vars( $query, $block ) {

			$query_type = isset( $block->context['query']['queryType'] )
				? $block->context['query']['queryType']
				: '';

			if ( ! is_string( $query_type ) ) {
				return $query;
			}

			return $this->apply_query_type( $query, $query_type );
		}


		/**
		 * Filter the editor preview by the block's Spotlight query type.
		 *
		 * Core forwards any key it does not recognise in the block's `query`
		 * attribute to the REST request that draws the preview, so `queryType`
		 * arrives as a request parameter. It is not a registered parameter, which
		 * means WordPress neither validates nor sanitises it - apply_query_type()
		 * only acts on values it recognises, and sanitize_key() keeps anything
		 * unexpected from reaching it in the first place.
		 *
		 * @since 3.0.0
		 *
		 * @param array           $args    The query arguments.
		 * @param WP_REST_Request $request The request object.
		 *
		 * @return array The query arguments.
		 */
		public function filter_request_by_query_type( $args, $request ) {

			$query_type = $request->get_param( 'queryType' );

			if ( ! is_string( $query_type ) ) {
				return $args;
			}

			return $this->apply_query_type( $args, sanitize_key( $query_type ) );
		}


		/**
		 * Sort featured posts to the top of a query that asked for it.
		 *
		 * Runs on every query, so it returns untouched unless the query carries
		 * the flag apply_query_type() sets.
		 *
		 * @since 3.0.0
		 *
		 * @param string   $orderby The ORDER BY clause built so far.
		 * @param WP_Query $query   The query being run.
		 *
		 * @return string The ORDER BY clause.
		 */
		public function orderby_featured_first( $orderby, $query ) {

			if ( ! $query->get( self::FEATURED_FIRST_QUERY_VAR ) ) {
				return $orderby;
			}

			$term = get_term_by( 'slug', 'featured', 'pts_feature_tax' );

			if ( ! $term instanceof WP_Term ) {
				return $orderby;
			}

			global $wpdb;

			// EXISTS evaluates to 1 or 0, so sorting on it descending puts the
			// featured posts above everything else and leaves the order core
			// asked for to break the tie within each group.
			$featured_first = $wpdb->prepare(
				"EXISTS (
					SELECT 1
					FROM {$wpdb->term_relationships}
					WHERE {$wpdb->term_relationships}.object_id = {$wpdb->posts}.ID
					AND {$wpdb->term_relationships}.term_taxonomy_id = %d
				) DESC",
				$term->term_taxonomy_id
			);

			// An `orderby` of `none` leaves this empty, and a trailing comma
			// would be a syntax error.
			return '' === trim( (string) $orderby ) ? $featured_first : "{$featured_first}, {$orderby}";
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
					esc_html( $script_asset_path ) . ' Missing: You need to run `npm start` or `npm run build` for the "post-type-spotlight/blocks" script first.'
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

			$this->block_styles();
		}

		/**
		 * Put the Spotlight row on the same rhythm as the rows above it.
		 *
		 * PluginPostStatusInfo wraps every fill in a PanelRow, so the Spotlight
		 * row arrives in the Summary panel inside a `.components-panel__row`
		 * that the core rows - Status, Publish, Slug, Author, Template,
		 * Discussion, Format - do not have. That wrapper carries `margin-top:
		 * 8px` and `min-height: 36px`, which is 9px more than the 4px the panel
		 * stack already puts between its rows, and reads as the Spotlight row
		 * having drifted away from the group.
		 *
		 * Zeroing the wrapper hands layout back to the `editor-post-panel__row`
		 * inside it, which is the same element core uses, so the row lands on
		 * the stack gap like everything else.
		 *
		 * Registered against a handle with no source because these few rules do
		 * not warrant a stylesheet, a build entry or a second HTTP request; the
		 * `false` source is the documented way to attach inline CSS on its own.
		 *
		 * @since 3.1.0
		 *
		 * @return void
		 */
		private function block_styles() {

			wp_register_style( 'post-type-spotlight-block-editor', false, [], POST_TYPE_SPOTLIGHT_VERSION );
			wp_enqueue_style( 'post-type-spotlight-block-editor' );

			wp_add_inline_style(
				'post-type-spotlight-block-editor',
				'.components-panel__row.pts-post-settings-panel{display:block;margin-top:0;min-height:0}'
			);
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
