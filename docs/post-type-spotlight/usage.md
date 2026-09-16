# Usage

## Choosing which post types can be featured

Go to **Settings → Writing**. The **Featured Post Types** section lists every
public post type on the site. Tick the ones that should gain the featured
control, and save.

Only the post types you tick get the editor control, the admin column, and the
Featured view filter.

## Featuring a post

### Block editor

Open a post of an enabled type. In the editor sidebar, under the **Post** tab,
the **Summary** panel gains a **Feature _Post type_** toggle. Turning it on and
saving marks the post as featured.

### Classic editor

The Publish meta box gains a **Feature this _Post type_** checkbox. The label is
filterable — see [Development](development.md).

## Finding featured posts in the admin

On an enabled post type's list screen:

- A **Featured** column shows a star for each featured item.
- A **Featured** link appears in the views row at the top, with a count. It
  filters the list to featured items only.

## The Featured List block

The plugin registers a **Featured List** variation of the core Query Loop block.
Search the inserter for **featured** or **spotlight** to find it.

Its **Spotlight** panel decides which posts the loop returns:

| Setting | Result |
| --- | --- |
| Only featured | Featured posts only |
| Featured first | Everything, featured posts sorted to the top |
| Exclude featured | Everything except featured posts |

How many it returns is the Query Loop's own **Items per page** setting, in the
**Display** panel.

See [The Featured List block](featured-list-block.md) for the full walkthrough.

## The Featured Posts widget

A **Featured Posts** widget is registered for themes that still use the classic
widget areas.
