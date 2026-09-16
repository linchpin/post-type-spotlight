import { __ } from '@wordpress/i18n';
import { registerBlockVariation } from '@wordpress/blocks';

import LogoMark from '../components/logo-mark';
import { DEFAULT_QUERY_TYPE, VARIATION_NAME } from './constants';

import './controls'; // Load our controls

registerBlockVariation( 'core/query', {
	name: VARIATION_NAME,
	title: __( 'Featured List', 'post-type-spotlight' ),
	description: __(
		'A Query Loop that shows the posts marked as featured - or everything that is not.',
		'post-type-spotlight'
	),
	/*
	 * A variation's keywords replace the block's own in the inserter rather
	 * than adding to them, so the words people reach for when they want this
	 * are listed here in full. Without them the variation answered only to its
	 * title, which is why it kept going unnoticed: nobody searching "featured"
	 * or "spotlight" was shown it.
	 */
	keywords: [
		__( 'featured', 'post-type-spotlight' ),
		__( 'spotlight', 'post-type-spotlight' ),
		__( 'post type spotlight', 'post-type-spotlight' ),
		__( 'pts', 'post-type-spotlight' ),
		__( 'highlight', 'post-type-spotlight' ),
		__( 'promoted', 'post-type-spotlight' ),
		__( 'query', 'post-type-spotlight' ),
		__( 'posts', 'post-type-spotlight' ),
	],
	isActive: ( { namespace } ) => namespace === VARIATION_NAME,
	icon: LogoMark,
	attributes: {
		namespace: VARIATION_NAME,
		query: {
			perPage: 10,
			pages: 0,
			offset: 0,
			postType: 'post',
			order: 'desc',
			orderBy: 'date',
			author: '',
			search: '',
			exclude: [],
			sticky: '',
			/*
			 * An inherited query is the template's own, which core renders
			 * without ever building WP_Query arguments - so there is no point
			 * at which the featured filter could be applied. The variation
			 * always runs its own query, and `inherit` is left out of
			 * `allowedControls` below so it stays that way.
			 */
			inherit: false,
			queryType: DEFAULT_QUERY_TYPE,
		},
	},
	scope: [ 'inserter' ],
	innerBlocks: [
		[
			'core/post-template',
			{},
			[ [ 'core/post-title' ], [ 'core/post-excerpt' ] ],
		],
		[ 'core/query-pagination' ],
		[ 'core/query-no-results' ],
	],
	/*
	 * `postCount`, `offset` and `pages` are what core calls the Display panel -
	 * items per page, where to start, and how many pages to allow. Leaving them
	 * out hid that panel entirely, so a Featured List was stuck at ten items
	 * with no way to change it.
	 */
	allowedControls: [
		'postType',
		'order',
		'search',
		'taxQuery',
		'postCount',
		'offset',
		'pages',
	],
} );
