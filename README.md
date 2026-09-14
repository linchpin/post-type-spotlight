![Post Type Spotlight](https://github.com/linchpin/post-type-spotlight/blob/main/.wordpress-org/banner-1544x500.png?raw=true)

# Post Type Spotlight

Feature any post type — posts, pages, attachments, or your own — and then query, style and sort by that flag.

<!-- x-release-please-start-version -->

## Latest Release: 3.0.3

<!-- x-release-please-end -->

| Status                                                                                                                                  | Quality                                                                                                                             |
| --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| ![Release](https://github.com/linchpin/post-type-spotlight/actions/workflows/release-please.yml/badge.svg)                              | ![PHP](https://github.com/linchpin/post-type-spotlight/actions/workflows/php.yml/badge.svg)                                         |
| ![Plugin Check](https://github.com/linchpin/post-type-spotlight/actions/workflows/plugin-check.yml/badge.svg)                           | ![JavaScript](https://github.com/linchpin/post-type-spotlight/actions/workflows/js.yml/badge.svg)                                   |
| ![Playground Tests](https://github.com/linchpin/post-type-spotlight/actions/workflows/playground-tests.yml/badge.svg)                   |                                                                                                                                       |

See [CHANGELOG.md](CHANGELOG.md) for release history and detailed changes.
Full documentation is in [docs/post-type-spotlight](docs/post-type-spotlight/index.md). It publishes to
docs.linchpin.com once `sync-docs.yml` is promoted out of its dry-run posture.

## Description

The plugin adds a **Feature this post** control to the editor. It only appears on the post types an administrator enables under `Settings → Writing`.

When a post is designated as featured:

- It receives `featured` and `featured-{$post_type}` classes through the `post_class` filter.
- A ⭐️ appears in a **Featured** column on that post type's admin list screen, with a **Featured** view that filters to just those posts.
- It is assigned the hidden `pts_feature_tax` taxonomy term `featured`, so it can be queried with a standard `tax_query`.

Because the flag is a taxonomy term rather than post meta, finding featured content is an indexed taxonomy lookup instead of a meta query. WordPress' own sticky posts only work on the core `post` type; this works on any type you enable.

## Requirements

| Requirement | Version       |
| ----------- | ------------- |
| WordPress   | 5.9 or later  |
| PHP         | 7.4 or later  |

## Installation

1. Upload the plugin folder to `/wp-content/plugins/`, or install **Post Type Spotlight** from the Plugins screen.
2. Activate it through the **Plugins** menu.
3. Go to `Settings → Writing` and tick the post types that should gain the featured control.

## Usage

### Featuring a post

In the block editor, the **Summary** panel of the sidebar gains a **Feature _Post type_** toggle. In the classic editor, the Publish meta box gains a checkbox whose label is filterable through `pts_featured_checkbox_text`.

### Querying featured posts

```php
$featured = new WP_Query(
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
```

Swap `'operator' => 'NOT IN'` into that clause to exclude featured posts instead. For a single post, `has_term( 'featured', 'pts_feature_tax', $post_id )`.

### The Featured List block

A **Featured List** variation of the core Query Loop block ships with the plugin, plus a control for how the query treats featured posts — only featured, exclude featured, or featured first.

## Getting set up locally

Prerequisites:

1. Node.js `>=20.20.2` (see `.nvmrc`)
2. PHP `8.2` for the toolchain — note the plugin itself still supports 7.4
3. Composer

```bash
composer install
npm install
npm run build
```

`npm run build` compiles `blocks/src` into `blocks/build`, which is committed because the plugin loads it at runtime. Use `npm run start` to watch.

### Quality checks

```bash
composer lint            # parse lint + PHPCS against the Linchpin standard
composer phpcbf          # auto-fix what PHPCS can
npm run lint:js
npm run lint:css
npm run test:playground  # boots the plugin in WordPress Playground
```

A pre-commit hook runs `composer check-staged-cs`, which scopes PHPCS to the lines a commit actually changes rather than whole files.

### Tests and screenshots

The test suite boots the plugin in [WordPress Playground](https://wordpress.org/playground/) and drives its real admin screens with Playwright. Each spec captures a screenshot; in CI those upload as artifacts and post back to the pull request, so a visual regression in the editor sidebar or the posts list shows up in review.

```bash
npm run test:playground:headed  # watch it run
npm run test:playground:ui      # Playwright UI mode
```

Specs live in `tests/playground/specs`. `blueprint.json` seeds the Playground instance.

## Build process and releases

Versioning is handled by `release-please`. Commit with [Conventional Commits](https://www.conventionalcommits.org/) and it opens a release PR that bumps the version across `post-type-spotlight.php`, `readme.txt`, `package.json` and this file, and writes the changelog. Merging that PR tags the release, which triggers the GitHub release zip and the WordPress.org SVN deploy.

`bash scripts/build.sh` produces the distributable at `build/post-type-spotlight` — the same artifact Plugin Check inspects and the release ships.

> Never hand-edit `CHANGELOG.md`, `.release-please-manifest.json`, or a version string in a file release-please owns.

## Coding standards

PHP follows [`linchpin/coding-standards`](https://github.com/linchpin/coding-standards) via `phpcs.xml.dist`. `testVersion` is pinned to `7.4-` rather than the standard's default, because the toolchain runs on PHP 8.2 while the plugin still ships to hosts on 7.4.

![Linchpin](https://github.com/linchpin/brand-assets/blob/master/github-banner@2x.jpg?raw=true)
