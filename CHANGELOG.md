# Changelog #

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
