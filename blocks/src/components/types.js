import { __, sprintf } from '@wordpress/i18n';
import {
	Button,
	CheckboxControl,
	Dropdown,
	// No stable equivalent; core's own Summary panel popovers stack their
	// controls with it.
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalVStack as VStack,
} from '@wordpress/components';
// The header core puts on every Summary panel popover - title plus close
// button. Not exported under a stable name.
// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
import { __experimentalInspectorPopoverHeader as InspectorPopoverHeader } from '@wordpress/block-editor';
import { useMemo, useState } from '@wordpress/element';

import PanelRow from './panel-row';
import { MonochromeMark } from './toggle';

/**
 * The Spotlight row in the editor Summary panel, once a site has more than one
 * feature type.
 *
 * A single toggle stops working at two types: one click cannot say which. So
 * the row does what core's Status row does with its several values - shows
 * the current ones as a button, and opens a popover to change them, with a
 * checkbox per type because a post can carry any number of them at once.
 *
 * The button keeps the single-type toggle's class, size and padding so the row
 * sits on the panel's rhythm exactly as it did before a second type existed.
 *
 * @param {Object}   props
 * @param {Object[]} props.featureTypes        Every feature type, as `{ id, slug, name }`.
 * @param {number[]} props.postTerms           Ids of the feature types the post carries.
 * @param {Function} props.onUpdateFeatureType Called with a type's id and whether it is now on.
 * @return {React.ReactElement} The row.
 */
const PTSTypes = ( { featureTypes, postTerms, onUpdateFeatureType } ) => {
	// Anchor to the whole row, as core does, so the popover opens beside the
	// sidebar level with the row instead of on top of the button.
	const [ popoverAnchor, setPopoverAnchor ] = useState( null );
	const popoverProps = useMemo(
		() => ( {
			anchor: popoverAnchor,
			'aria-label': __( 'Spotlight', 'post-type-spotlight' ),
			placement: 'left-start',
			offset: 36,
			shift: true,
		} ),
		[ popoverAnchor ]
	);

	const activeTypes = featureTypes.filter( ( { id } ) =>
		postTerms.includes( id )
	);

	const label = activeTypes.length
		? activeTypes.map( ( { name } ) => name ).join( ', ' )
		: __( 'Not featured', 'post-type-spotlight' );

	return (
		<PanelRow
			label={ __( 'Spotlight', 'post-type-spotlight' ) }
			ref={ setPopoverAnchor }
		>
			<Dropdown
				contentClassName="pts-spotlight__types"
				popoverProps={ popoverProps }
				focusOnMount
				renderToggle={ ( { isOpen, onToggle } ) => (
					<Button
						className="pts-spotlight__toggle"
						variant="tertiary"
						size="compact"
						icon={ activeTypes.length ? MonochromeMark : undefined }
						// See the single-type toggle for why this is inline.
						style={ { paddingTop: '4px', paddingBottom: '4px' } }
						onClick={ onToggle }
						aria-expanded={ isOpen }
						aria-label={ sprintf(
							/* translators: %s: the post's feature types, e.g. "Featured, Recommended". */
							__( 'Change spotlight: %s', 'post-type-spotlight' ),
							label
						) }
					>
						{ label }
					</Button>
				) }
				renderContent={ ( { onClose } ) => (
					<>
						<InspectorPopoverHeader
							title={ __( 'Spotlight', 'post-type-spotlight' ) }
							onClose={ onClose }
						/>
						<VStack spacing={ 3 }>
							{ featureTypes.map( ( { id, name } ) => (
								<CheckboxControl
									key={ id }
									__nextHasNoMarginBottom
									label={ name }
									checked={ postTerms.includes( id ) }
									onChange={ ( checked ) =>
										onUpdateFeatureType( id, checked )
									}
								/>
							) ) }
						</VStack>
					</>
				) }
			/>
		</PanelRow>
	);
};

export default PTSTypes;
