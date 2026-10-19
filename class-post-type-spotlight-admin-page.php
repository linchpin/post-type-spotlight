<?php // phpcs:ignore WordPress.Files.FileName.InvalidClassFileName

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'Post_Type_Spotlight_Admin_Page' ) ) {

	/**
	 * The Post Type Spotlight admin screen.
	 *
	 * Registers the page and mounts the React app built from admin/src onto it.
	 * The page prints one div; everything on it is that app, on
	 * @linchpinagency/ui, reading and writing through the routes in
	 * Post_Type_Spotlight_REST_Feature_Types.
	 *
	 * @since 3.2.0
	 */
	class Post_Type_Spotlight_Admin_Page {

		/**
		 * The page's slug, and the `page` query arg that opens it.
		 *
		 * @since 3.2.0
		 * @var string
		 */
		const SLUG = 'post-type-spotlight';

		/**
		 * The hook suffix add_submenu_page() returned, for gating the assets.
		 *
		 * @var string
		 */
		private $hook = '';

		/**
		 * Hook the page in.
		 */
		public function __construct() {
			add_action( 'admin_menu', array( $this, 'add_menu' ) );
			add_action( 'admin_enqueue_scripts', array( $this, 'enqueue' ) );
		}

		/**
		 * Under Mantle's Linchpin menu when Mantle is active, otherwise Settings.
		 *
		 * Mantle defines MANTLE_PLUGIN_FILE and has no global `Mantle` class, so
		 * the constant is the only reliable test.
		 *
		 * @since 3.2.0
		 *
		 * @return string The parent menu slug.
		 */
		public static function parent_slug() {
			return defined( 'MANTLE_PLUGIN_FILE' ) ? 'mantle' : 'options-general.php';
		}

		/**
		 * URL of the screen, optionally at one section.
		 *
		 * @since 3.2.0
		 *
		 * @param string $section Optional. A section name, read back from `?tab=`.
		 * @return string
		 */
		public static function url( $section = '' ) {
			$args = array( 'page' => self::SLUG );

			if ( $section ) {
				$args['tab'] = $section;
			}

			return add_query_arg( $args, admin_url( 'mantle' === self::parent_slug() ? 'admin.php' : 'options-general.php' ) );
		}

		/**
		 * Register the page.
		 *
		 * @since 3.2.0
		 *
		 * @return void
		 */
		public function add_menu() {
			$hook = add_submenu_page(
				self::parent_slug(),
				__( 'Post Type Spotlight', 'post-type-spotlight' ),
				__( 'Post Type Spotlight', 'post-type-spotlight' ),
				'manage_options',
				self::SLUG,
				array( $this, 'render' )
			);

			$this->hook = is_string( $hook ) ? $hook : '';
		}

		/**
		 * The mount point.
		 *
		 * @since 3.2.0
		 *
		 * @return void
		 */
		public function render() {
			echo '<div id="post-type-spotlight-admin" class="post-type-spotlight-admin"></div>';
		}

		/**
		 * Load the app on its own page and no other.
		 *
		 * @since 3.2.0
		 *
		 * @param string $hook The current admin page's hook suffix.
		 * @return void
		 */
		public function enqueue( $hook ) {
			if ( '' === $this->hook || $hook !== $this->hook ) {
				return;
			}

			$asset = self::read_asset( POST_TYPE_SPOTLIGHT_PATH . 'admin/build/admin.asset.php' );

			if ( null === $asset ) {
				return;
			}

			wp_enqueue_script(
				'post-type-spotlight-admin',
				POST_TYPE_SPOTLIGHT_PLUGIN_URL . 'admin/build/admin.js',
				array_merge( $asset['dependencies'], array( 'wp-api-fetch' ) ),
				$asset['version'],
				true
			);

			wp_set_script_translations( 'post-type-spotlight-admin', 'post-type-spotlight' );

			if ( file_exists( POST_TYPE_SPOTLIGHT_PATH . 'admin/build/admin.css' ) ) {
				/*
				 * The stylesheet reads the design system's `--wpds-*` tokens,
				 * which core ships as the `wp-theme` style. wp-components already
				 * pulls it in, but naming it keeps the order right if that changes.
				 */
				$style_dependencies = array( 'wp-components' );

				if ( wp_style_is( 'wp-theme', 'registered' ) ) {
					$style_dependencies[] = 'wp-theme';
				}

				wp_enqueue_style(
					'post-type-spotlight-admin',
					POST_TYPE_SPOTLIGHT_PLUGIN_URL . 'admin/build/admin.css',
					$style_dependencies,
					$asset['version']
				);

				// wp-scripts writes admin-rtl.css beside it.
				wp_style_add_data( 'post-type-spotlight-admin', 'rtl', 'replace' );
			}

			// Boot data only: no secret, token or key ever goes here.
			wp_add_inline_script(
				'post-type-spotlight-admin',
				'window.postTypeSpotlightAdmin = ' . wp_json_encode(
					array(
						'restUrl'    => esc_url_raw( rest_url( Post_Type_Spotlight_REST_Base::NAMESPACE . '/' ) ),
						'nonce'      => wp_create_nonce( 'wp_rest' ),
						'version'    => POST_TYPE_SPOTLIGHT_VERSION,
						'writingUrl' => admin_url( 'options-writing.php#' . Post_Type_Spotlight::SETTINGS_ANCHOR ),
					)
				) . ';',
				'before'
			);
		}

		/**
		 * Read a wp-scripts asset manifest.
		 *
		 * @since 3.2.0
		 *
		 * @param string $file Path to the `.asset.php` file.
		 * @return array|null `dependencies` and `version`, or null when the build is missing.
		 */
		private static function read_asset( $file ) {
			if ( ! is_readable( $file ) ) {
				return null;
			}

			$asset = include $file;

			if ( ! is_array( $asset ) ) {
				return null;
			}

			return array(
				'dependencies' => array_values( array_filter( (array) ( isset( $asset['dependencies'] ) ? $asset['dependencies'] : array() ), 'is_string' ) ),
				'version'      => isset( $asset['version'] ) ? (string) $asset['version'] : POST_TYPE_SPOTLIGHT_VERSION,
			);
		}
	}
}
