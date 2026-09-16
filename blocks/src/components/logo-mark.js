/**
 * WordPress dependencies
 */
import { SVG, G, Path } from '@wordpress/primitives';

/**
 * Artwork bounds within the source file's 500 unit square.
 *
 * The mark is not drawn edge to edge in its own viewBox - it sits inset, and
 * off-centre, because the dot overhangs the ring to the top and right. These
 * are the measured bounds of the ink rather than the box around it, so the
 * transform below can centre what a reader actually sees instead of centring
 * the empty margin with it.
 */
const ART_MIN_X = 66.12;
const ART_MIN_Y = 64.21;
const ART_WIDTH = 367.78;
const ART_HEIGHT = 371.58;

/**
 * Side of the icon grid every WordPress icon is drawn on.
 */
const GRID = 24;

/**
 * How much of that grid the artwork should occupy.
 *
 * Core's icons leave a margin rather than filling their box: `published`, the
 * one that sits two rows above this in the Summary panel, is a circle spanning
 * 4.75 to 19.25 of its 24 viewBox, so 15 of 24 with 4.5 clear on each side.
 * Matching that number is what makes this mark read as the same size as the
 * icons around it instead of half again as large.
 */
const ART_SIZE = 15;

const SCALE = ART_SIZE / ART_HEIGHT;
const OFFSET_X = ( GRID - ART_WIDTH * SCALE ) / 2 - ART_MIN_X * SCALE;
const OFFSET_Y = ( GRID - ART_HEIGHT * SCALE ) / 2 - ART_MIN_Y * SCALE;

/**
 * The Post Type Spotlight mark, as an outline.
 *
 * Accepts `size` as well as `width`/`height` because that is the contract
 * WordPress's Icon component uses: passing this component to `<Icon icon>` or
 * a Button's `icon` prop renders it as `<LogoMark size={24} />`, with no width
 * or height at all. Without a `size` fallback the SVG had nothing to constrain
 * it and rendered at full bleed, pushing the button's own label out of view.
 *
 * Drawn in `currentColor` throughout. This replaced a five stop gradient, which
 * is the brand mark and right wherever it is large enough to read as one - but
 * the places this component is used are not those places. It marks the block in
 * the inserter, the plugin in the editor, and the Spotlight row in the Summary
 * panel, and every icon beside it in all three is a single colour inherited
 * from the control. A gradient there read as mud at 15 units and as the one
 * coloured thing in a column of uniform ones.
 *
 * The outline has no filled counterpart and needs none: an outline takes
 * `currentColor` the same way core's own icons do, so there is nothing left for
 * a `monochrome` flag to switch between.
 *
 * @param {Object}        props
 * @param {number|string} [props.size=24] Icon size, used for both dimensions.
 * @param {number|string} [props.width]   Overrides size for width.
 * @param {number|string} [props.height]  Overrides size for height.
 * @return {React.ReactElement} The mark.
 */
export default function LogoMark( props ) {
	const { size = GRID, width, height } = props;

	return (
		<SVG
			xmlns="http://www.w3.org/2000/svg"
			viewBox={ `0 0 ${ GRID } ${ GRID }` }
			width={ width ?? size }
			height={ height ?? size }
		>
			<G
				fill="currentColor"
				transform={ `translate(${ OFFSET_X } ${ OFFSET_Y }) scale(${ SCALE })` }
			>
				<Path d="M431.73,80.95c-2.08-4.92-5.56-9.1-9.93-12.06-.73-.49-1.48-.95-2.26-1.37-3.88-2.11-8.33-3.31-13.06-3.31s-9.18,1.2-13.06,3.31c-.78.42-1.53.88-2.26,1.37-4.37,2.96-7.85,7.14-9.93,12.06-1.39,3.28-2.15,6.88-2.15,10.67,0,15.14,12.27,27.41,27.41,27.41s27.41-12.27,27.41-27.41c0-3.78-.77-7.39-2.15-10.67Z" />
				<Path d="M340.97,98.4c3.31,32.16,29.86,57.54,62.53,58.99v101.37c0,88.43-71.94,160.37-160.37,160.37s-160.36-71.94-160.36-160.37S154.71,98.4,243.14,98.4h97.83ZM200.7,206.89l-54.21,6.78-31.53,3.94,21.18,23.69,38.06,42.57-10.53,61.77-5.52,32.4,29.4-14.7,55.61-27.81,55.61,27.81,29.34,14.67-5.46-32.35-10.44-61.79,37.98-42.59,21.12-23.68-31.49-3.94-54.22-6.78-27.54-55.09-14.9-29.8-14.9,29.8-27.54,55.09h0ZM358.28,81.74h-115.14c-97.77,0-177.02,79.26-177.02,177.02h0c0,97.77,79.26,177.03,177.02,177.03h0c97.77,0,177.03-79.26,177.03-177.03v-119.94c-4.35,1.26-8.93,1.97-13.69,1.97-27.17,0-49.19-22.02-49.19-49.19,0-3.38.34-6.68.99-9.87h0ZM180.08,348.44l11.88-69.68-43.41-48.56,63.06-7.88,31.53-63.06,31.53,63.06,63.06,7.88-43.3,48.56,11.77,69.68-63.06-31.53-63.06,31.53h0Z" />
			</G>
		</SVG>
	);
}
