import { InspectorControls } from '@wordpress/block-editor';
import { addFilter } from '@wordpress/hooks';
import { PanelBody } from '@wordpress/components';
import PTSFilter from '../components/filter';

export const withPSTQueryControls = (BlockEdit) => (props) => {
	const isPTSQueryLoopVariation = ({ attributes: { namespace } }) =>
		namespace === 'post-type-spotlight/featured-list';

	return isPTSQueryLoopVariation(props) ? (
		<>
			<BlockEdit {...props} />
			<InspectorControls>
				<PanelBody>
					<PTSFilter {...props} />
				</PanelBody>
			</InspectorControls>
		</>
	) : (
		<BlockEdit {...props} />
	);
};

addFilter('editor.BlockEdit', 'core/query', withPSTQueryControls);
