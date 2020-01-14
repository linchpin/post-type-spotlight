![Post Type Spotlight](https://github.com/linchpin/post-type-spotlight/blob/master/.wordpress-org/banner-1544x500.png?raw=true)

![Build Status](https://github.com/linchpin/post-type-spotlight/workflows/Create%20Release/badge.svg)
[![Maintainability](https://api.codeclimate.com/v1/badges/571cf2f2437f6fe80c1a/maintainability)](https://codeclimate.com/github/linchpin/post-type-spotlight/maintainability)
# Post Type Spotlight #

Easily allows you to designate posts, pages, attachments and custom post types as featured.

## Description ##

The plugin displays a checkbox in the publish meta box to feature a post. The checkbox only appears on admin selected post types which can be selected in the Settings->Writing screen.

When a post is designated as featured:

*   It receives 'featured' and 'featured-{$posttype}' classes via the post_class filter.
*   Shows featured posts as such in the post type's admin screen
*   Assigns a post a hidden taxonomy term (featured) that can easily be queried.

*Note: For the plugin to work on attachments, you must be using 3.5 or above. All other features will work on 3.1.0 and up.*

## Installation ##

1. Upload the plugin folder to the `/wp-content/plugins/` directory
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Navigate to the Settings->Writing section and select the post types you would like to have the featured abilities.


## Screenshots ##

1. The settings page.
2. Options on the edit screen
3. Markup example when using post_class();
4. Shows featured posts in post edit tables.