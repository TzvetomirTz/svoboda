import Svg, { Circle, Path, Rect } from 'react-native-svg';

// Stroke icons from the screen designs: 24px grid, square caps, drawn in the text colour.
type IconProps = { color: string; size?: number; strokeWidth?: number };

function Icon({ color, size = 20, strokeWidth = 2, children }: IconProps & { children: React.ReactNode }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="square">
      {children}
    </Svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <Icon size={18} {...props}>
      <Rect x={5} y={11} width={14} height={10} />
      <Path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </Icon>
  );
}

export function CopyIcon(props: IconProps) {
  return (
    <Icon size={18} {...props}>
      <Rect x={8} y={8} width={12} height={12} />
      <Path d="M4 16V4h12" />
    </Icon>
  );
}

export function PasteIcon(props: IconProps) {
  return (
    <Icon size={18} {...props}>
      <Path d="M8 4h8v4H8z" />
      <Path d="M16 6h3v15H5V6h3" />
    </Icon>
  );
}

export function ContactsIcon(props: IconProps) {
  return (
    <Icon size={22} {...props}>
      <Circle cx={9} cy={8} r={3.5} />
      <Path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
      <Path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.3c2.1.7 3.5 2.7 3.5 5.7" />
    </Icon>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Icon strokeWidth={2.2} {...props}>
      <Path d="M12 4v16M4 12h16" />
    </Icon>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Icon size={22} {...props}>
      <Path d="M6 6l12 12M18 6L6 18" />
    </Icon>
  );
}

export function BackIcon(props: IconProps) {
  return (
    <Icon size={22} {...props}>
      <Path d="M15 5l-7 7 7 7" />
    </Icon>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Path d="M6 9l6 6 6-6" />
    </Icon>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Icon size={14} strokeWidth={2.6} {...props}>
      <Path d="M5 12.5l4.5 4.5L19 7.5" />
    </Icon>
  );
}

// From assets/gear.svg. A filled shape on its own grid, so it doesn't use the stroke Icon above.
export function GearIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 369.793 369.792" fill={color}>
      <Path d="M320.83,140.434l-1.759-0.627l-6.87-16.399l0.745-1.685c20.812-47.201,19.377-48.609,15.925-52.031L301.11,42.61c-1.135-1.126-3.128-1.918-4.846-1.918c-1.562,0-6.293,0-47.294,18.57L247.326,60l-16.916-6.812l-0.679-1.684C210.45,3.762,208.475,3.762,203.677,3.762h-39.205c-4.78,0-6.957,0-24.836,47.825l-0.673,1.741l-16.828,6.86l-1.609-0.669C92.774,47.819,76.57,41.886,72.346,41.886c-1.714,0-3.714,0.769-4.854,1.892l-27.787,27.16c-3.525,3.477-4.987,4.933,16.915,51.149l0.805,1.714l-6.881,16.381l-1.684,0.651C0,159.715,0,161.556,0,166.474v38.418c0,4.931,0,6.979,48.957,24.524l1.75,0.618l6.882,16.333l-0.739,1.669c-20.812,47.223-19.492,48.501-15.949,52.025L68.62,327.18c1.162,1.117,3.173,1.915,4.888,1.915c1.552,0,6.272,0,47.3-18.561l1.643-0.769l16.927,6.846l0.658,1.693c19.293,47.726,21.275,47.726,26.076,47.726h39.217c4.924,0,6.966,0,24.859-47.857l0.667-1.742l16.855-6.814l1.604,0.654c27.729,11.733,43.925,17.654,48.122,17.654c1.699,0,3.717-0.745,4.876-1.893l27.832-27.219c3.501-3.495,4.96-4.924-16.981-51.096l-0.816-1.734l6.869-16.31l1.64-0.643c48.938-18.981,48.938-20.831,48.938-25.755v-38.395C369.793,159.95,369.793,157.914,320.83,140.434z M184.896,247.203c-35.038,0-63.542-27.959-63.542-62.3c0-34.342,28.505-62.264,63.542-62.264c35.023,0,63.522,27.928,63.522,62.264C248.419,219.238,219.92,247.203,184.896,247.203z" />
    </Svg>
  );
}
