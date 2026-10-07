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
