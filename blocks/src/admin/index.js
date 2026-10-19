import { registerPlugin } from '@wordpress/plugins';
import { PluginPostStatusInfo } from '@wordpress/edit-post';
import { useSelect, useDispatch } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';

// Internal Components
import PTSToggle from '../components/toggle';
import PTSTypes from '../components/types';
import LogoMark from '../components/logo-mark';
import useFeatureTypes, { FEATURED_SLUG } from '../utils/use-feature-types';

const Admin = () => {
	const postId = useSelect( ( select ) =>
		select( 'core/editor' ).getCurrentPostId()
	);
	const postType = useSelect( ( select ) =>
		select( 'core/editor' ).getCurrentPostType()
	);
	const featureTypes = useFeatureTypes();
	let postTerms = useSelect( ( select ) =>
		select( 'core/editor' ).getEditedPostAttribute( 'pts_feature_tax' )
	);

	if ( ! postTerms ) {
		postTerms = [];
	} else if ( ! Array.isArray( postTerms ) ) {
		postTerms = [ postTerms ];
	}

	/*
	 * Whether this post type can be featured, read from the post type rather
	 * than the plugin's setting. The setting lives in /wp/v2/settings, which
	 * answers only users with `manage_options`, so for editors and authors it
	 * never loaded and the row was never shown. The taxonomy is registered for
	 * exactly the enabled post types, and the post type object listing it is
	 * readable by anyone who can edit the post.
	 */
	const isEnabled = useSelect(
		( select ) =>
			!! select( coreStore )
				.getPostType( postType )
				?.taxonomies?.includes( 'pts_feature_tax' ),
		[ postType ]
	);

	// Must stay above the early return below: hooks have to run in the same
	// order on every render, and this one used to sit after it.
	const { editEntityRecord } = useDispatch( 'core' );

	if ( ! isEnabled ) {
		return null;
	}

	const onUpdateFeatureType = ( termId, enabled ) => {
		const updatedTerms = enabled
			? [ ...postTerms, termId ]
			: postTerms.filter( ( postTermId ) => postTermId !== termId );

		editEntityRecord( 'postType', postType, postId, {
			pts_feature_tax: updatedTerms,
		} );
	};

	/*
	 * With a second feature type the row lists them in a popover. With only
	 * `featured` it stays the one-click toggle it has always been, so a site
	 * that never adds a type sees no change.
	 */
	if ( featureTypes.length > 1 ) {
		return (
			<PluginPostStatusInfo className="pts-post-settings-panel">
				<PTSTypes
					featureTypes={ featureTypes }
					postTerms={ postTerms }
					onUpdateFeatureType={ onUpdateFeatureType }
				/>
			</PluginPostStatusInfo>
		);
	}

	const featuredTerm = featureTypes.find(
		( { slug } ) => FEATURED_SLUG === slug
	)?.id;
	const isFeatured = !! featuredTerm && postTerms.includes( featuredTerm );

	return (
		// PluginPostStatusInfo reads only children and className; the name,
		// title and style props this used to pass were silently discarded.
		<PluginPostStatusInfo className="pts-post-settings-panel">
			<PTSToggle
				onUpdateFeatured={ ( newValue ) =>
					featuredTerm &&
					onUpdateFeatureType( featuredTerm, newValue )
				}
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
