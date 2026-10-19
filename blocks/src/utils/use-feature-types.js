/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { useMemo } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import { __ } from '@wordpress/i18n';

/**
 * Slug of the feature type the plugin creates, and every screen was built for.
 */
export const FEATURED_SLUG = 'featured';

/**
 * Every feature type, in one request.
 *
 * `context: 'view'` because core-data asks for terms in the edit context unless
 * told otherwise, and the terms endpoint refuses that with a 403 to anyone who
 * cannot manage terms. Reading names and slugs needs no more than `view`, and
 * core's own category and tag panels pass it for the same reason.
 */
const FEATURE_TYPES_QUERY = {
	per_page: -1,
	context: 'view',
	_fields: 'id,name,slug',
};

/**
 * The site's feature types, `featured` first and the rest by name.
 *
 * `featured` is labelled "Featured" whatever its term is called: the plugin
 * creates it with the lowercase name `featured`, which reads as a slug.
 *
 * @return {Object[]} Feature types as `{ id, slug, name }`. Empty while loading.
 */
export default function useFeatureTypes() {
	const records = useSelect(
		( select ) =>
			select( coreStore ).getEntityRecords(
				'taxonomy',
				'pts_feature_tax',
				FEATURE_TYPES_QUERY
			),
		[]
	);

	return useMemo( () => {
		if ( ! Array.isArray( records ) ) {
			return [];
		}

		const featureTypes = records.map( ( { id, slug, name } ) => ( {
			id,
			slug,
			name:
				FEATURED_SLUG === slug
					? __( 'Featured', 'post-type-spotlight' )
					: decodeEntities( name ),
		} ) );

		return [
			...featureTypes.filter( ( { slug } ) => FEATURED_SLUG === slug ),
			...featureTypes
				.filter( ( { slug } ) => FEATURED_SLUG !== slug )
				.sort( ( a, b ) => a.name.localeCompare( b.name ) ),
		];
	}, [ records ] );
}
