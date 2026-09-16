import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';

import PTSFilter from '../components/filter';
import { VARIATION_NAME } from './constants';

/**
 * Adds the Spotlight panel to the Featured List variation.
 *
 * `editor.BlockEdit` runs for every block in the editor, so the guard checks
 * the block name before the attribute: most blocks have no `namespace` at all,
 * and a handful of unrelated ones do.
 *
 * @param {Function} BlockEdit The block's edit component.
 * @return {Function} The wrapped edit component.
 */
export const withPTSQueryControls = ( BlockEdit ) => ( props ) => {
	const isFeaturedList =
		'core/query' === props.name &&
		VARIATION_NAME === props.attributes?.namespace;

	if ( ! isFeaturedList ) {
		return <BlockEdit { ...props } />;
	}

	return (
		<>
			<BlockEdit { ...props } />
			<InspectorControls>
				<PanelBody
					title={ __( 'Spotlight', 'post-type-spotlight' ) }
					initialOpen
				>
					<PTSFilter { ...props } />
				</PanelBody>
			</InspectorControls>
		</>
	);
};

/*
 * Namespaced to this plugin. The previous namespace was `core/query`, which is
 * a name core is entitled to use for its own filters on this hook; a collision
 * there would have silently replaced one of the two.
 */
addFilter(
	'editor.BlockEdit',
	'post-type-spotlight/query-loop-controls',
	withPTSQueryControls
);
