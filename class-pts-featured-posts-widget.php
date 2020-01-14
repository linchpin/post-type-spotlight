<?php

if ( ! defined( 'ABSPATH') ) {
	exit;
}

/**
 * PTS_Featured_Posts_Widget class.
 *
 * @extends WP_Widget
 */
class PTS_Featured_Posts_Widget extends WP_Widget {

	private $featured_post_types = array();

	/**
	 * __construct function.
	 *
	 * @access public
	 * @return void
	 */
	public function __construct() {
		$this->featured_post_types = (array) get_option( 'pts_featured_post_types_settings' );

		parent::__construct( 'pts_featured_posts_widget', esc_html__( 'Featured Posts Widget', 'post-type-spotlight' ), array( 'description' => esc_html__( 'Featured Posts Widget', 'post-type-spotlight' ) ) );
	}

	/**
	 * widget function.
	 *
	 * @access public
	 * @param mixed $args
	 * @param mixed $instance
	 * @return void
	 */
	public function widget( $args = array(), $instance ) {

		$widget_settings = wp_parse_args(
			$instance,
			array(
				'number'    => 5,
				'title'     => '',
				'post_type' => '',
			)
		);

		/**
		 * Define our widget defaults
		 */
		$defaults = array(
			'before_widget' => '',
			'after_widget'  => '',
		);

		// Parse incoming $args into an array and merge it with $defaults.
		$args = wp_parse_args( $args, $defaults );

		if ( empty( $widget_settings['post_type'] ) ) {
			return;
		}

		$title = apply_filters( 'widget_title', $widget_settings['title'] );

		echo wp_kses_post( $args['before_widget'] );

		if ( ! empty( $title ) ) {
			echo wp_kses_post( $args['before_title'] . $title . $args['after_title'] );
		}

		$args = array(
			'posts_per_page' => (int) $widget_settings['number'],
			'post_type'      => $widget_settings['post_type'],
			'tax_query'      => array(
				array(
					'taxonomy' => 'pts_feature_tax',
					'field'    => 'slug',
					'terms'    => array( 'featured' ),
				),
			),
		);

		$featured_posts = new WP_Query( $args );

		if ( $featured_posts->have_posts() ) : ?>
			<div class="pts-widget-post-container">
				<?php while ( $featured_posts->have_posts() ) :
					$featured_posts->the_post();
					?>
					<div <?php post_class( 'pts-featured-post' ); ?>>
						<h3 title="<?php the_title_attribute(); ?>"><a href="<?php the_permalink(); ?>" title="<?php the_title_attribute(); ?>"><?php the_title(); ?></a></h3>
					</div>
				<?php endwhile; ?>
			</div>
			<?php
		endif;
		wp_reset_postdata();

		echo wp_kses_post( $args['after_widget'] );
	}

	/**
	 * update function.
	 *
	 * @access public
	 * @param mixed $new_instance
	 * @param mixed $old_instance
	 * @return mixed|array
	 */
	public function update( $new_instance, $old_instance ) {
		$instance           = array();
		$instance['title']  = sanitize_text_field( $new_instance['title'] );
		$instance['number'] = (int) $new_instance['number'];

		if ( in_array( $new_instance['post_type'], $this->featured_post_types, true ) ) {
			$instance['post_type'] = $new_instance['post_type'];
		}

		return $instance;
	}

	/**
	 * Widget form.
	 *
	 * @access public
	 * @param mixed $instance
	 * @return void
	 */
	public function form( $instance ) {

		$defaults = array(
			'number'    => 5,
			'title'     => '',
			'post_type' => '',
		);

		$instance = wp_parse_args( $instance, $defaults );

		if ( empty( $this->featured_post_types ) ) :
			?>
			<p>
				<?php
					echo wp_kses(
						sprintf(
							// translators: Link to options screen
							__( 'You need to select a featured post type on the <a href="%1$s">Settings->Writing screen</a> before you can use this widget.', 'post-type-spotlight' ),
							esc_url( admin_url( 'options-writing.php' ) )
						),
						array(
							'a' => array(
								'href' => array(),
							),
							'p' => array(),
						)
					);
				?>
			</p>
		<?php else : ?>
			<p>
				<label for="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>"><?php esc_html_e( 'Title', 'post-type-spotlight' ); ?>:</label>
				<input class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'title' ) ); ?>" type="text" value="<?php echo esc_attr( $instance['title'] ); ?>" />
			</p>

			<p>
				<label for="<?php echo esc_attr( $this->get_field_id( 'post_type' ) ); ?>"><?php esc_html_e( 'Post type to feature', 'post-type-spotlight' ); ?>:</label>
				<select id="<?php echo esc_attr( $this->get_field_id( 'post_type' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'post_type' ) ); ?>" class="widefat">
					<option value=""><?php esc_html_e( 'Select post type', 'post-type-spotlight' ); ?>...</option>
					<?php
					foreach ( $this->featured_post_types as $pt ) {
						if ( $current_post_type = get_post_type_object( $pt ) ) : // phpcs:ignore WordPress.CodeAnalysis.AssignmentInCondition.Found, Squiz.PHP.DisallowMultipleAssignments.Found
							?>
							<option value="<?php echo esc_attr( $pt ); ?>" <?php selected( $instance['post_type'], $pt ); ?>><?php echo esc_html( $current_post_type->labels->name ); ?></option>
							<?php
						endif;
					}
					?>
				</select>
			</p>
			<p>
				<label for="<?php echo esc_attr( $this->get_field_id( 'number' ) ); ?>"><?php esc_html_e( 'Number of Posts', 'post-type-spotlight' ); ?>:</label>
				<input size="2" id="<?php echo esc_attr( $this->get_field_id( 'number' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'number' ) ); ?>" type="text" value="<?php echo esc_attr( $instance['number'] ); ?>" />
			</p>
			<?php
		endif;
	}
}
