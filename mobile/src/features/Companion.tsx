import React, { useEffect } from 'react';
import { View, Pressable } from 'react-native';
import Svg, { Defs, RadialGradient, LinearGradient as SvgLinear, Stop, Circle, Path, Ellipse, G } from 'react-native-svg';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, withSpring, Easing, cancelAnimation } from 'react-native-reanimated';
import { useThemeControls } from '../theme/ThemeProvider';
import { Haptics } from '../motion/motion';

export type CompanionId = 'kindle' | 'dusk' | 'ink' | 'lumen' | 'hearth';
export type CompanionState = 'idle' | 'look' | 'boop' | 'happy' | 'sleep' | 'carry';

const AG = Animated.createAnimatedComponent(G);

/**
 * Companion placeholder art — pure SVG/Reanimated so a Rive/Lottie asset can
 * replace it later without touching screens. Companions are always labelled and
 * never post.
 */
export function Companion({
  id = 'kindle',
  state = 'idle',
  size = 96,
  onBoop,
}: {
  id?: CompanionId;
  state?: CompanionState;
  size?: number;
  onBoop?: () => void;
}) {
  const { reduceMotion } = useThemeControls();
  const float = useSharedValue(0);
  const squish = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion || state === 'sleep') { float.value = 0; return; }
    float.value = withRepeat(withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.ease) }), -1, true);
    return () => cancelAnimation(float);
  }, [reduceMotion, state, float]);

  const wrapStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: (float.value - 0.5) * (reduceMotion ? 0 : 8) },
      { scale: squish.value },
    ],
  }));

  const boop = () => {
    Haptics.medium();
    if (!reduceMotion) {
      squish.value = withSpring(0.86, { damping: 6, stiffness: 400 }, () => {
        squish.value = withSpring(1, { damping: 8 });
      });
    }
    onBoop?.();
  };

  const sleeping = state === 'sleep';

  const body = (
    <Animated.View style={wrapStyle}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id={`glow-${id}`} cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor={GLOW[id]} stopOpacity="0.5" />
            <Stop offset="1" stopColor={GLOW[id]} stopOpacity="0" />
          </RadialGradient>
          <SvgLinear id={`body-${id}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={COLORS[id][0]} />
            <Stop offset="1" stopColor={COLORS[id][1]} />
          </SvgLinear>
        </Defs>
        <Circle cx="50" cy="52" r="46" fill={`url(#glow-${id})`} />
        {renderBody(id)}
        {/* eyes */}
        {sleeping ? (
          <>
            <Path d="M38 48 q5 4 10 0" stroke="#1a1020" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <Path d="M54 48 q5 4 10 0" stroke="#1a1020" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <Circle cx="42" cy="49" r="3.4" fill="#1a1020" />
            <Circle cx="60" cy="49" r="3.4" fill="#1a1020" />
            <Circle cx="43.2" cy="47.8" r="1.1" fill="#fff" />
            <Circle cx="61.2" cy="47.8" r="1.1" fill="#fff" />
          </>
        )}
        {/* mouth */}
        {state === 'happy'
          ? <Path d="M44 58 q7 7 14 0" stroke="#1a1020" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          : <Path d="M46 58 q5 3 10 0" stroke="#1a1020" strokeWidth="2.2" fill="none" strokeLinecap="round" />}
      </Svg>
    </Animated.View>
  );

  if (onBoop) {
    return (
      <Pressable onPress={boop} accessibilityRole="button" accessibilityLabel={`${NAMES[id]}, your companion`}>
        {body}
      </Pressable>
    );
  }
  return <View accessibilityLabel={`${NAMES[id]}, your companion`}>{body}</View>;
}

const NAMES: Record<CompanionId, string> = { kindle: 'Kindle', dusk: 'Dusk', ink: 'Ink', lumen: 'Lumen', hearth: 'Hearth' };
const GLOW: Record<CompanionId, string> = { kindle: '#FF7A3D', dusk: '#8E7BC7', ink: '#3A4250', lumen: '#FFD98A', hearth: '#E8901F' };
const COLORS: Record<CompanionId, [string, string]> = {
  kindle: ['#FFC15A', '#FF6A3D'],
  dusk: ['#B8A6E8', '#6A54B0'],
  ink: ['#5B6270', '#2B303A'],
  lumen: ['#FFE9B0', '#FFC15A'],
  hearth: ['#FFB27A', '#E8681F'],
};

function renderBody(id: CompanionId) {
  switch (id) {
    case 'kindle': // flame spirit
      return <Path d="M50 18 C60 30 70 38 70 54 a20 20 0 0 1 -40 0 C30 40 40 34 44 26 C46 34 50 36 52 38 C52 30 50 24 50 18 Z" fill={`url(#body-${id})`} />;
    case 'dusk': // owl
      return <><Ellipse cx="50" cy="54" rx="26" ry="28" fill={`url(#body-${id})`} /><Path d="M28 34 l8 10 M72 34 l-8 10" stroke={COLORS.dusk[1]} strokeWidth="5" strokeLinecap="round" /></>;
    case 'ink': // ink drop
      return <Path d="M50 20 C64 40 72 50 72 62 a22 22 0 0 1 -44 0 C28 50 36 40 50 20 Z" fill={`url(#body-${id})`} />;
    case 'lumen': // moth
      return <><Ellipse cx="36" cy="52" rx="16" ry="20" fill={`url(#body-${id})`} opacity="0.85" /><Ellipse cx="64" cy="52" rx="16" ry="20" fill={`url(#body-${id})`} opacity="0.85" /><Ellipse cx="50" cy="54" rx="7" ry="18" fill={COLORS.lumen[1]} /></>;
    case 'hearth': // cat
      return <><Ellipse cx="50" cy="56" rx="26" ry="24" fill={`url(#body-${id})`} /><Path d="M30 38 l6 -14 8 12 M70 38 l-6 -14 -8 12" fill={`url(#body-${id})`} /></>;
  }
}
