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

## The Featured Posts block

The plugin registers a **Featured List** variation of the core Query Loop block,
plus a control that changes how the query treats featured posts:

| Mode | Result |
| --- | --- |
| Only featured | Returns featured posts only |
| Exclude featured | Returns everything except featured posts |
| Featured first | Returns everything, featured posts sorted to the top |

## The Featured Posts widget

A **Featured Posts** widget is registered for themes that still use the classic
widget areas.
