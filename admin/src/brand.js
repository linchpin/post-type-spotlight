/**
 * Post Type Spotlight's brand and links, in one place.
 *
 * Both come from @linchpinagency/ui, so this file names what is the plugin's
 * and nothing else. `defineBrand()` turns the colours into the `--lp-brand-*`
 * custom properties the chrome paints with and seeds the design system from
 * `primary`; `linchpinLinks()` builds the links every Linchpin admin screen
 * carries.
 */

/**
 * External dependencies
 */
import { defineBrand, linchpinLinks } from '@linchpinagency/ui';

/**
 * The colours come from the plugin's mark, whose gradient runs from violet to
 * teal. `primary` is the violet stop itself; the bar runs from a deep violet
 * to a deep teal, the same two hues taken dark enough to carry white text.
 */
export const BRAND = defineBrand( {
	primary: '#7d58c6',
	deep: '#1e1438',
	deepEnd: '#0c3a41',
} );

export const LINKS = linchpinLinks( { plugin: 'post-type-spotlight' } );
