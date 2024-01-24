<?php // phpcs:ignore WordPress.Files.FileName.InvalidClassFileName

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'Post_Type_Spotlight' ) ) {

	/**
	 * Post_Type_Spotlight class.
	 */
	class Post_Type_Spotlight {

		private $doing_upgrades;

		/**
		 * Post_Type_Spotlight constructor.
		 */
		public function __construct() {
			add_action( 'plugins_loaded', array( $this, 'plugins_loaded' ) );
			add_action( 'init', array( $this, 'init' ) );
			add_action( 'widgets_init', array( $this, 'widgets_init' ) );

			add_action( 'admin_init', array( $this, 'admin_init' ) );
			add_action( 'admin_init', array( $this, 'register_api_settings' ) );
			add_action( 'rest_api_init', array( $this, 'register_api_settings' ) );

			add_action( 'add_meta_boxes', array( $this, 'add_meta_boxes' ) );
			add_action( 'save_post', array( $this, 'save_post' ) );
			add_action( 'edit_attachment', array( $this, 'save_post' ) );
			add_action( 'pre_get_posts', array( $this, 'pre_get_posts' ), 999 );

			add_filter( 'post_class', array( $this, 'post_class' ), 10, 3 );


			$this->doing_upgrades = false;

		}


		/**
		 * @since 2.3.0
		 */
		public function enqueue_block_editor_scripts() {

			$asset_file = include POST_TYPE_SPOTLIGHT_PATH . 'build/index.asset.php';

			wp_enqueue_script(
				'post-type-spotlight',
				plugins_url( 'build/index.js', POST_TYPE_SPOTLIGHT_FILE ),
				array_merge( $asset_file['dependencies'], array( 'wp-plugins', 'wp-edit-post', 'wp-element', 'wp-plugins', 'wp-i18n', 'wp-components' ) ),
				$asset_file['version'],
				true
			);

			$post_types = get_option( 'pts_featured_post_types_settings', array() );

			$data = array( 'post_types' => (array) $post_types );

			wp_localize_script( 'post-type-spotlight', 'pts_data', $data );
		}

		/**
		 * Setup our text domain after plugins are confirmed loaded
		 */
		public function plugins_loaded() {
			load_plugin_textdomain(
				'post-type-spotlight',
				false,
				POST_TYPE_SPOTLIGHT_PATH . 'languages/'
			);
		}

		/**
		 * init function.
		 *
		 * @access public
		 * @return void
		 */
		public function init() {
			$post_types = get_option( 'pts_featured_post_types_settings', array() );

			if ( ! empty( $post_types ) ) {

				// Add new taxonomy, make it hierarchical (like categories)
				$labels = array(
					'name'              => _x( 'Post Type Spotlight', 'taxonomy general name', 'post-type-spotlight' ),
					'singular_name'     => _x( 'Post Type Spotlight', 'taxonomy singular name', 'post-type-spotlight' ),
					'search_items'      => __( 'Search Featured', 'post-type-spotlight' ),
					'all_items'         => __( 'All Featured', 'post-type-spotlight' ),
					'parent_item'       => __( 'Parent Featured', 'post-type-spotlight' ),
					'parent_item_colon' => __( 'Parent Featured:', 'post-type-spotlight' ),
					'edit_item'         => __( 'Edit Featured', 'post-type-spotlight' ),
					'update_item'       => __( 'Update Featured', 'post-type-spotlight' ),
					'add_new_item'      => __( 'Add New Featured', 'post-type-spotlight' ),
					'new_item_name'     => __( 'New Featured Name', 'post-type-spotlight' ),
					'menu_name'         => __( 'Post Type Spotlight', 'post-type-spotlight' ),
				);

				register_taxonomy(
					'pts_feature_tax',
					$post_types,
					array(
						'labels'             => $labels,
						'hierarchical'       => false,
						'show_ui'            => false,
						'query_var'          => false,
						'rewrite'            => false,
						'show_in_rest'       => true,
						'show_admin_column'  => false,
						'show_in_nav_menus'  => false,
						'show_in_quick_edit' => false,
					)
				);
			}
		}

		/**
		 * widgets_init function.
		 *
		 * @access public
		 * @return void
		 */
		public function widgets_init() {
			require_once POST_TYPE_SPOTLIGHT_PATH . 'class-pts-featured-posts-widget.php';

			if ( class_exists( 'PTS_Featured_Posts_Widget' ) ) {
				register_widget( 'PTS_Featured_Posts_Widget' );
			}
		}


		/**
		 * Check if the taxonomy term is created, if not create it
		 *
		 * Since 2.3.0
		 *
		 * @return void
		 */
		public function check_if_term_exists() {

			if ( taxonomy_exists( 'pts_feature_tax' ) ) {

				$term = term_exists( 'featured', 'pts_feature_tax' );

				// If the term doesn't exist, insert it
				if ( 0 === $term || null === $term ) {
					wp_insert_term(
							'featured', // the term
							'pts_feature_tax', // the taxonomy
							[
									'description' => __( 'Featured term, used by PTS', 'post-type-spotlight' ),
									'slug'        => 'featured',
							]
					);
				}

			}

		}

		public function register_api_settings() {
			register_setting(
					'writing',
					'pts_featured_post_types_settings',
					[
							'type'         => 'array',
							'show_in_rest' => [
								'schema' => [
										'type' => 'array',
										'items' => [
												'type' => 'string',
										],
								],
							],
							'sanitize_callback' => [ $this, 'sanitize_settings' ],
					]
			);
		}


		/**
		 * admin_init function.
		 *
		 * @access public
		 * @return void
		 */
		public function admin_init() {
			$this->check_for_updates();
			$this->check_if_term_exists();

			// Add a section for the plugin's settings on the writing page.
			add_settings_section( 'pts_featured_posts_settings_section', __( 'Featured Post Types', 'post-type-spotlight' ), array( $this, 'settings_section_text' ), 'writing' );

			// For each post type add a settings field, excluding revisions and nav menu items.
			if ( $post_types = get_post_types() ) { // phpcs:ignore WordPress.CodeAnalysis.AssignmentInCondition.Found
				foreach ( $post_types as $post_type ) {
					$pt = get_post_type_object( $post_type );

					if ( in_array( $post_type, array( 'revision', 'nav_menu_item' ), true ) || ! $pt->public ) {
						continue;
					}

					add_settings_field(
						'pts_featured_post_types' . $post_type,
						$pt->labels->name,
						array( $this, 'featured_post_types_field' ),
						'writing',
						'pts_featured_posts_settings_section',
						array(
							'slug' => $pt->name,
							'name' => $pt->labels->name,
						)
					);
				}
			}

			if ( $featured_pts = get_option( 'pts_featured_post_types_settings' ) ) {
				foreach ( $featured_pts as $pt ) {
					if ( 'attachment' === $pt ) {
						add_filter( 'manage_media_columns', array( $this, 'manage_posts_columns' ), 999 );
						add_action( 'manage_media_custom_column', array( $this, 'manage_posts_custom_column' ), 10, 2 );
					} else {
						add_filter( 'manage_' . $pt . '_posts_columns', array( $this, 'manage_posts_columns' ), 999 );
						add_action( 'manage_' . $pt . '_posts_custom_column', array( $this, 'manage_posts_custom_column' ), 10, 2 );
						add_filter( 'views_edit-' . $pt, array( $this, 'views_addition' ) );
					}
				}
			}


		}

		/**
		 * Check if there are any updates to perform.
		 *
		 * @access public
		 * @return void
		 */
		public function check_for_updates() {
			$version = get_option( 'pts_version' );

			// If there is no version, it is a version 2.0 upgrade
			if ( empty( $version ) && ! $this->doing_upgrades ) {

				$this->doing_upgrades = true;

				$args = array(
					'post_type'      => get_post_types(),
					'posts_per_page' => 100,
					'offset'         => 0,
					'post_status'    => 'any',
					'meta_query'     => array(
						array(
							'key' => '_pts_featured_post',
						),
					),
					'cache_results'  => false,
				);

				$featured_posts = new WP_Query( $args );

				while ( $featured_posts->have_posts() ) {
					foreach ( $featured_posts->posts as $post ) {
						wp_set_object_terms( $post->ID, array( 'featured' ), 'pts_feature_tax', false );
						delete_post_meta( $post->ID, '_pts_featured_post' );
					}

					$args['offset'] = $args['offset'] + $args['posts_per_page'];
					$featured_posts = new WP_Query( $args );
				}

				update_option( 'pts_version', '2.0.0' );

				$this->doing_upgrades = false;
			}
		}

		/**
		 * settings_section_text function.
		 *
		 * @access public
		 * @return void
		 */
		public function settings_section_text() {
			global $new_whitelist_options;
			?>
			<p>
				<?php esc_html_e( 'Select which post types can be featured.', 'post-type-spotlight' ); ?>
			</p>
			<?php
		}

		/**
		 * featured_post_types_field function.
		 *
		 * @access public
		 * @param mixed $args
		 * @return void
		 */
		public function featured_post_types_field( $args ) {
			$settings = get_option( 'pts_featured_post_types_settings', array() );

			if ( $post_types = get_post_types() ) { ?>
				<input type="checkbox" name="pts_featured_post_types[]" id="pts_featured_post_types_<?php echo esc_attr( $args['slug'] ); ?>" value="<?php echo esc_attr( $args['slug'] ); ?>" <?php in_array( $args['slug'], $settings, true ) ? checked( true ) : checked( false ); ?>/>
				<?php
			}
		}

		/**
		 * sanitize_settings function.
		 *
		 * @access public
		 * @param  mixed $input
		 * @return mixed
		 */
		public function sanitize_settings( $input ) {
			$input = wp_parse_args( $_POST['pts_featured_post_types'], array() );

			$new_input = array();

			foreach ( $input as $pt ) {
				if ( post_type_exists( sanitize_text_field( $pt ) ) ) {
					$new_input[] = sanitize_text_field( $pt );
				}
			}

			return $new_input;
		}

		/**
		 * add_meta_boxes function.
		 *
		 * @access public
		 * @param mixed $post_type
		 * @return void
		 */
		public function add_meta_boxes( $post_type ) {
			$settings = get_option( 'pts_featured_post_types_settings', array() );

			if ( empty( $settings ) ) {
				return;
			}

			if ( in_array( $post_type, $settings, true ) ) {

				if ( 'attachment' === $post_type ) {
					add_action( 'attachment_submitbox_misc_actions', array( $this, 'post_submitbox_misc_actions' ) );
				} else {
					add_action( 'post_submitbox_misc_actions', array( $this, 'post_submitbox_misc_actions' ) );
				}
			}
		}

		/**
		 * post_submitbox_misc_actions function.
		 *
		 * @access public
		 * @return void
		 */
		public function post_submitbox_misc_actions() {
			global $post;
			$pt = get_post_type_object( $post->post_type );

			wp_nonce_field( '_pts_featured_post_nonce', '_pts_featured_post_noncename' );
			?>
			<div class="misc-pub-section lp-featured-post">
				<span>
					<?php echo esc_html( apply_filters( 'pts_featured_checkbox_text', 'Feature this ' . $pt->labels->singular_name . ':', $post ) ); ?></span>&nbsp
					<input type="checkbox" name="_pts_featured_post" id="_pts_featured_post" <?php checked( has_term( 'featured', 'pts_feature_tax', $post->ID ) ); ?> />
			</div>
			<?php
		}

		/**
		 * Add a column for the featured icon
		 *
		 * @param $columns
		 * @return array
		 */
		public function manage_posts_columns( $columns ) {

			unset( $columns['date'] );

			return array_merge(
				$columns,
				array(
					'lp-featured' => esc_html__( 'Featured', 'post-type-spotlight' ),
					'date'        => esc_html__( 'Date', 'post-type-spotlight' ),
				)
			);
		}

		/**
		 * manage_posts_custom_column function.
		 *
		 * @access public
		 * @param mixed $column
		 * @param mixed $post_id
		 * @return void
		 */
		public function manage_posts_custom_column( $column, $post_id ) {
			switch ( $column ) {
				case 'lp-featured':
					if ( has_term( 'featured', 'pts_feature_tax', $post_id ) ) {
						echo '<span class="dashicons dashicons-star-filled"></span>';
					}
					break;
			}
		}

		/**
		 * pre_get_posts function.
		 *
		 * @access public
		 * @return void
		 */
		public function pre_get_posts( $query ) {

			if ( $this->doing_upgrades ) {
				return;
			}

			$version = get_option( 'pts_version' );

			if ( empty( $version ) || version_compare( $version, '2.0.0' ) == -1 ) {
				return;
			}

			if ( ! empty( $query->query_vars['meta_query'] ) ) {
				foreach ( $query->query_vars['meta_query'] as $key => $meta_query ) {
					if ( ! empty( $meta_query['key'] ) && '_pts_featured_post' === $meta_query['key'] ) {
						$query->query_vars['tax_query'][] = [
								'taxonomy' => 'pts_feature_tax',
								'field'    => 'slug',
								'terms'    => [ 'featured' ],
						];

						unset( $query->query_vars['meta_query'][ $key ] );
						_deprecated_argument( 'WP_Query()', '2.0 of the Post Type Spotlight plugin', 'The _pts_featured_post post meta field has been removed. Please see https://wordpress.org/plugins/post-type-spotlight/faq/ for more info.' );
					}
				}
			}
		}

		/**
		 * views_addition function.
		 *
		 * @access public
		 * @param  mixed $views
		 * @return mixed
		 */
		public function views_addition( $views ) {
			$featured = new WP_Query(
				array(
					'post_type'      => get_post_type(),
					'posts_per_page' => 1,
					'tax_query'      => array(
						array(
							'taxonomy' => 'pts_feature_tax',
							'field'    => 'slug',
							'terms'    => array( 'featured' ),
						),
					),
				)
			);

			if ( $featured->have_posts() ) {
				$count = $featured->found_posts;
			} else {
				$count = 0;
			}

			$link = '<a href="edit.php?post_type=' . get_post_type() . '&pts_feature_tax=featured"';

			if ( isset( $_GET['pts_feature_tax'] ) && 'featured' === $_GET['pts_feature_tax'] ) {
				$link .= ' class="current"';
			}

			$link .= '>Featured</a> <span class="count">(' . $count . ')</span>';

			return array_merge( $views, array( 'featured' => $link ) );
		}

		/**
		 * save_post function.
		 *
		 * @access public
		 * @param mixed $post_id
		 * @return void
		 */
		public function save_post( $post_id ) {
			// Skip revisions and autosaves.
			if ( wp_is_post_revision( $post_id ) || ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) || ( defined( 'DOING_AJAX' ) && DOING_AJAX ) ) {
				return;
			}

			// Users should have the ability to edit listings.
			if ( ! current_user_can( 'edit_post', $post_id ) ) {
				return;
			}

			if ( isset( $_POST['_pts_featured_post_noncename'] ) && wp_verify_nonce( $_POST['_pts_featured_post_noncename'], '_pts_featured_post_nonce' ) ) {

				if ( isset( $_POST['_pts_featured_post'] ) && ! empty( $_POST['_pts_featured_post'] ) ) {
					delete_post_meta( $post_id, '_pts_featured_post' );
					wp_set_object_terms( $post_id, array( 'featured' ), 'pts_feature_tax', true );
				} else {
					delete_post_meta( $post_id, '_pts_featured_post' );

					$current_terms = wp_get_object_terms( $post_id, 'pts_feature_tax', array( 'fields' => 'slugs' ) );

					if ( ( $key = array_search( 'featured', $current_terms, true ) ) !== false ) {
						unset( $current_terms[ $key ] );
					}

					if ( empty( $current_terms ) || is_wp_error( $current_terms ) ) {
						wp_set_object_terms( $post_id, null, 'pts_feature_tax', false );
					} else {
						wp_set_object_terms( $post_id, $current_terms, 'pts_feature_tax', false );
					}
				}
			}
		}

		/**
		 * post_class function.
		 *
		 * @access public
		 * @param mixed $classes
		 * @param mixed $class
		 * @param mixed $post_id
		 * @return void
		 */
		public function post_class( $classes, $class, $post_id ) {
			if ( has_term( 'featured', 'pts_feature_tax', $post_id ) ) {
				$classes[] = 'featured';
				$classes[] = 'featured-' . get_post_type( $post_id );
			}

			return $classes;
		}

	}
}
