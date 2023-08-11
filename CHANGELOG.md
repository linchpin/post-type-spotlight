# Changelog #

## [3.0.0](https://github.com/linchpin/post-type-spotlight/compare/v2.2.0...v3.0.0) (2023-08-11)


### Features

* **NO-JIRA:** Better Block Editor Support ([54847c8](https://github.com/linchpin/post-type-spotlight/commit/54847c80315cd9c9c722eb95d1c5d61065e760e3))


### Bug Fixes

* **deps:** update npm frontend ([0e82073](https://github.com/linchpin/post-type-spotlight/commit/0e820735085760623be7c34b9e5111b255c76c98))
* **NO-JIRA:** Update workflows ([98a55f6](https://github.com/linchpin/post-type-spotlight/commit/98a55f668230e7662ee721848722427888a4e52c))


### Miscellaneous Chores

* **deps:** update 10up/action-wordpress-plugin-deploy action to v2 ([2c658e2](https://github.com/linchpin/post-type-spotlight/commit/2c658e2f08ccbab99c576afd327a637e805a3fbe))
* **deps:** update andrew-chen-wang/github-wiki-action action to v4 ([459506c](https://github.com/linchpin/post-type-spotlight/commit/459506c0c6d2a1fa0e35752f1ace7e2d8af9f5c8))
* **deps:** update dependency @wordpress/scripts to ^26.10.0 ([fdbef78](https://github.com/linchpin/post-type-spotlight/commit/fdbef78732ed131798bf5ebc77fd52f13b804c34))
* **deps:** update dependency friendsofphp/php-cs-fixer to ^3.22.0 ([09753a0](https://github.com/linchpin/post-type-spotlight/commit/09753a0df1af16055d2581fa543a1051091df3a8))
* **deps:** update dependency phpseclib/phpseclib to v3.0.21 ([4e51cb7](https://github.com/linchpin/post-type-spotlight/commit/4e51cb7df82f21cf50d19ea47f0e472f9953216c))
* **deps:** update peter-evans/create-pull-request action to v5 ([bac0131](https://github.com/linchpin/post-type-spotlight/commit/bac01318f9b8f9c56f6906380e2815f9e95e8f0e))
* **deps:** update svenstaro/upload-release-action action to v2.7.0 ([24a6bea](https://github.com/linchpin/post-type-spotlight/commit/24a6bea2c9fbc512dae09be26e0d68f09d0b96d6))
* **NO-JIRA:** Cleaning up dependencies ([759117f](https://github.com/linchpin/post-type-spotlight/commit/759117fdca0221e216043c78b8a0e1e88abf9f0f))
* **NO-JIRA:** Release please was not updating all files ([b6cda4f](https://github.com/linchpin/post-type-spotlight/commit/b6cda4f95eeaf0a108da47214bab328b82698631))
* **NO-JIRA:** Updating release files for new version ([a7a9235](https://github.com/linchpin/post-type-spotlight/commit/a7a9235cf8f6c3c5dbce1e7221a67159b0d84018))

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
