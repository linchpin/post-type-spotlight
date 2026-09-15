/**
 * WordPress dependencies
 */
import {
	SVG,
	G,
	Path,
	Defs,
	Stop,
	Circle,
	LinearGradient,
} from '@wordpress/primitives';

/**
 * Artwork bounds of the mark, which is drawn edge to edge.
 */
const ART_WIDTH = 47.507;
const ART_HEIGHT = 48;

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
const OFFSET_X = ( GRID - ART_WIDTH * SCALE ) / 2;
const OFFSET_Y = ( GRID - ART_HEIGHT * SCALE ) / 2;

/**
 * The Post Type Spotlight mark.
 *
 * Accepts `size` as well as `width`/`height` because that is the contract
 * WordPress's Icon component uses: passing this component to `<Icon icon>` or
 * a Button's `icon` prop renders it as `<LogoMark size={24} />`, with no width
 * or height at all. Without a `size` fallback the SVG had nothing to constrain
 * it and rendered at full bleed, pushing the button's own label out of view.
 *
 * The artwork is inset on core's 24 unit icon grid rather than filling it, for
 * the reason given on `ART_SIZE` above.
 *
 * `monochrome` drops the gradient for a single `currentColor` fill. The five
 * stop gradient is the brand mark and is worth keeping wherever it is large
 * enough to read as one, but at the 15 units an icon actually gets it is mud,
 * and it also puts a second colour next to a column of values that are all one
 * colour. Filling with `currentColor` instead lets the mark inherit whatever
 * colour the control already uses, which is what core's own icons do.
 *
 * @param {Object}        props
 * @param {number|string} [props.size=24]          Icon size, used for both dimensions.
 * @param {number|string} [props.width]            Overrides size for width.
 * @param {number|string} [props.height]           Overrides size for height.
 * @param {boolean}       [props.monochrome=false] Fill with currentColor rather than the brand gradient.
 * @return {React.ReactElement} The mark.
 */
export default function LogoMark( props ) {
	const { size = GRID, width, height, monochrome = false } = props;

	return (
		<SVG
			xmlns="http://www.w3.org/2000/svg"
			viewBox={ `0 0 ${ GRID } ${ GRID }` }
			width={ width ?? size }
			height={ height ?? size }
		>
			{ ! monochrome && (
				<Defs>
					<LinearGradient
						id="pts-logo-mark-gradient"
						x1="15.044"
						y1="46.627"
						x2="31.956"
						y2=".16"
						gradientUnits="userSpaceOnUse"
					>
						<Stop offset={ 0 } stopColor="#7d58c6" />
						<Stop offset={ 0.261 } stopColor="#677bc9" />
						<Stop offset={ 0.581 } stopColor="#51a1cc" />
						<Stop offset={ 0.838 } stopColor="#44b8cf" />
						<Stop offset={ 1 } stopColor="#3fc1d0" />
					</LinearGradient>
				</Defs>
			) }
			<G
				transform={ `translate(${ OFFSET_X } ${ OFFSET_Y }) scale(${ SCALE })` }
			>
				<Circle
					cx="43.966"
					cy="3.54"
					r="3.54"
					fill={ monochrome ? 'currentColor' : '#7a7a7a' }
				/>
				<Path
					d="m43.966,9.895c-3.509,0-6.354-2.845-6.354-6.354,0-.437.044-.863.128-1.275h-14.873C10.238,2.266,0,12.504,0,25.133h0c0,12.629,10.238,22.867,22.867,22.867h0c12.629,0,22.867-10.238,22.867-22.867v-15.489c-.562.162-1.154.251-1.768.251Zm-12.953,26.821l-8.146-4.073-8.146,4.073,1.534-9.001-5.607-6.272,8.146-1.018,4.073-8.146,4.073,8.146,8.146,1.018-5.594,6.272,1.521,9.001Z"
					fill={
						monochrome
							? 'currentColor'
							: 'url(#pts-logo-mark-gradient)'
					}
				/>
			</G>
		</SVG>
	);
}
