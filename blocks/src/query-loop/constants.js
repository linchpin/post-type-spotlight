/**
 * The Query Loop variation this plugin registers.
 *
 * Shared by the variation itself, the inspector control it adds and the check
 * that decides which blocks get that control, so the string is written once.
 */
export const VARIATION_NAME = 'post-type-spotlight/featured-list';

/**
 * Only posts carrying the `featured` term.
 */
export const QUERY_TYPE_FEATURED_ONLY = 'featured-only';

/**
 * Every post, sorted so the featured ones come first.
 */
export const QUERY_TYPE_FEATURED_FIRST = 'featured-first';

/**
 * Every post except the featured ones.
 */
export const QUERY_TYPE_EXCLUDE_FEATURED = 'featured-exclude';

/**
 * What a freshly inserted Featured List shows.
 *
 * The variation is called Featured List and carries the plugin's mark, so it
 * should show featured posts without being configured first.
 */
export const DEFAULT_QUERY_TYPE = QUERY_TYPE_FEATURED_ONLY;

/**
 * Every query type the Spotlight control offers.
 *
 * `queryType` rides inside the block's `query` attribute rather than beside it.
 * Core reads the keys it knows out of `query` and forwards whatever is left to
 * the REST request that draws the editor preview, and passes the whole object
 * to the Post Template as block context, which is where the front end reads it
 * back. An attribute alongside `query` reaches neither.
 */
export const QUERY_TYPES = [
	QUERY_TYPE_FEATURED_ONLY,
	QUERY_TYPE_FEATURED_FIRST,
	QUERY_TYPE_EXCLUDE_FEATURED,
];
