import QRCode from 'qrcode';
import { useMemo } from 'react';
import Svg, { Path } from 'react-native-svg';

/** Draws `value` as a QR code, one path of dark modules in `color`, no quiet zone. */
export function QrCode({ value, size, color }: { value: string; size: number; color: string }) {
  const { path, modules } = useMemo(() => {
    const { modules } = QRCode.create(value, { errorCorrectionLevel: 'M' });
    let path = '';
    for (let row = 0; row < modules.size; row++) {
      for (let col = 0; col < modules.size; col++) {
        if (modules.get(row, col)) path += `M${col} ${row}h1v1h-1z`;
      }
    }
    return { path, modules: modules.size };
  }, [value]);

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${modules} ${modules}`}>
      <Path d={path} fill={color} />
    </Svg>
  );
}
