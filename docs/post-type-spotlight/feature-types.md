# Feature types

Out of the box a post is either featured or it is not. Feature types let a site
keep more than one list of that kind — **Featured**, **Recommended**, **Hand
Picked**, **Staff Pick** — and mark a post with any number of them at once.

Every feature type works the way **Featured** always has: it is a term in the
hidden `pts_feature_tax` taxonomy, so it can be queried, styled, and listed with
the Featured List block.

## Featured is always there

The plugin creates the **Featured** type itself, and every screen was built
around it. Until a site adds a second type, nothing on any screen changes. The
moment one exists:

- the editor's **Spotlight** row opens a list of every type instead of toggling
  Featured on and off,
- the classic editor's Publish box and Quick Edit gain a checkbox per type,
- the admin list's **Featured** column names the other types a post carries,
  and the views row gains a filter per type,
- the Featured List block and the Featured Posts widget gain a **Feature type**
  setting.

## Adding a feature type

A feature type is a term in `pts_feature_tax`. Create one with WP-CLI:

```bash
wp term create pts_feature_tax "Recommended"
```

or from code:

```php
wp_insert_term( 'Recommended', 'pts_feature_tax' );
```

The term's name is what editors see; its slug is what code queries by.

The taxonomy is only registered once at least one post type has been enabled
under **Settings → Writing**, so enable one first.

## Marking a post

### Block editor

Once a site has more than one type, the **Spotlight** row in the **Summary**
panel shows the types the post carries, or **Not featured** when it carries
none. Click it to open a checkbox per type, then save the post.

### Classic editor and Quick Edit

The Publish box shows **Feature this _Post type_** as before, with a checkbox
for each other type beneath it. Quick Edit shows the same checkboxes side by
side.

## Listing posts of one type

### The Featured List block

The **Spotlight** panel gains a **Feature type** setting above **Show**. Pick the
type, then choose **Only featured**, **Featured first**, or **Exclude featured**
as usual — the three now apply to whichever type is selected.

If the selected type is later deleted, the setting keeps it and labels it
**(deleted type)**, and **Only featured** lists nothing rather than quietly
switching to different posts.

### The Featured Posts widget

The widget gains a **Feature type** select, beside the post type.

### In PHP

Query by the type's slug, exactly as for `featured`:

```php
$recommended = new WP_Query(
	array(
		'post_type' => 'post',
		'tax_query' => array(
			array(
				'taxonomy' => 'pts_feature_tax',
				'field'    => 'slug',
				'terms'    => array( 'recommended' ),
			),
		),
	)
);
```

To check one post, pass the slug to the template tag:

```php
if ( post_type_spotlight_is_featured( $post, 'recommended' ) ) {
	// This post is recommended.
}
```

To list every type, with Featured first:

```php
foreach ( post_type_spotlight_get_feature_types() as $feature_type ) {
	echo esc_html( $feature_type->name );
}
```

## Styling

A post with a type other than Featured receives `pts-{$slug}` and
`pts-{$slug}-{$post_type}` classes through `post_class`:

```css
.pts-recommended { /* any recommended item */ }
.pts-recommended-page { /* recommended pages only */ }
```

The prefix is deliberate. Type slugs are whatever an admin named them, and an
unprefixed `sticky` or `post` would collide with classes WordPress and themes
already style. Featured keeps its unprefixed `featured` and
`featured-{$post_type}` classes.
