import { __ } from '@wordpress/i18n';
import { SelectControl } from '@wordpress/components';

const PTSFilter = ({ attributes, setAttributes }) => {
	const {
		query: { queryType },
	} = attributes;

	return (
		<SelectControl
			value={queryType}
			label={__('Display Type', 'post-type-spotlight')}
			onChange={(nextQueryType) => {
				// filter the tokens to remove wrong items.
				setAttributes({
					query: {
						...attributes.query,
						queryType: nextQueryType || 'featured-only',
					},
				});
			}}
			options={[
				{
					value: 'featured-only',
					label: __('Only Show Featured', 'post-type-spotlight'),
				},
				{
					value: 'featured-first',
					label: __('Show Featured First', 'post-type-spotlight'),
				},
				{
					value: 'featured-exclude',
					label: __('Exclude Featured', 'post-type-spotlight'),
				},
			]}
		/>
	);
};

export default PTSFilter;
