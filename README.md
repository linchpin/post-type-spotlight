![Post Type Spotlight](https://github.com/linchpin/post-type-spotlight/blob/master/.wordpress-org/banner-1544x500.png?raw=true)

![Build Status](https://github.com/linchpin/post-type-spotlight/workflows/release-please/badge.svg?raw=true)

<!-- x-release-please-start-version -->
## Latest Release: 3.0.3
<!-- x-release-please-end -->

# Post Type Spotlight #

Easily allows you to designate posts, pages, attachments and custom post types as featured.

## Description ##

The plugin displays a toggle within the publish area to feature a post. The toggle only appears on admin selected post types which can be selected in the `Settings -> Writing` screen.

**When a post is designated as featured:**

*   It receives `featured` and `featured-{$posttype}` classes via the post_class filter.
*   Shows featured ⭐️ in the post type's admin post list screen.
*   Assigns the post a hidden taxonomy term (featured) that can easily be queried via the `pts_feature_tax` taxonomy.

* Note: For the plugin to work on attachments, you must be using 3.5 or above. All other features will work on 3.1.0 and up.*

## New in Version 3.0.0 ##

* Better compatibility with the Block Editor and the enhancements it brings.
* Added a new Featured Posts Variation of the Query Loop
* Added the ability to filter teh Featured Posts Query Loop to only show featured posts
* Added the ability to filter the Featured Posts Query Loop to show all posts excluding featured posts
* Added the ability to filter the Featured Posts Query Loop to show all posts and show featured posts first (similar to sticky)
* Updated all dependencies
* Added the ability to sort post lists by featured posts.

## Installation ##

1. Upload the plugin folder to the `/wp-content/plugins/` directory
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Navigate to the Settings->Writing section and select the post types you would like to have the featured abilities.


## Screenshots ##

1. The settings page.
2. Options on the edit screen
3. Markup example when using post_class();
4. Shows featured posts in post edit tables.

![Linchpin](https://github.com/linchpin/brand-assets/blob/master/github-banner@2x.jpg?raw=true)
