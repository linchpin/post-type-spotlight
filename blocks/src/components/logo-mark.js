/**
 * WordPress dependencies
 */
import {
	SVG,
	Path,
	Defs,
	Stop,
	Circle,
	LinearGradient,
} from '@wordpress/primitives';

/**
 * The Post Type Spotlight mark.
 *
 * Accepts `size` as well as `width`/`height` because that is the contract
 * WordPress's Icon component uses: passing this component to `<Icon icon>` or
 * a Button's `icon` prop renders it as `<LogoMark size={24} />`, with no width
 * or height at all. Without a `size` fallback the SVG had nothing to constrain
 * it and rendered at full bleed, pushing the button's own label out of view.
 *
 * @param {Object}        props
 * @param {number|string} [props.size=24] Icon size, used for both dimensions.
 * @param {number|string} [props.width]   Overrides size for width.
 * @param {number|string} [props.height]  Overrides size for height.
 * @return {React.ReactElement} The mark.
 */
export default function LogoMark( props ) {
	const { size = 24, width, height } = props;

	return (
		<SVG
			id="Layer_1"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 47.507 48"
			width={ width ?? size }
			height={ height ?? size }
		>
			<Defs>
				<LinearGradient
					id="linear-gradient"
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
			<Circle
				cx="43.966"
				cy="3.54"
				r="3.54"
				style={ { fill: '#7a7a7a' } }
			/>
			<Path
				d="m43.966,9.895c-3.509,0-6.354-2.845-6.354-6.354,0-.437.044-.863.128-1.275h-14.873C10.238,2.266,0,12.504,0,25.133h0c0,12.629,10.238,22.867,22.867,22.867h0c12.629,0,22.867-10.238,22.867-22.867v-15.489c-.562.162-1.154.251-1.768.251Zm-12.953,26.821l-8.146-4.073-8.146,4.073,1.534-9.001-5.607-6.272,8.146-1.018,4.073-8.146,4.073,8.146,8.146,1.018-5.594,6.272,1.521,9.001Z"
				style={ { fill: 'url(#linear-gradient)' } }
			/>
		</SVG>
	);
}
