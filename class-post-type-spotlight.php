<?php // phpcs:ignore WordPress.Files.FileName.InvalidClassFileName

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'Post_Type_Spotlight' ) ) {

	/**
	 * Post_Type_Spotlight class.
	 */
	class Post_Type_Spotlight {

		/**
		 * Option recording that an admin dismissed the setup notice.
		 *
		 * Site scoped rather than user scoped: the setting the notice points at
		 * is site wide, so once any admin has answered the prompt the site has
		 * been onboarded.
		 *
		 * @since 3.1.0
		 * @var string
		 */
		const ONBOARDING_DISMISSED_OPTION = 'pts_onboarding_dismissed';

		/**
		 * Anchor on the Settings > Writing section this plugin adds.
		 *
		 * `do_settings_sections()` gives the section heading no id of its own,
		 * so the section callback prints this one for the notice and the
		 * Plugins row link to aim at.
		 *
		 * @since 3.1.0
		 * @var string
		 */
		const SETTINGS_ANCHOR = 'pts-featured-post-types';

		private $doing_upgrades;

		/**
		 * Post_Type_Spotlight constructor.
		 */
		public function __construct() {
			add_action( 'init', array( $this, 'init' ) );
			add_action( 'widgets_init', array( $this, 'widgets_init' ) );

			add_action( 'admin_init', array( $this, 'admin_init' ) );
			add_action( 'admin_init', array( $this, 'register_api_settings' ) );
			add_action( 'rest_api_init', array( $this, 'register_api_settings' ) );

			add_action( 'add_meta_boxes', array( $this, 'add_meta_boxes' ) );
			add_action( 'save_post', array( $this, 'save_post' ) );
			add_action( 'edit_attachment', array( $this, 'save_post' ) );
			add_action( 'save_post', array( $this, 'save_quick_edit' ) );
			add_action( 'pre_get_posts', array( $this, 'pre_get_posts' ), 999 );
			add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );

			add_filter( 'post_class', array( $this, 'post_class' ), 10, 3 );

			add_action( 'admin_notices', array( $this, 'onboarding_notice' ) );
			add_action( 'wp_ajax_pts_dismiss_onboarding', array( $this, 'ajax_dismiss_onboarding' ) );

			add_filter( 'plugin_action_links_' . plugin_basename( POST_TYPE_SPOTLIGHT_FILE ), array( $this, 'plugin_action_links' ) );


			$this->doing_upgrades = false;

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


				// The media list table has no Quick Edit, so attachments are skipped.
				if ( array_diff( (array) $featured_pts, array( 'attachment' ) ) ) {
					add_action( 'quick_edit_custom_box', array( $this, 'quick_edit_custom_box' ), 10, 2 );
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
							'key'     => '_pts_featured_post',
							'compare' => 'EXISTS',
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
			<p id="<?php echo esc_attr( self::SETTINGS_ANCHOR ); ?>" style="scroll-margin-top: 64px;">
				<?php esc_html_e( 'Select which post types can be featured.', 'post-type-spotlight' ); ?>
			</p>
			<?php
		}

		/**
		 * URL of the Settings > Writing section this plugin adds.
		 *
		 * @since 3.1.0
		 *
		 * @access public
		 * @return string
		 */
		public function settings_url() {
			return admin_url( 'options-writing.php#' . self::SETTINGS_ANCHOR );
		}

		/**
		 * Whether the site still needs to choose its featured post types.
		 *
		 * Deliberately derived from stored state rather than set by an
		 * activation hook. `get_option()` returns false only when no row exists
		 * at all - the settings always save an array, even an empty one - so
		 * this is true for a site that has never been through the Writing
		 * screen and false the moment it has, whatever it chose there. That
		 * covers network activation, WP-CLI activation and installs that were
		 * activated before this notice existed, none of which an activation
		 * hook would reach.
		 *
		 * @since 3.1.0
		 *
		 * @access public
		 * @return bool
		 */
		public function needs_onboarding() {
			if ( false !== get_option( 'pts_featured_post_types_settings' ) ) {
				return false;
			}

			return ! get_option( self::ONBOARDING_DISMISSED_OPTION );
		}

		/**
		 * Point a fresh install at the screen that makes it do something.
		 *
		 * Activating the plugin changes nothing an author can see. The editor
		 * control, the admin column and the Featured view all wait on a post
		 * type being ticked under Settings > Writing, so without this an admin
		 * activates the plugin and finds no trace of it anywhere.
		 *
		 * @since 3.1.0
		 *
		 * @access public
		 * @return void
		 */
		public function onboarding_notice() {
			if ( ! current_user_can( 'manage_options' ) ) {
				return;
			}

			if ( ! $this->needs_onboarding() ) {
				return;
			}

			$screen = get_current_screen();

			// No point sending them to the screen they are already reading.
			if ( $screen && 'options-writing' === $screen->id ) {
				return;
			}
			?>
			<style>
				.pts-onboarding-notice__inner {
					display: flex;
					align-items: center;
					gap: 12px;
					min-height: 30px;
				}

				.pts-onboarding-notice__mark,
				.pts-onboarding-notice__cta {
					flex: 0 0 auto;
				}

				.pts-onboarding-notice__mark {
					display: flex;
				}

				.pts-onboarding-notice__text {
					flex: 1 1 auto;
					min-width: 0;
				}

				.pts-onboarding-notice p {
					margin: 0;
					padding: 0;
				}

				.pts-onboarding-notice__hint {
					color: #50575e;
				}

				/*
				 * Core reserves 38px of padding for the dismiss button and drops
				 * the notice to a stacked layout at this width, where a button
				 * sitting beside the text has nowhere to go.
				 */
				@media screen and (max-width: 782px) {
					.pts-onboarding-notice__inner {
						flex-wrap: wrap;
					}

					.pts-onboarding-notice__text {
						flex-basis: 100%;
						order: 1;
					}
				}
			</style>
			<div class="notice notice-info is-dismissible pts-onboarding-notice">
				<div class="pts-onboarding-notice__inner">
					<span class="pts-onboarding-notice__mark" aria-hidden="true">
						<svg width="28" height="28" viewBox="0 0 47.507 48" xmlns="http://www.w3.org/2000/svg" focusable="false">
							<defs>
								<linearGradient id="pts-onboarding-mark" x1="15.044" y1="46.627" x2="31.956" y2=".16" gradientUnits="userSpaceOnUse">
									<stop offset="0" stop-color="#7d58c6" />
									<stop offset=".261" stop-color="#677bc9" />
									<stop offset=".581" stop-color="#51a1cc" />
									<stop offset=".838" stop-color="#44b8cf" />
									<stop offset="1" stop-color="#3fc1d0" />
								</linearGradient>
							</defs>
							<circle cx="43.966" cy="3.54" r="3.54" fill="#7a7a7a" />
							<path fill="url(#pts-onboarding-mark)" d="m43.966,9.895c-3.509,0-6.354-2.845-6.354-6.354,0-.437.044-.863.128-1.275h-14.873C10.238,2.266,0,12.504,0,25.133h0c0,12.629,10.238,22.867,22.867,22.867h0c12.629,0,22.867-10.238,22.867-22.867v-15.489c-.562.162-1.154.251-1.768.251Zm-12.953,26.821l-8.146-4.073-8.146,4.073,1.534-9.001-5.607-6.272,8.146-1.018,4.073-8.146,4.073,8.146,8.146,1.018-5.594,6.272,1.521,9.001Z" />
						</svg>
					</span>
					<div class="pts-onboarding-notice__text">
						<p>
							<?php
							printf(
								/* translators: %s: Plugin name, wrapped in a strong tag. */
								esc_html__( '%s is active, but no post types can be featured yet.', 'post-type-spotlight' ),
								'<strong>' . esc_html( POST_TYPE_SPOTLIGHT_PLUGIN_NAME ) . '</strong>'
							);
							?>
						</p>
						<p class="pts-onboarding-notice__hint">
							<?php esc_html_e( 'Choose which post types should get a Featured control. You can always change this later under Settings then Writing.', 'post-type-spotlight' ); ?>
						</p>
					</div>
					<a class="button button-primary pts-onboarding-notice__cta" href="<?php echo esc_url( $this->settings_url() ); ?>">
						<?php esc_html_e( 'Choose post types', 'post-type-spotlight' ); ?>
					</a>
				</div>
			</div>
			<?php
			/*
			 * Core only hides a dismissed notice for the current page load, so
			 * the X has to write the choice down itself. Delegated from the
			 * document because core's common.js injects that button on ready,
			 * after this markup is printed.
			 *
			 * Taking up the offer counts as answering the prompt too, so the CTA
			 * records the same thing. That click navigates away, which a fetch()
			 * does not reliably outlive, so it goes out as a beacon instead -
			 * the one request type the browser promises to finish after unload.
			 */
			wp_print_inline_script_tag(
				sprintf(
					'document.addEventListener( "click", function ( event ) {
	var target = event.target.closest ? event.target.closest( ".notice-dismiss, .pts-onboarding-notice__cta" ) : null;

	if ( ! target || ! target.closest( ".pts-onboarding-notice" ) ) {
		return;
	}

	var endpoint = %1$s;
	var body = "action=pts_dismiss_onboarding&_ajax_nonce=" + %2$s;

	if ( target.classList.contains( "pts-onboarding-notice__cta" ) && navigator.sendBeacon ) {
		navigator.sendBeacon( endpoint, new Blob( [ body ], { type: "application/x-www-form-urlencoded" } ) );
		return;
	}

	window.fetch( endpoint, {
		method: "POST",
		credentials: "same-origin",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: body
	} );
} );',
					wp_json_encode( admin_url( 'admin-ajax.php' ) ),
					wp_json_encode( wp_create_nonce( 'pts_dismiss_onboarding' ) )
				)
			);
		}

		/**
		 * Persist a dismissal of the setup notice.
		 *
		 * @since 3.1.0
		 *
		 * @access public
		 * @return void
		 */
		public function ajax_dismiss_onboarding() {
			check_ajax_referer( 'pts_dismiss_onboarding' );

			if ( ! current_user_can( 'manage_options' ) ) {
				wp_send_json_error( null, 403 );
			}

			update_option( self::ONBOARDING_DISMISSED_OPTION, 1, false );

			wp_send_json_success();
		}

		/**
		 * Add a Settings link to the plugin's row on the Plugins screen.
		 *
		 * The settings live inside a section of a core screen, which is the one
		 * place an admin looking for a plugin's options will not think to look.
		 *
		 * @since 3.1.0
		 *
		 * @access public
		 * @param  array $links Action links for this plugin's row.
		 * @return array
		 */
		public function plugin_action_links( $links ) {
			array_unshift(
				$links,
				sprintf(
					'<a href="%1$s">%2$s</a>',
					esc_url( $this->settings_url() ),
					esc_html__( 'Settings', 'post-type-spotlight' )
				)
			);

			return $links;
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
		 * The settings field is named `pts_featured_post_types[]` while the option it
		 * saves to is `pts_featured_post_types_settings`, so the `$input` WordPress
		 * hands this callback is always empty — the submitted value has to be read
		 * from the field the form actually posts. Renaming either one would orphan
		 * every existing site's saved setting, so the mismatch stays.
		 *
		 * @access public
		 * @param  mixed $input Value for the registered option. Always empty here; see above.
		 * @return array Post type slugs that exist on this site.
		 */
		public function sanitize_settings( $input ) {
			// Nonce is verified by options.php before it dispatches to this sanitize callback.
			// phpcs:disable Linchpin.Security.NonceVerification.Missing
			$submitted = isset( $_POST['pts_featured_post_types'] )
				? array_map( 'sanitize_text_field', (array) wp_unslash( $_POST['pts_featured_post_types'] ) )
				: array();
			// phpcs:enable Linchpin.Security.NonceVerification.Missing

			$new_input = array();

			foreach ( $submitted as $pt ) {
				if ( post_type_exists( $pt ) ) {
					$new_input[] = $pt;
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
					<?php
					// Public filter shipped since 1.0. The `pts_` prefix is under the four
					// character minimum WPCS enforces, but renaming it would break every
					// site already hooking it.
					// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound
					echo esc_html( apply_filters( 'pts_featured_checkbox_text', 'Feature this ' . $pt->labels->singular_name . ':', $post ) );
					?></span>&nbsp
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
					$featured = has_term( 'featured', 'pts_feature_tax', $post_id );

					if ( $featured ) {
						echo '<span class="dashicons dashicons-star-filled"></span>';
					}

					// Read by js/admin-quick-edit.js to seed the Quick Edit checkbox.
					printf( '<span class="pts-featured-state hidden" data-pts-featured="%d"></span>', $featured ? 1 : 0 );
					break;
			}
		}

		/**
		 * Render the featured checkbox inside the Quick Edit row.
		 *
		 * @since 3.1.0
		 *
		 * @param string $column_name The column being rendered.
		 * @param string $post_type   The post type of the list table.
		 * @return void
		 */
		public function quick_edit_custom_box( $column_name, $post_type ) {
			if ( 'lp-featured' !== $column_name ) {
				return;
			}

			$settings = get_option( 'pts_featured_post_types_settings', array() );

			if ( ! in_array( $post_type, (array) $settings, true ) ) {
				return;
			}

			$pt = get_post_type_object( $post_type );

			wp_nonce_field( '_pts_featured_post_nonce', '_pts_featured_post_noncename' );
			?>
			<fieldset class="inline-edit-col-right">
				<div class="inline-edit-col">
					<label class="alignleft lp-featured-post">
						<input type="checkbox" name="_pts_featured_post" id="_pts_featured_post" value="1" />
						<span class="checkbox-title">
							<?php
							// Public filter shipped since 1.0. The `pts_` prefix is under the
							// four character minimum WPCS enforces, but renaming it would break
							// every site already hooking it.
							// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound
							echo esc_html( apply_filters( 'pts_featured_checkbox_text', 'Feature this ' . $pt->labels->singular_name, null ) );
							?>
						</span>
					</label>
				</div>
			</fieldset>
			<?php
		}

		/**
		 * Save the featured state submitted from the Quick Edit row.
		 *
		 * Inline edits are saved over admin-ajax.php, which save_post() ignores,
		 * so they need a handler of their own.
		 *
		 * @since 3.1.0
		 *
		 * @param mixed $post_id The post being saved.
		 * @return void
		 */
		public function save_quick_edit( $post_id ) {
			if ( ! isset( $_POST['action'] ) || 'inline-save' !== $_POST['action'] ) {
				return;
			}

			if ( wp_is_post_revision( $post_id ) || ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) ) {
				return;
			}

			if ( ! current_user_can( 'edit_post', $post_id ) ) {
				return;
			}

			if ( ! isset( $_POST['_pts_featured_post_noncename'] ) || ! wp_verify_nonce( sanitize_key( $_POST['_pts_featured_post_noncename'] ), '_pts_featured_post_nonce' ) ) {
				return;
			}

			$settings = get_option( 'pts_featured_post_types_settings', array() );

			if ( ! in_array( get_post_type( $post_id ), (array) $settings, true ) ) {
				return;
			}

			$this->set_post_featured( $post_id, ! empty( $_POST['_pts_featured_post'] ) );
		}

		/**
		 * Add or remove the featured term for a post, leaving any other
		 * pts_feature_tax terms on the post untouched.
		 *
		 * @since 3.1.0
		 *
		 * @param mixed $post_id  The post ID.
		 * @param bool  $featured Whether the post should be featured.
		 * @return void
		 */
		public function set_post_featured( $post_id, $featured ) {
			delete_post_meta( $post_id, '_pts_featured_post' );

			if ( $featured ) {
				wp_set_object_terms( $post_id, array( 'featured' ), 'pts_feature_tax', true );
				return;
			}

			$current_terms = wp_get_object_terms( $post_id, 'pts_feature_tax', array( 'fields' => 'slugs' ) );

			if ( is_wp_error( $current_terms ) ) {
				return;
			}

			if ( ( $key = array_search( 'featured', $current_terms, true ) ) !== false ) { // phpcs:ignore WordPress.CodeAnalysis.AssignmentInCondition.Found
				unset( $current_terms[ $key ] );
			}

			if ( empty( $current_terms ) ) {
				wp_set_object_terms( $post_id, null, 'pts_feature_tax', false );
			} else {
				wp_set_object_terms( $post_id, array_values( $current_terms ), 'pts_feature_tax', false );
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

			/*
			 * `taxonomy` + `term`, not `pts_feature_tax=featured`.
			 *
			 * The taxonomy is registered with 'query_var' => false, so
			 * edit.php never read the shorter form and this link quietly
			 * listed every post instead of the featured ones. The pair below
			 * is what wp_edit_posts_query() actually honours.
			 */
			$url = add_query_arg(
				array(
					'post_type' => get_post_type(),
					'taxonomy'  => 'pts_feature_tax',
					'term'      => 'featured',
				),
				admin_url( 'edit.php' )
			);

			$link = '<a href="' . esc_url( $url ) . '"';

			// Read-only check on an admin list table filter, to mark the current view. No state changes.
			// phpcs:disable Linchpin.Security.NonceVerification.Recommended
			$is_current = ( isset( $_GET['taxonomy'] ) && 'pts_feature_tax' === $_GET['taxonomy'] )
				|| ( isset( $_GET['pts_feature_tax'] ) && 'featured' === $_GET['pts_feature_tax'] );
			// phpcs:enable Linchpin.Security.NonceVerification.Recommended

			if ( $is_current ) {
				$link .= ' class="current"';
			}

			$link .= '>' . esc_html__( 'Featured', 'post-type-spotlight' ) . '</a> <span class="count">(' . absint( $count ) . ')</span>';

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

			$nonce = isset( $_POST['_pts_featured_post_noncename'] )
				? sanitize_text_field( wp_unslash( $_POST['_pts_featured_post_noncename'] ) )
				: '';

			if ( $nonce && wp_verify_nonce( $nonce, '_pts_featured_post_nonce' ) ) {
				$this->set_post_featured( $post_id, ! empty( $_POST['_pts_featured_post'] ) );
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

		/**
		 * Enqueue our admin scripts.
		 *
		 * @since 3.1.0
		 *
		 * @param string $hook The hook.
		 */
		public function admin_enqueue_scripts( $hook ) {

			if ( 'edit.php' !== $hook ) {
				return;
			}

			wp_enqueue_script(
				'post-type-spotlight-quick-edit',
				POST_TYPE_SPOTLIGHT_PLUGIN_URL . 'js/admin-quick-edit.js',
				array( 'jquery', 'inline-edit-post' ),
				POST_TYPE_SPOTLIGHT_VERSION,
				true
			);
		}
	}
}
