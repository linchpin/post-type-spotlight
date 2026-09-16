# Post Type Spotlight

Post Type Spotlight lets administrators mark any post type — posts, pages,
attachments, or a custom post type — as **featured**, and then query, style, and
sort by that flag.

A featured post:

- receives `featured` and `featured-{$post_type}` classes through the
  `post_class` filter,
- shows a star in a **Featured** column on that post type's admin list screen,
- is assigned the hidden `pts_feature_tax` taxonomy term `featured`, which makes
  it queryable with a standard `tax_query`.

## Why not sticky posts?

WordPress' built-in sticky functionality only applies to the core `post` post
type. Post Type Spotlight works on any post type you enable, and because it
stores the flag in a taxonomy rather than post meta, querying featured content
is an indexed taxonomy lookup rather than a meta query.

## Contents

- [Installation](installation.md)
- [Usage](usage.md)
- [The Featured List block](featured-list-block.md)
- [Querying featured posts](querying.md)
- [Development](development.md)
