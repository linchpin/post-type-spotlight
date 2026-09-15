import {
	// No stable equivalent. Core's own PostPanelRow is built on HStack, and
	// matching its DOM is the whole point of this component.
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalHStack as HStack,
} from '@wordpress/components';

/**
 * A row in the editor Summary panel, shaped exactly like the ones core renders.
 *
 * Core has this component already - @wordpress/editor's PostPanelRow, which is
 * what draws the Status, Format and Discussion rows - but it is internal and
 * exported from neither the package index nor its private APIs, so it cannot be
 * imported. This is a copy of its markup.
 *
 * Copying the class names rather than writing our own is deliberate. The editor
 * stylesheet already defines the 38% label column and the control column, and
 * PluginPostStatusInfo renders its fills inside the same Stack as PostStatusPanel
 * and PostFormatPanel, so reusing those classes puts our row on the same grid as
 * the core rows for free. Custom CSS here would be a second set of measurements
 * to keep in step with core's.
 *
 * @param {Object}          props
 * @param {string}          props.label    Text for the label column.
 * @param {React.ReactNode} props.children Content for the control column.
 * @return {React.ReactElement} The row.
 */
const PanelRow = ( { label, children } ) => (
	<HStack className="editor-post-panel__row">
		{ label && (
			<div className="editor-post-panel__row-label">{ label }</div>
		) }
		<div className="editor-post-panel__row-control">{ children }</div>
	</HStack>
);

export default PanelRow;
