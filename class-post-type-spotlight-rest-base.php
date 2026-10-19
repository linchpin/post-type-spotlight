<?php // phpcs:ignore WordPress.Files.FileName.InvalidClassFileName

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'Post_Type_Spotlight_REST_Base' ) ) {

	/**
	 * What every route behind the admin screen shares.
	 *
	 * One namespace, one permission check and one set of response headers, so
	 * each concern's controller only has to say what its routes do.
	 *
	 * @since 3.2.0
	 */
	abstract class Post_Type_Spotlight_REST_Base {

		/**
		 * REST namespace for the admin screen's routes.
		 *
		 * @since 3.2.0
		 * @var string
		 */
		const NAMESPACE = 'post-type-spotlight/v1';

		/**
		 * Hook the routes and their headers.
		 */
		public function __construct() {
			add_action( 'rest_api_init', array( $this, 'register_routes' ) );
			add_filter( 'rest_post_dispatch', array( $this, 'no_store_headers' ), 10, 3 );
		}

		/**
		 * Register this controller's routes.
		 *
		 * @since 3.2.0
		 *
		 * @return void
		 */
		abstract public function register_routes();

		/**
		 * Administrators only.
		 *
		 * @since 3.2.0
		 *
		 * @param WP_REST_Request $request The request.
		 * @return true|WP_Error
		 */
		public function get_admin_permissions( $request ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found
			if ( current_user_can( 'manage_options' ) ) {
				return true;
			}

			return new WP_Error(
				'post_type_spotlight_forbidden',
				__( 'You are not allowed to do that.', 'post-type-spotlight' ),
				array( 'status' => rest_authorization_required_code() )
			);
		}

		/**
		 * Keep the admin screen's responses out of every cache.
		 *
		 * @since 3.2.0
		 *
		 * @param WP_HTTP_Response $result  The response.
		 * @param WP_REST_Server   $server  The server.
		 * @param WP_REST_Request  $request The request.
		 * @return WP_HTTP_Response
		 */
		public function no_store_headers( $result, $server, $request ) {
			if ( ! $result instanceof WP_HTTP_Response || 0 !== strpos( (string) $request->get_route(), '/' . self::NAMESPACE ) ) {
				return $result;
			}

			$result->header( 'Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0' );
			$result->header( 'Pragma', 'no-cache' );
			$result->header( 'X-Robots-Tag', 'noindex, nofollow' );

			return $result;
		}
	}
}
