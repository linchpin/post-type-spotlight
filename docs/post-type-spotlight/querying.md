# Querying featured posts

Featured state is stored as the term `featured` in the hidden taxonomy
`pts_feature_tax`, so any standard `tax_query` reaches it.

## The ten most recent featured posts

```php
$featured_posts = new WP_Query(
	array(
		'post_type'      => 'post',
		'posts_per_page' => 10,
		'tax_query'      => array(
			array(
				'taxonomy' => 'pts_feature_tax',
				'field'    => 'slug',
				'terms'    => array( 'featured' ),
			),
		),
	)
);

if ( $featured_posts->have_posts() ) {
	while ( $featured_posts->have_posts() ) {
		$featured_posts->the_post();
		// Output featured posts here.
	}
	wp_reset_postdata();
}
```

## Excluding featured posts

Set the `operator` to `NOT IN`:

```php
'tax_query' => array(
	array(
		'taxonomy' => 'pts_feature_tax',
		'field'    => 'slug',
		'terms'    => array( 'featured' ),
		'operator' => 'NOT IN',
	),
),
```

## Checking a single post

```php
if ( has_term( 'featured', 'pts_feature_tax', $post_id ) ) {
	// This post is featured.
}
```

## Styling featured posts

The `post_class` filter adds `featured` and `featured-{$post_type}`:

```css
.featured { /* any featured item */ }
.featured-page { /* featured pages only */ }
```

## Upgrading from 1.x

Before 2.0 the plugin stored featured state in the `_pts_featured_post` post
meta field. That field is gone. A `meta_query` against it is transparently
rewritten to the taxonomy query above and raises a deprecation notice, but new
code should query the taxonomy directly.
