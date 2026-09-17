# Development

## Local setup

```bash
git clone git@github.com:linchpin/post-type-spotlight.git
cd post-type-spotlight
composer install
npm install
npm run build
```

`npm run build` compiles `blocks/src` to `blocks/build`, which is committed
because the plugin loads it at runtime.

## Scripts

| Command | What it does |
| --- | --- |
| `composer lint` | Parse lint plus PHPCS against the Linchpin standard |
| `composer phpcbf` | Auto-fix what PHPCS can |
| `composer build` | Produce the distributable at `build/post-type-spotlight` |
| `npm run build` | Compile the block editor assets |
| `npm run start` | Compile and watch |
| `npm run lint:js` / `npm run lint:css` | Lint the block sources |
| `npm run test:playground` | Run the WordPress Playground suite |

## Coding standards

PHP follows [`linchpin/coding-standards`](https://github.com/linchpin/coding-standards)
via `phpcs.xml.dist`. Note that `testVersion` is pinned to `7.4-`, not the
standard's 8.2 default: the toolchain runs on PHP 8.2 but the plugin still
ships to hosts on 7.4, so PHPCompatibility has to check against the lower
floor.

A pre-commit hook runs `composer check-staged-cs`, which scopes PHPCS to the
lines a commit actually changes rather than whole files.

## Tests

The suite boots the plugin in WordPress Playground and drives its real admin
screens with Playwright:

```bash
npm run test:playground          # headless
npm run test:playground:headed   # watch it run
npm run test:playground:ui       # Playwright UI mode
```

Specs live in `tests/playground/specs`. The fixture mounts the repository into
Playground and applies `blueprint.json`, which enables the `post` and `page`
post types and seeds four posts with two of them featured.

A second blueprint, `.wordpress-org/blueprints/blueprint.json`, drives the
**Live Preview** button on the WordPress.org listing. It installs the released
plugin from the directory instead of mounting the repository, then seeds the
same demo content. The deploy and asset workflows copy `.wordpress-org/` to
the SVN `assets/` tree, which is the only place the directory looks for it.
To try it locally:

```bash
node_modules/.bin/wp-playground-cli run-blueprint --blueprint=.wordpress-org/blueprints/blueprint.json
```

Each spec writes screenshots to `test-results/screenshots/wp-<version>/`. In
CI those are uploaded as artifacts and posted back to the pull request, so a
visual regression in the admin shows up in review.

**Writing a spec that seeds taxonomy terms:** the taxonomy is only registered
when `pts_featured_post_types_settings` is non-empty, and that option is read
on `init`. Setting the option and using the taxonomy in the same request
silently fails. `blueprint.json` therefore sets the option in one `runPHP`
step and seeds terms in a second.

## Releasing

Releases are automated by release-please. Commit with
[Conventional Commits](https://www.conventionalcommits.org/) and it opens a
release PR that bumps the version everywhere and writes the changelog. Merging
that PR tags the release, which triggers the GitHub release zip and the
WordPress.org SVN deploy.

Never hand-edit `CHANGELOG.md`, `.release-please-manifest.json`, or a version
string in `post-type-spotlight.php`, `readme.txt`, or `package.json`.

## Filters

### `pts_featured_checkbox_text`

Changes the label beside the classic editor checkbox.

```php
add_filter(
	'pts_featured_checkbox_text',
	function ( $text, $post ) {
		return 'Promote this article:';
	},
	10,
	2
);
```
