/**
 * WordPress dependencies
 */
import { SVG, Path, Defs, Stop, Circle, LinearGradient } from '@wordpress/primitives';

export default function LogoMark(props) {

  const {
    width,
    height
  } = props;

  return (
    <SVG id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 47.507 48" width={width} height={height}>
      <Defs>
        <LinearGradient id="linear-gradient" x1="15.044" y1="46.627" x2="31.956" y2=".16" gradientUnits="userSpaceOnUse">
          <Stop offset={0} stopColor="#7d58c6"/>
          <Stop offset={.261} stopColor="#677bc9"/>
          <Stop offset={.581} stopColor="#51a1cc"/>
          <Stop offset={.838} stopColor="#44b8cf"/>
          <Stop offset={1} stopColor="#3fc1d0"/>
        </LinearGradient>
      </Defs>
      <Circle cx="43.966" cy="3.54" r="3.54" style={{fill:"#7a7a7a"}} />
      <Path d="m43.966,9.895c-3.509,0-6.354-2.845-6.354-6.354,0-.437.044-.863.128-1.275h-14.873C10.238,2.266,0,12.504,0,25.133h0c0,12.629,10.238,22.867,22.867,22.867h0c12.629,0,22.867-10.238,22.867-22.867v-15.489c-.562.162-1.154.251-1.768.251Zm-12.953,26.821l-8.146-4.073-8.146,4.073,1.534-9.001-5.607-6.272,8.146-1.018,4.073-8.146,4.073,8.146,8.146,1.018-5.594,6.272,1.521,9.001Z" style={{fill:"url(#linear-gradient)"}}/>
    </SVG>
  );
}
