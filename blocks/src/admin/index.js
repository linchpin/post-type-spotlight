import { registerPlugin } from '@wordpress/plugins';
import { PluginPostStatusInfo } from '@wordpress/edit-post';
import { __ } from '@wordpress/i18n';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEntityProp } from "@wordpress/core-data";

// Internal Components
import PTSToggle from '../components/toggle';
import LogoMark from '../components/logo-mark';

const Admin = () => {

  const postId = useSelect( ( select ) => select( 'core/editor' ).getCurrentPostId() );
  const postType = useSelect( ( select ) => select( 'core/editor' ).getCurrentPostType() );
  let featuredTerm = useSelect( ( select ) => select( 'core' ).getEntityRecords( 'taxonomy', 'pts_feature_tax', { slug: 'featured' } ) );
  let postTerms = useSelect( ( select ) => select( 'core/editor' ).getEditedPostAttribute( 'pts_feature_tax' ) );

  if ( postTerms && ! Array.isArray( postTerms ) ) {
    postTerms = [ postTerms ];
  }

  const [ postTypeSpotlightSettings ] = useEntityProp( 'root', 'site', 'pts_featured_post_types_settings' );

  // If the post type is not enabled in our writing settings
  // then we can die early.
  if ( ! postTypeSpotlightSettings || ( postTypeSpotlightSettings && postTypeSpotlightSettings.indexOf( postType ) === -1 ) ) {
    return null;
  }

  featuredTerm = featuredTerm ? featuredTerm[0]?.id : null;
  const isFeatured  = featuredTerm && (postTerms.includes( featuredTerm ) || postTerms === featuredTerm );

  const { editEntityRecord } = useDispatch( 'core' );

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
      <PTSToggle onUpdateFeatured={onUpdateFeatured} isFeatured={isFeatured} postType={postType} />
		</PluginPostStatusInfo>
	);
}

registerPlugin( 'post-type-post-settings', {
	render: Admin,
	icon: LogoMark,
} );
