import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Defs, RadialGradient, LinearGradient as SvgLinear, Stop, Rect, Circle, Ellipse } from 'react-native-svg';
import { ThemedText } from './Text';
import { accentTint } from './palette';

/** Deterministic hash → 0..1 */
function rand(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function GenerativeCover({
  seed,
  accent = 'coral',
  initials,
  height = 150,
  radius = 18,
}: {
  seed: string;
  accent?: string;
  initials?: string;
  height?: number;
  radius?: number;
}) {
  const [a, b] = accentTint(accent);
  const h = hashStr(seed);
  const blobs = useMemo(() => {
    return [0, 1, 2, 3].map((i) => ({
      cx: 20 + rand(h + i * 13) * 260,
      cy: 10 + rand(h + i * 29) * 120,
      r: 40 + rand(h + i * 7) * 90,
      o: 0.35 + rand(h + i * 5) * 0.4,
    }));
  }, [h]);

  return (
    <View style={{ height, borderRadius: radius, overflow: 'hidden' }}>
      <Svg width="100%" height="100%" viewBox="0 0 300 150" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <SvgLinear id={`bg-${seed}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={a} />
            <Stop offset="1" stopColor={b} />
          </SvgLinear>
          <RadialGradient id={`glow-${seed}`} cx="0.5" cy="0.4" r="0.7">
            <Stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
            <Stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="300" height="150" fill={`url(#bg-${seed})`} />
        {blobs.map((bl, i) => (
          <Ellipse key={i} cx={bl.cx} cy={bl.cy} rx={bl.r} ry={bl.r * 0.75} fill="#ffffff" opacity={bl.o * 0.25} />
        ))}
        <Circle cx={240} cy={40} r={70} fill={`url(#glow-${seed})`} />
      </Svg>
      {initials ? (
        <View style={{ position: 'absolute', left: 16, bottom: 14 }}>
          <ThemedText style={{ color: '#fff', fontWeight: '800', fontSize: 30, letterSpacing: -1 }}>{initials}</ThemedText>
        </View>
      ) : null}
    </View>
  );
}
