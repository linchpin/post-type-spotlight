import { __, sprintf } from '@wordpress/i18n';
import { Button, Tooltip } from '@wordpress/components';

import LogoMark from './logo-mark';
import PanelRow from './panel-row';

/**
 * The Spotlight row in the editor Summary panel.
 *
 * Rendered as a label plus a value button rather than a toggle switch, because
 * every other row in that panel - Status, Format, Author, Discussion - reads as
 * "label, then the current value as a button". A bare ToggleControl was the only
 * switch among them and sat outside the label column entirely.
 *
 * It toggles on click instead of opening a popover the way Status does. Status
 * has six values and extra controls to house; this has two, and a popover would
 * cost two clicks to flip a boolean.
 *
 * State is carried by the label rather than aria-pressed. Two reasons. WordPress
 * Button applies its `is-pressed` class from a truthy aria-pressed, which paints
 * a dark filled pill - right for a toolbar, wrong for a value in a list of blue
 * values. And a control that changes its own label should not also report
 * aria-pressed: screen readers then announce both, so the featured state reads
 * as "Featured, pressed" and the unfeatured one as "Not featured, not pressed".
 * A label that states the current value is the accepted pattern for this shape
 * of toggle, and is what core's own Status and Format rows do.
 *
 * @param {Object}   props
 * @param {string}   props.postType         Post type slug, for the tooltip.
 * @param {boolean}  props.isFeatured       Whether the post carries the featured term.
 * @param {Function} props.onUpdateFeatured Called with the next featured state.
 * @return {React.ReactElement} The row.
 */
const PTSToggle = ( props ) => {
	const { postType, isFeatured, onUpdateFeatured } = props;

	return (
		<PanelRow label={ __( 'Spotlight', 'post-type-spotlight' ) }>
			<Tooltip
				text={ sprintf(
					/* translators: %1$s: post type slug, e.g. "post". */
					__(
						'Query featured %1$s items with the pts_feature_tax taxonomy',
						'post-type-spotlight'
					),
					postType
				) }
			>
				<Button
					className="pts-spotlight__toggle"
					variant="tertiary"
					size="compact"
					icon={ isFeatured ? LogoMark : undefined }
					onClick={ () => onUpdateFeatured( ! isFeatured ) }
				>
					{ isFeatured
						? __( 'Featured', 'post-type-spotlight' )
						: __( 'Not featured', 'post-type-spotlight' ) }
				</Button>
			</Tooltip>
		</PanelRow>
	);
};

export default PTSToggle;
