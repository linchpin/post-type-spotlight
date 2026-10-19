/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { postList, starFilled, tag } from '@wordpress/icons';

/**
 * External dependencies
 */
import {
	AboutLinchpinCard,
	FeatureListCard,
	HelpCard,
} from '@linchpinagency/ui';

/**
 * What a feature type is, in three lines.
 *
 * Built in the component rather than at module scope so the strings are
 * translated when the column renders, not when the bundle first loads.
 *
 * @return {Object[]} Items for the card.
 */
const howItWorks = () => [
	{
		icon: starFilled,
		text: __(
			'Featured is built in. Add more kinds of featured beside it, such as Recommended or Hand Picked.',
			'post-type-spotlight'
		),
	},
	{
		icon: postList,
		text: __(
			'Mark posts from the editor’s Spotlight row, the Publish box or Quick Edit.',
			'post-type-spotlight'
		),
	},
	{
		icon: tag,
		text: __(
			'List them with the Featured List block, or query a type’s slug in pts_feature_tax.',
			'post-type-spotlight'
		),
	},
];

/**
 * The help column beside the work.
 *
 * Three cards, all of them the library's: what feature types are, where to
 * get help, and who makes the plugin. Only the first carries copy of the
 * plugin's own.
 *
 * @return {Element} The cards.
 */
export default function Sidebar() {
	return (
		<>
			<FeatureListCard
				title={ __( 'How feature types work', 'post-type-spotlight' ) }
				items={ howItWorks() }
			/>
			<HelpCard />
			<AboutLinchpinCard />
		</>
	);
}
