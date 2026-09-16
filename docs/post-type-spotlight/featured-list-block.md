# The Featured List block

Post Type Spotlight registers **Featured List**, a variation of WordPress' core
Query Loop block. It is an ordinary Query Loop with one extra setting: which
side of the featured line its posts come from.

Everything you already know about the Query Loop still applies — the layout, the
inner blocks, the pagination, the post type it runs against. The only thing the
variation adds is the **Spotlight** panel.

## Adding one

In the editor, open the inserter and search for **featured**, **spotlight**, or
**post type spotlight**. Pick **Featured List** — it carries the Post Type
Spotlight mark rather than the usual Query Loop icon.

A new Featured List starts as the ten most recent featured posts, newest first.

> **Already using a plain Query Loop?** You do not have to rebuild it. Insert a
> Featured List, set it up, and delete the old one — or leave the old one alone,
> because the plugin does not touch Query Loops that are not this variation.

## The Spotlight panel

Open the block settings sidebar. Below the Query Loop's own panels there is a
**Spotlight** panel with a single **Show** setting:

| Setting | What you get |
| --- | --- |
| **Only featured** | Only the posts marked as featured. |
| **Featured first** | Every post, with the featured ones moved to the top. |
| **Exclude featured** | Every post except the featured ones. |

**Only featured** is the default.

### Choosing between them

- **Only featured** is the one you want for a "Editor's picks" strip or a
  highlights row — a fixed, curated set.
- **Featured first** behaves like WordPress' sticky posts, except it works on
  any post type you have enabled. Use it for a blog index where featured posts
  should lead but nothing should be hidden.
- **Exclude featured** is the other half of that pattern. Put a **Featured
  first** or **Only featured** loop at the top of a page and an **Exclude
  featured** loop underneath, and nothing appears twice.

## How many posts it shows

Open the **Display** panel in the block settings sidebar:

- **Items per page** — how many posts the loop shows. This is the setting to
  reach for when you want, say, exactly three featured posts.
- **Offset** — how many matching posts to skip before starting. Set **Items per
  page** to 1 and **Offset** to 1 to show only the *second* featured post.
- **Max pages** — caps how many pages the pagination will offer. Leave it at 0
  for no cap.

To show a fixed number of featured posts and no pagination at all, set **Items
per page** to that number and delete the Pagination block from inside the loop.

## Narrowing it further

The **Settings** panel carries the Query Loop's normal controls, and they all
combine with the Spotlight setting:

- **Post type** — which post type to list. Only the post types ticked in
  **Settings → Writing** can be featured, so pointing a Featured List at a post
  type that is not enabled will return nothing in **Only featured** mode.
- **Order by** — the sort order. Under **Featured first** this decides the order
  *within* each group: featured posts sort among themselves, then the rest sort
  among themselves.
- **Filters** — search terms and taxonomy filters, applied on top of the
  featured filter. "Featured posts in the News category" is a Featured List set
  to **Only featured** with a category filter added here.

## Things worth knowing

**The query type control is not offered.** A standard Query Loop can be set to
inherit the template's query — the one the page already ran. The plugin cannot
filter that query, because WordPress renders it without ever building the query
arguments the plugin hooks into. A Featured List therefore always runs its own
query, and the **Default / Custom** toggle is hidden for it.

**The editor preview and the front end run different queries.** That is how the
Query Loop works everywhere, not something this variation introduces: the
preview is drawn from the REST API and the front end from `WP_Query`. The plugin
applies the same three query types to both, so they agree — but if a preview
ever disagrees with the published page, the published page is the truth.

**Other Query Loops are untouched.** A Featured List does not change what any
other Query Loop on the same page returns.

## Doing the same thing in a theme

The variation is a convenience wrapper around a plain taxonomy query. Anything
it does can be done directly in PHP — see
[Querying featured posts](querying.md).
