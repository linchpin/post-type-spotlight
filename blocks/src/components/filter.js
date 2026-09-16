import { SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import {
	DEFAULT_QUERY_TYPE,
	QUERY_TYPE_EXCLUDE_FEATURED,
	QUERY_TYPE_FEATURED_FIRST,
	QUERY_TYPE_FEATURED_ONLY,
} from '../query-loop/constants';

/**
 * Which posts the Featured List variation shows.
 *
 * Built inside the component rather than at module scope so the labels are
 * translated when the panel renders, not when the bundle is first evaluated.
 *
 * @return {Object[]} Options for the select, each with its own help text.
 */
const getQueryTypeOptions = () => [
	{
		value: QUERY_TYPE_FEATURED_ONLY,
		label: __( 'Only featured', 'post-type-spotlight' ),
		help: __( 'Only posts marked as featured.', 'post-type-spotlight' ),
	},
	{
		value: QUERY_TYPE_FEATURED_FIRST,
		label: __( 'Featured first', 'post-type-spotlight' ),
		help: __(
			'Every post, with the featured ones moved to the top.',
			'post-type-spotlight'
		),
	},
	{
		value: QUERY_TYPE_EXCLUDE_FEATURED,
		label: __( 'Exclude featured', 'post-type-spotlight' ),
		help: __(
			'Every post except the featured ones.',
			'post-type-spotlight'
		),
	},
];

/**
 * The Spotlight control in the Featured List inspector.
 *
 * Writes into the block's `query` attribute rather than alongside it. Core
 * forwards the keys it does not recognise there to the REST request behind the
 * editor preview, and hands the whole object to the Post Template as block
 * context, which is where the front end reads it back - so this is the one
 * place a custom query setting reaches both.
 *
 * @param {Object}   props
 * @param {Object}   props.attributes    The block's attributes.
 * @param {Function} props.setAttributes Setter for those attributes.
 * @return {React.ReactElement} The control.
 */
const PTSFilter = ( { attributes, setAttributes } ) => {
	const { query } = attributes;
	const options = getQueryTypeOptions();

	// A Featured List saved before `queryType` moved inside `query` has none,
	// and the default is what it was rendering all along.
	const queryType = query?.queryType || DEFAULT_QUERY_TYPE;

	const selected = options.find( ( option ) => option.value === queryType );

	return (
		<SelectControl
			__nextHasNoMarginBottom
			label={ __( 'Show', 'post-type-spotlight' ) }
			help={ selected?.help }
			value={ queryType }
			options={ options.map( ( { value, label } ) => ( {
				value,
				label,
			} ) ) }
			onChange={ ( nextQueryType ) => {
				setAttributes( {
					query: {
						...query,
						queryType: nextQueryType || DEFAULT_QUERY_TYPE,
					},
				} );
			} }
		/>
	);
};

export default PTSFilter;
