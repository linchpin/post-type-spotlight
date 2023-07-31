import { registerPlugin } from '@wordpress/plugins';
import { PluginPostStatusInfo } from '@wordpress/edit-post';
import { __ } from '@wordpress/i18n';
import {ToggleControl} from "@wordpress/components";
import { useSelect } from '@wordpress/data';
import { useEntityProp } from '@wordpress/core-data';
import {capitalize} from "lodash";

const Admin = () => {

	const postType = useSelect(
		( select ) => select( 'core/editor' ).getCurrentPostType(),
		[]
	);

	const [ meta, setMeta ] = useEntityProp( 'postType', postType, 'meta' );

	const metaFieldValue = meta[ '_lp_hide_title' ];
	const updateMetaValue = ( newValue ) => {
		setMeta( { ...meta, _lp_hide_title: newValue } );
	};

	useSelect( ( select ) => {

		const titleBlock = document.querySelector( '.wp-block-post-title' );

		if ( titleBlock ) {
			const bodyClass = meta._lp_hide_title ? 'linchpin-title-hidden' : 'linchpin-title-visible';

			document.body.classList.remove( 'linchpin-title-visible' );
			document.body.classList.remove( 'linchpin-title-hidden' );

			document.body.classList.add( bodyClass );
		}

	});

	return (
		<PluginPostStatusInfo
			name="linchpin-post-settings-panel"
			title={ __('Linchpin Settings', 'linchpin' ) }
			className="linchpin-post-settings"
		>
			<ToggleControl
				label={ sprintf( __( 'Hide Title for this %1$s', 'linchpin' ), capitalize( postType ) ) }
				checked={ meta._lp_hide_title }
				onChange={( ) => {
					updateMetaValue( ! meta._lp_hide_title );
				} }
				help={ meta._lp_hide_title  ? __( 'Title is hidden and only visible in the admin', 'linchpin' ) : null }
			/>
		</PluginPostStatusInfo>
	);
}

registerPlugin( 'linchpin-post-settings', {
	render: Admin,
	icon: 'palmtree',
} );
