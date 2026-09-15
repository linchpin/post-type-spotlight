import { __, sprintf } from '@wordpress/i18n';
import {
	ToggleControl,
	// HStack has no stable equivalent yet. The Playground screenshot spec
	// covers the sidebar, so a removal upstream shows up as a failed test
	// rather than a silently blank panel.
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalHStack as HStack,
	Tooltip,
	Icon,
} from '@wordpress/components';

import LogoMark from '../components/logo-mark';

/**
 * Upper-case the first letter of a post type slug, lower-casing the rest.
 *
 * Replaces the single lodash call this component pulled the whole library in for.
 *
 * @param {string} value Post type slug.
 * @return {string} The slug with its first letter upper-cased.
 */
const capitalize = ( value ) =>
	value
		? value.charAt( 0 ).toUpperCase() + value.slice( 1 ).toLowerCase()
		: '';

const PTSToggle = ( props ) => {
	const { postType, isFeatured, onUpdateFeatured } = props;

	return (
		<HStack
			alignment="top"
			justify="flex-start"
			spacing="3"
			style={ {
				marginTop: 'calc(12px)',
				minHeight: '3rem',
			} }
		>
			<Tooltip
				text={ sprintf(
					/* translators: %1$s: plural post type label, e.g. "posts". */
					__(
						'You can query all featured %1$s using the pts_feature_tax',
						'post-type-spotlight'
					),
					postType
				) }
			>
				<Icon
					icon={ <LogoMark width={ '24px' } height={ '24px' } /> }
				/>
			</Tooltip>
			<ToggleControl
				checked={ isFeatured }
				label={ sprintf(
					/* translators: %1$s: singular post type label, e.g. "Post". */
					__( 'Feature %1$s', 'post-type-spotlight' ),
					capitalize( postType )
				) }
				onChange={ onUpdateFeatured }
				style={ { marginBottom: '0!important' } }
			/>
		</HStack>
	);
};

export default PTSToggle;
