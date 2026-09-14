import { registerPlugin } from '@wordpress/plugins';
import { PluginPostStatusInfo } from '@wordpress/edit-post';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEntityProp } from '@wordpress/core-data';

// Internal Components
import PTSToggle from '../components/toggle';
import LogoMark from '../components/logo-mark';

const Admin = () => {
	const postId = useSelect( ( select ) =>
		select( 'core/editor' ).getCurrentPostId()
	);
	const postType = useSelect( ( select ) =>
		select( 'core/editor' ).getCurrentPostType()
	);
	let featuredTerm = useSelect( ( select ) =>
		select( 'core' ).getEntityRecords( 'taxonomy', 'pts_feature_tax', {
			slug: 'featured',
		} )
	);
	let postTerms = useSelect( ( select ) =>
		select( 'core/editor' ).getEditedPostAttribute( 'pts_feature_tax' )
	);

	if ( postTerms && ! Array.isArray( postTerms ) ) {
		postTerms = [ postTerms ];
	}

	const [ postTypeSpotlightSettings ] = useEntityProp(
		'root',
		'site',
		'pts_featured_post_types_settings'
	);

	// Must stay above the early return below: hooks have to run in the same
	// order on every render, and this one used to sit after it.
	const { editEntityRecord } = useDispatch( 'core' );

	// If the post type is not enabled in our writing settings
	// then we can die early.
	if (
		! postTypeSpotlightSettings ||
		( postTypeSpotlightSettings &&
			postTypeSpotlightSettings.indexOf( postType ) === -1 )
	) {
		return null;
	}

	featuredTerm = featuredTerm ? featuredTerm[ 0 ]?.id : null;
	const isFeatured =
		featuredTerm &&
		( postTerms.includes( featuredTerm ) || postTerms === featuredTerm );

	const onUpdateFeatured = ( newValue ) => {
		const updatedTerms = newValue
			? [ ...postTerms, featuredTerm ]
			: postTerms.filter( ( termId ) => termId !== featuredTerm );

		editEntityRecord( 'postType', postType, postId, {
			pts_feature_tax: updatedTerms,
		} );
	};

	return (
		// PluginPostStatusInfo reads only children and className; the name,
		// title and style props this used to pass were silently discarded.
		<PluginPostStatusInfo className="pts-post-settings-panel">
			<PTSToggle
				onUpdateFeatured={ onUpdateFeatured }
				isFeatured={ isFeatured }
				postType={ postType }
			/>
		</PluginPostStatusInfo>
	);
};

registerPlugin( 'post-type-post-settings', {
	render: Admin,
	icon: LogoMark,
} );
