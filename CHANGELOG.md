# Changelog #

## [3.0.1](https://github.com/linchpin/post-type-spotlight/compare/v3.0.0...v3.0.1) (2023-11-02)


### Bug Fixes 🐛

* **deps:** update npm frontend ([77eac81](https://github.com/linchpin/post-type-spotlight/commit/77eac81ac17eaac6834b907c9ec63d46cf906a56))
* **deps:** update npm frontend ([d60f18b](https://github.com/linchpin/post-type-spotlight/commit/d60f18b7ecb7749bbf2e7b1cbd7f17e06e29d4cb))
* **issue/77:** Check if admin post type uses the block editor before enqueuing the Post Type Spotlight block editor scripts ([af42294](https://github.com/linchpin/post-type-spotlight/commit/af42294dc456b47d963f086c32dfa6f263305607))


### Miscellaneous Chores 🧹

* **deps-dev:** bump @babel/traverse from 7.22.10 to 7.23.2 ([0152dbc](https://github.com/linchpin/post-type-spotlight/commit/0152dbccc686f937d217df342d65b5869976a454))
* **deps-dev:** bump @babel/traverse from 7.22.10 to 7.23.2 in /blocks ([85b71e0](https://github.com/linchpin/post-type-spotlight/commit/85b71e0be5098e4c6845a4720ab5639071cfd9c2))
* **deps-dev:** bump postcss from 8.4.27 to 8.4.31 ([b7ffdc2](https://github.com/linchpin/post-type-spotlight/commit/b7ffdc2fe4e6cd8af40b48c14c998f2ca725c312))
* **deps-dev:** bump postcss from 8.4.27 to 8.4.31 in /blocks ([788b8ad](https://github.com/linchpin/post-type-spotlight/commit/788b8ad29a86941359815b73880353c52d39de9b))
* **deps:** update 10up/action-wordpress-plugin-deploy action to v2.2.2 ([117bbb7](https://github.com/linchpin/post-type-spotlight/commit/117bbb7401174d516ef2d77a4ab906ab110936ea))
* **deps:** update actions/checkout action to v4 ([78006dd](https://github.com/linchpin/post-type-spotlight/commit/78006dd566afbbb6d755fc8a2f491873820744a3))
* **deps:** update dependency @wordpress/scripts to ^26.16.0 ([9956a47](https://github.com/linchpin/post-type-spotlight/commit/9956a47e78f9d7071fa6ac6f8acaca60bfed5ad5))
* **deps:** update dependency friendsofphp/php-cs-fixer to ^3.35.1 ([55d697f](https://github.com/linchpin/post-type-spotlight/commit/55d697f87dda32346a987f10841b2b248307969a))
* **deps:** update dependency friendsofphp/php-cs-fixer to ^3.37.1 ([ee29fd1](https://github.com/linchpin/post-type-spotlight/commit/ee29fd17c53a504874c68461f88797e1cb1cad1f))
* **deps:** update dependency phpseclib/phpseclib to v3.0.33 ([3472117](https://github.com/linchpin/post-type-spotlight/commit/3472117683661df13896a0ef243e05cbf4e604d2))
* **deps:** update node.js to v20 ([3426e6c](https://github.com/linchpin/post-type-spotlight/commit/3426e6ceec6610815cf7840e0eabe5308b161e77))
* **deps:** update npm dev dependencies ([77e2ab3](https://github.com/linchpin/post-type-spotlight/commit/77e2ab384bc47d42dff0631d562e08eb6d765465))

## [3.0.0](https://github.com/linchpin/post-type-spotlight/compare/v3.0.0...v3.0.0) (2023-08-19)


### Miscellaneous Chores 🧹

* **NO-JIRA:** Updated .distignore ([599a934](https://github.com/linchpin/post-type-spotlight/commit/599a9343e3bb97d5cf0e765b18054a98ade4107d))

## 2.2.0 ##
* Updated the build process
* Updated PHPCS and WPCS
* Updated Branding
* Updated readme by making it more readable
* Added Gutenberg/Block Editor support

## 2.1.5 ##
* Add support for translate.wordpress.org.

## 2.1.4 ##
* Don't show the featured taxonomy on nav menu edit areas.

## 2.1.3 ##
* Fix another potential PHP notice.

## 2.1.2 ##
* Fix PHP warning when checking for the old method of querying for featured posts.

## 2.1.1 ##
* Fix deprecated widget instantiation method.

## 2.1 ##
* Don't erase other terms in the pts_feature_tax assigned to the post on save. This opens up potential to have more than one type of "featured", (e.g. recommended).

## 2.0 ##
* Changing how featured posts are designated. Instead of post meta, the plugin now uses a hidden taxonomy.
* Added a widget for showing featured posts.
* Fixed the post_class filter to work properly on secondary loops.
* Fixed bug where the featured column would not show when viewing Media in the admin with list view.
* Fixed bug where saving settings did not always work.
* Changed the featured star in the admin to use the WordPress Dashicon font.

## 1.0 ##
* Hello world!
* Add settings to the Settings->Writing page allowing admins to select the post types that can be featured.
* Add a check box in the publish meta box for marking a post as featured.
* Featured posts receive a featured and featured-{$posttype} class on them via the post_class filter.
* Admin post type screens have a column for Featured noting which posts are in fact featured.
