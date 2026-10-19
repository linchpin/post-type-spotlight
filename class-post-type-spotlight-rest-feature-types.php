<?php // phpcs:ignore WordPress.Files.FileName.InvalidClassFileName

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'Post_Type_Spotlight_REST_Feature_Types' ) ) {

	/**
	 * The feature types routes behind the admin screen.
	 *
	 * A feature type is a term in `pts_feature_tax`, so these are a thin layer
	 * over the term functions. They exist rather than core's terms endpoint
	 * because the screen needs rules core does not have: `featured` can be
	 * neither edited nor deleted, and a slug is fixed once it exists.
	 *
	 * @since 3.2.0
	 */
	class Post_Type_Spotlight_REST_Feature_Types extends Post_Type_Spotlight_REST_Base {

		/**
		 * Register the routes.
		 *
		 * @since 3.2.0
		 *
		 * @return void
		 */
		public function register_routes() {
			register_rest_route(
				self::NAMESPACE,
				'/admin/feature-types',
				array(
					array(
						'methods'             => WP_REST_Server::READABLE,
						'callback'            => array( $this, 'get_items' ),
						'permission_callback' => array( $this, 'get_admin_permissions' ),
						'show_in_index'       => false,
					),
					array(
						'methods'             => WP_REST_Server::CREATABLE,
						'callback'            => array( $this, 'create_item' ),
						'permission_callback' => array( $this, 'get_admin_permissions' ),
						'show_in_index'       => false,
						'args'                => array(
							'name'        => array(
								'type'              => 'string',
								'required'          => true,
								'sanitize_callback' => 'sanitize_text_field',
							),
							'slug'        => array(
								'type'              => 'string',
								// Not 'sanitize_title' directly: REST passes the request as the
								// second argument, which sanitize_title() takes as the fallback
								// for an empty slug - and returns the request object.
								'sanitize_callback' => static function ( $value ) {
									return sanitize_title( $value );
								},
							),
							'description' => array(
								'type'              => 'string',
								'sanitize_callback' => 'sanitize_textarea_field',
							),
						),
					),
				)
			);

			register_rest_route(
				self::NAMESPACE,
				'/admin/feature-types/(?P<id>\d+)',
				array(
					array(
						'methods'             => WP_REST_Server::EDITABLE,
						'callback'            => array( $this, 'update_item' ),
						'permission_callback' => array( $this, 'get_admin_permissions' ),
						'show_in_index'       => false,
						'args'                => array(
							'name'        => array(
								'type'              => 'string',
								'sanitize_callback' => 'sanitize_text_field',
							),
							'description' => array(
								'type'              => 'string',
								'sanitize_callback' => 'sanitize_textarea_field',
							),
						),
					),
					array(
						'methods'             => WP_REST_Server::DELETABLE,
						'callback'            => array( $this, 'delete_item' ),
						'permission_callback' => array( $this, 'get_admin_permissions' ),
						'show_in_index'       => false,
					),
				)
			);
		}

		/**
		 * Every feature type, `featured` first.
		 *
		 * `ready` is false on a site that has not enabled a post type yet. The
		 * taxonomy is only registered once one is, so until then there is
		 * nowhere for a type to live and the screen says so instead.
		 *
		 * @since 3.2.0
		 *
		 * @return WP_REST_Response
		 */
		public function get_items() {
			return rest_ensure_response(
				array(
					'ready' => taxonomy_exists( 'pts_feature_tax' ),
					'types' => array_map( array( $this, 'prepare_item' ), post_type_spotlight_get_feature_types() ),
				)
			);
		}

		/**
		 * Create a feature type.
		 *
		 * @since 3.2.0
		 *
		 * @param WP_REST_Request $request The request.
		 * @return WP_REST_Response|WP_Error
		 */
		public function create_item( $request ) {
			if ( ! taxonomy_exists( 'pts_feature_tax' ) ) {
				return $this->not_ready_error();
			}

			$name = trim( (string) $request['name'] );

			if ( '' === $name ) {
				return new WP_Error(
					'post_type_spotlight_name_required',
					__( 'A feature type needs a name.', 'post-type-spotlight' ),
					array( 'status' => 400 )
				);
			}

			$result = wp_insert_term(
				$name,
				'pts_feature_tax',
				array(
					'slug'        => (string) $request['slug'],
					'description' => (string) $request['description'],
				)
			);

			if ( is_wp_error( $result ) ) {
				return $this->term_error( $result );
			}

			$response = rest_ensure_response( $this->prepare_item( get_term( $result['term_id'], 'pts_feature_tax' ) ) );
			$response->set_status( 201 );

			return $response;
		}

		/**
		 * Rename a feature type, or change its description.
		 *
		 * The slug is not accepted. Featured List blocks, widgets and theme code
		 * all name a type by its slug, so changing one would quietly empty every
		 * list that reads it.
		 *
		 * @since 3.2.0
		 *
		 * @param WP_REST_Request $request The request.
		 * @return WP_REST_Response|WP_Error
		 */
		public function update_item( $request ) {
			$term = $this->get_editable_term( $request['id'] );

			if ( is_wp_error( $term ) ) {
				return $term;
			}

			$args = array();

			if ( isset( $request['name'] ) ) {
				$args['name'] = trim( (string) $request['name'] );

				if ( '' === $args['name'] ) {
					return new WP_Error(
						'post_type_spotlight_name_required',
						__( 'A feature type needs a name.', 'post-type-spotlight' ),
						array( 'status' => 400 )
					);
				}
			}

			if ( isset( $request['description'] ) ) {
				$args['description'] = (string) $request['description'];
			}

			$result = wp_update_term( $term->term_id, 'pts_feature_tax', $args );

			if ( is_wp_error( $result ) ) {
				return $this->term_error( $result );
			}

			return rest_ensure_response( $this->prepare_item( get_term( $term->term_id, 'pts_feature_tax' ) ) );
		}

		/**
		 * Delete a feature type, taking it off every post that carries it.
		 *
		 * @since 3.2.0
		 *
		 * @param WP_REST_Request $request The request.
		 * @return WP_REST_Response|WP_Error
		 */
		public function delete_item( $request ) {
			$term = $this->get_editable_term( $request['id'] );

			if ( is_wp_error( $term ) ) {
				return $term;
			}

			$previous = $this->prepare_item( $term );
			$result   = wp_delete_term( $term->term_id, 'pts_feature_tax' );

			if ( is_wp_error( $result ) ) {
				return $this->term_error( $result );
			}

			if ( true !== $result ) {
				return new WP_Error(
					'post_type_spotlight_delete_failed',
					__( 'The feature type could not be deleted.', 'post-type-spotlight' ),
					array( 'status' => 500 )
				);
			}

			return rest_ensure_response(
				array(
					'deleted'  => true,
					'previous' => $previous,
				)
			);
		}

		/**
		 * A feature type as the screen reads it.
		 *
		 * @since 3.2.0
		 *
		 * @param WP_Term $term The term.
		 * @return array
		 */
		public function prepare_item( $term ) {
			$built_in = 'featured' === $term->slug;

			return array(
				'id'          => (int) $term->term_id,
				// The plugin creates `featured` with the lowercase name `featured`,
				// which reads as a slug. Every other screen calls it Featured.
				'name'        => $built_in ? __( 'Featured', 'post-type-spotlight' ) : html_entity_decode( $term->name, ENT_QUOTES, get_bloginfo( 'charset' ) ),
				'slug'        => $term->slug,
				'description' => $term->description,
				'count'       => (int) $term->count,
				'builtIn'     => $built_in,
			);
		}

		/**
		 * The feature type a request names, if it is one that may be changed.
		 *
		 * @since 3.2.0
		 *
		 * @param mixed $id The term ID from the route.
		 * @return WP_Term|WP_Error
		 */
		private function get_editable_term( $id ) {
			if ( ! taxonomy_exists( 'pts_feature_tax' ) ) {
				return $this->not_ready_error();
			}

			$term = get_term( (int) $id, 'pts_feature_tax' );

			if ( ! $term instanceof WP_Term ) {
				return new WP_Error(
					'post_type_spotlight_not_found',
					__( 'That feature type does not exist.', 'post-type-spotlight' ),
					array( 'status' => 404 )
				);
			}

			/*
			 * Featured is the one type every part of the plugin assumes exists,
			 * and the plugin recreates it on the next admin page load if it goes.
			 */
			if ( 'featured' === $term->slug ) {
				return new WP_Error(
					'post_type_spotlight_built_in',
					__( 'Featured is built in, so it cannot be changed or deleted.', 'post-type-spotlight' ),
					array( 'status' => 403 )
				);
			}

			return $term;
		}

		/**
		 * The error for a site that has not enabled a post type yet.
		 *
		 * @since 3.2.0
		 *
		 * @return WP_Error
		 */
		private function not_ready_error() {
			return new WP_Error(
				'post_type_spotlight_not_ready',
				__( 'Choose at least one post type under Settings, Writing before adding feature types.', 'post-type-spotlight' ),
				array( 'status' => 409 )
			);
		}

		/**
		 * A term function's error, as a 400 the screen can show as is.
		 *
		 * @since 3.2.0
		 *
		 * @param WP_Error $error The error.
		 * @return WP_Error
		 */
		private function term_error( $error ) {
			// Core's wording talks about terms and taxonomies, which this screen never mentions.
			$message = 'term_exists' === $error->get_error_code() || 'duplicate_term_slug' === $error->get_error_code()
				? __( 'A feature type with that name or slug already exists.', 'post-type-spotlight' )
				: $error->get_error_message();

			return new WP_Error(
				'post_type_spotlight_' . $error->get_error_code(),
				$message,
				array( 'status' => 400 )
			);
		}
	}
}
