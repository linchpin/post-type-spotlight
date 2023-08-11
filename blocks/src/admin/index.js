import { registerPlugin } from '@wordpress/plugins';
import { PluginPostStatusInfo } from '@wordpress/edit-post';
import { __ } from '@wordpress/i18n';
import { ToggleControl, Card, CardBody, __experimentalHeading as Heading, __experimentalHStack as HStack, Tooltip, Icon } from "@wordpress/components";
import { useSelect, useDispatch } from '@wordpress/data';
import { useEntityProp } from "@wordpress/core-data";
import {capitalize} from "lodash";

import LogoMark from '../components/logo-mark';

const Admin = () => {

  const postId = useSelect( ( select ) => select( 'core/editor' ).getCurrentPostId() );
  const postType = useSelect( ( select ) => select( 'core/editor' ).getCurrentPostType() );
  let featuredTerm = useSelect( ( select ) => select( 'core' ).getEntityRecords( 'taxonomy', 'pts_feature_tax', { slug: 'featured' } ) );
  let postTerms = useSelect( ( select ) => select( 'core/editor' ).getEditedPostAttribute( 'pts_feature_tax' ) );

  if ( postTerms && ! Array.isArray( postTerms ) ) {
    postTerms = [ postTerms ];
  }

  featuredTerm = featuredTerm ? featuredTerm[0]?.id : null;
  const isFeatured  = featuredTerm && (postTerms.includes( featuredTerm ) || postTerms === featuredTerm );

  const { editEntityRecord, saveEntityRecord } = useDispatch( 'core' );

  const [ postTypeSpotlightSettings, setPostTypeSpotlightSettings ] = useEntityProp( 'root', 'site', 'pts_featured_post_types_settings' );

  // If the post type is not enabled in our writing settings
  // then we can die early.
  if ( ! postTypeSpotlightSettings || ( postTypeSpotlightSettings && postTypeSpotlightSettings.indexOf( postType ) === -1 ) ) {
    return null;
  }

  const onUpdateFeatured = ( newValue ) => {
    const updatedTerms = newValue
      ? [...postTerms, featuredTerm]
      : postTerms.filter( ( termId ) => termId !== featuredTerm );

    editEntityRecord( 'postType', postType, postId, { pts_feature_tax: updatedTerms } );
  };

	return (
		<PluginPostStatusInfo
			name="pts-post-settings-panel"
			title={ __('Post Type Spotlight Settings', 'linchpin' ) }
			className="pts-post-settings-panel"
      style={{width:'100%'}}
		>
            <HStack
              alignment="top"
              justify="flex-start"
              spacing="3"
              style={{
                marginTop: "calc(12px)",
                minHeight: '3rem'
              }}
            >
              <Tooltip text={sprintf(__('You can query all featured %1$s using the pts_feature_tax'), postType)}>
                  <Icon icon={<LogoMark width={'24px'} height={'24px'} />} />
              </Tooltip>
              <ToggleControl
                checked={isFeatured}
                label={ sprintf( __( 'Feature %1$s', 'post-type-spotlight' ), capitalize( postType ) ) }
                onChange={onUpdateFeatured}
                style={{marginBottom:"0!important"}}
              />
            </HStack>
		</PluginPostStatusInfo>
	);
}

registerPlugin( 'post-type-post-settings', {
	render: Admin,
	icon: LogoMark,
} );
