/**
 * The Post Type Spotlight admin app: feature types, and About Linchpin.
 *
 * Mounted on the page Post_Type_Spotlight_Admin_Page registers. Every piece of
 * chrome around the views - the brand bar, the page header, the two-column
 * body, the help column and the footer - comes from @linchpinagency/ui, so
 * what is left in this file is the plugin's: which sections exist and what the
 * header says.
 */

/**
 * WordPress dependencies
 */
import { createRoot } from '@wordpress/element';
import domReady from '@wordpress/dom-ready';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';

/**
 * External dependencies
 */
import {
	AboutLinchpinPage,
	currentSection,
	LinchpinAdminFooter,
	LinchpinAdminFrame,
	LinchpinAdminLayout,
	LinchpinAdminPage,
	LinchpinAdminTopBar,
	LinchpinNotices,
	sectionNavigation,
} from '@linchpinagency/ui';
import '@linchpinagency/ui/style.css';

/**
 * Internal dependencies
 */
import './scss/admin.scss';
import { BRAND, LINKS } from './brand';
import Sidebar from './components/sidebar';
import FeatureTypesView from './views/feature-types';

const boot = window.postTypeSpotlightAdmin || {};

if ( boot.restUrl ) {
	apiFetch.use( apiFetch.createRootURLMiddleware( boot.restUrl ) );
}

if ( boot.nonce ) {
	apiFetch.use( apiFetch.createNonceMiddleware( boot.nonce ) );
}

const PLUGIN = {
	name: __( 'Post Type Spotlight', 'post-type-spotlight' ),
	slug: 'post-type-spotlight',
	version: boot.version,
};

/*
 * Sections are links, not tab state: `sectionNavigation()` builds one href per
 * section and `currentSection()` reads the active one back out of `?tab=`, so
 * each is linkable and survives a reload.
 */
const SECTIONS = [
	{
		name: 'feature-types',
		label: __( 'Feature types', 'post-type-spotlight' ),
	},
	{ name: 'about', label: __( 'About', 'post-type-spotlight' ) },
];

// The About page carries the agency's help and contact links itself, so the
// help column beside it would say the same thing twice.
const FULL_WIDTH = [ 'about' ];

/**
 * The view behind a section.
 *
 * @param {Object} props         Props.
 * @param {string} props.section Section name.
 * @return {Element} View.
 */
function View( { section } ) {
	switch ( section ) {
		case 'about':
			return <AboutLinchpinPage />;
		default:
			return <FeatureTypesView writingUrl={ boot.writingUrl } />;
	}
}

/**
 * The app.
 *
 * @return {Element} The app.
 */
function App() {
	const section = currentSection( { sections: SECTIONS } );

	return (
		<LinchpinAdminFrame
			plugin={ PLUGIN }
			brand={ BRAND }
			links={ LINKS }
			/*
			 * No `logo`: the plugin has a mark but no wordmark, and the bar
			 * shows either a logo or the plugin's name. A bare mark would leave
			 * the bar without the name.
			 */
			topBar={ <LinchpinAdminTopBar /> }
		>
			<LinchpinAdminPage
				subTitle={ __(
					'Feature posts, pages and any custom post type, and keep as many kinds of featured as the site needs.',
					'post-type-spotlight'
				) }
				navigation={ sectionNavigation( { sections: SECTIONS } ) }
				actions={
					<Button
						__next40pxDefaultSize
						variant="secondary"
						href={ LINKS.readme }
						target="_blank"
						rel="noreferrer"
					>
						{ __( 'Documentation', 'post-type-spotlight' ) }
					</Button>
				}
			>
				<LinchpinNotices />

				<LinchpinAdminLayout
					label={ __(
						'About Post Type Spotlight',
						'post-type-spotlight'
					) }
					sidebar={
						FULL_WIDTH.includes( section ) ? undefined : <Sidebar />
					}
				>
					<View section={ section } />
				</LinchpinAdminLayout>
			</LinchpinAdminPage>

			<LinchpinAdminFooter />
		</LinchpinAdminFrame>
	);
}

domReady( () => {
	const mount = document.getElementById( 'post-type-spotlight-admin' );

	if ( ! mount ) {
		return;
	}

	// The frame owns ThemeProvider and SlotFillProvider; add neither.
	createRoot( mount ).render( <App /> );
} );
