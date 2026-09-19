import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

export type IconName =
  | 'home' | 'compass' | 'plus' | 'book' | 'user' | 'search' | 'bell' | 'fire'
  | 'bookmark' | 'bookmark-fill' | 'message' | 'more' | 'spark' | 'arrow' | 'sliders'
  | 'x' | 'check' | 'moon' | 'sun' | 'send' | 'clock' | 'users' | 'share' | 'settings'
  | 'quote' | 'lock' | 'chevron' | 'chevron-down' | 'repost' | 'link' | 'logout'
  | 'heart' | 'eye' | 'edit' | 'trash' | 'globe' | 'palette';

export function Icon({
  name, size = 22, color = '#000', strokeWidth = 1.9,
}: { name: IconName; size?: number; color?: string; strokeWidth?: number }) {
  const p = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };
  const solid = { fill: color };

  const content: Record<IconName, React.ReactNode> = {
    home: <><Path d="m3 10 9-7 9 7" {...p} /><Path d="M5 9v11h14V9M9 20v-6h6v6" {...p} /></>,
    compass: <><Circle cx={12} cy={12} r={9} {...p} /><Path d="m15.5 8.5-2.1 4.9-4.9 2.1 2.1-4.9 4.9-2.1Z" {...p} /></>,
    plus: <Path d="M12 5v14M5 12h14" {...p} />,
    book: <><Path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" {...p} /><Path d="M4 5.5v16M8 7h8M8 11h7" {...p} /></>,
    user: <><Circle cx={12} cy={8} r={3.5} {...p} /><Path d="M4.5 20c.8-3.5 3.3-5.2 7.5-5.2s6.7 1.7 7.5 5.2" {...p} /></>,
    search: <><Circle cx={10.8} cy={10.8} r={6.5} {...p} /><Path d="m16 16 4.5 4.5" {...p} /></>,
    bell: <><Path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" {...p} /><Path d="M10 21h4" {...p} /></>,
    fire: <Path d="M12.3 21c4.1 0 7.2-2.8 7.2-6.9 0-3.8-2.5-6.1-4.5-8.7-.4 2.2-1.4 3.4-2.6 4.1.1-3.2-1.6-5.9-3.2-7.5.1 3.7-4.1 6.2-4.1 11.6C5.1 17.8 8.1 21 12.3 21Z" fill={color} />,
    bookmark: <Path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3.5L6 21V4.5Z" {...p} />,
    'bookmark-fill': <Path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3.5L6 21V4.5Z" fill={color} />,
    message: <><Path d="M20 11.5a7 7 0 0 1-7.4 7H8l-4 2 1.2-4A7.1 7.1 0 1 1 20 11.5Z" {...p} /></>,
    more: <><Circle cx={5} cy={12} r={1.4} {...solid} /><Circle cx={12} cy={12} r={1.4} {...solid} /><Circle cx={19} cy={12} r={1.4} {...solid} /></>,
    spark: <><Path d="m12 2 1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2Z" {...p} /></>,
    arrow: <Path d="M5 12h14M13 6l6 6-6 6" {...p} />,
    sliders: <><Path d="M4 8h10M18 8h2M4 16h2M10 16h10" {...p} /><Circle cx={16} cy={8} r={2.4} {...p} /><Circle cx={8} cy={16} r={2.4} {...p} /></>,
    x: <Path d="m5 5 14 14M19 5 5 19" {...p} />,
    check: <Path d="m5 12 4.5 4.5L19 7" {...p} />,
    moon: <Path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" {...p} />,
    sun: <><Circle cx={12} cy={12} r={4} {...p} /><Path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" {...p} /></>,
    send: <><Path d="m21 3-7.4 18-3.5-7.1L3 10.4 21 3Z" {...p} /><Path d="M10.1 13.9 21 3" {...p} /></>,
    clock: <><Circle cx={12} cy={12} r={9} {...p} /><Path d="M12 7v5l3.5 2" {...p} /></>,
    users: <><Path d="M16 20v-1.2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20" {...p} /><Circle cx={9.5} cy={7.5} r={3.5} {...p} /><Path d="M17 11a3.5 3.5 0 0 0-1-6.8M20.5 20v-1.2a4 4 0 0 0-2.7-3.8" {...p} /></>,
    share: <><Circle cx={18} cy={5} r={2.5} {...p} /><Circle cx={6} cy={12} r={2.5} {...p} /><Circle cx={18} cy={19} r={2.5} {...p} /><Path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5" {...p} /></>,
    settings: <><Circle cx={12} cy={12} r={3} {...p} /><Path d="M19.4 13.5a1.7 1.7 0 0 0 .34 1.87l.05.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 0 1-4 0v-.09A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.87.34l-.06.05a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 0 1 0-4h.09A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.87l-.05-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6h.05A1.7 1.7 0 0 0 10 3.04V3a2 2 0 0 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.05a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9v.05a1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 0 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1.42Z" {...p} /></>,
    quote: <Path d="M9 7H5v6h4l-1 4h2l2-6V7Zm10 0h-4v6h4l-1 4h2l2-6V7Z" fill={color} />,
    lock: <><Path d="M6 11h12v9H6z" {...p} /><Path d="M9 11V8a3 3 0 0 1 6 0v3" {...p} /></>,
    chevron: <Path d="m9 6 6 6-6 6" {...p} />,
    'chevron-down': <Path d="m6 9 6 6 6-6" {...p} />,
    repost: <><Path d="M17 2l4 4-4 4" {...p} /><Path d="M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4" {...p} /><Path d="M21 13v2a4 4 0 0 1-4 4H3" {...p} /></>,
    link: <><Path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" {...p} /><Path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" {...p} /></>,
    logout: <><Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" {...p} /><Path d="m16 17 5-5-5-5M21 12H9" {...p} /></>,
    heart: <Path d="M20.8 8.9c0 5.3-8.8 10.2-8.8 10.2S3.2 14.2 3.2 8.9A4.7 4.7 0 0 1 12 6.5a4.7 4.7 0 0 1 8.8 2.4Z" {...p} />,
    eye: <><Path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" {...p} /><Circle cx={12} cy={12} r={3} {...p} /></>,
    edit: <><Path d="M12 20h9" {...p} /><Path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" {...p} /></>,
    trash: <><Path d="M4 7h16M10 11v6M14 11v6M5 7l1 13h12l1-13M9 7V4h6v3" {...p} /></>,
    globe: <><Circle cx={12} cy={12} r={9} {...p} /><Path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" {...p} /></>,
    palette: <><Path d="M12 3a9 9 0 1 0 0 18 2 2 0 0 0 2-2c0-.6-.4-1-1-1.5s-1-.9-1-1.5a2 2 0 0 1 2-2h1a4 4 0 0 0 4-4c0-3.9-3.6-6-8-6Z" {...p} /><Circle cx={7.5} cy={11.5} r={1} {...solid} /><Circle cx={12} cy={8} r={1} {...solid} /><Circle cx={16.5} cy={11.5} r={1} {...solid} /></>,
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {content[name]}
    </Svg>
  );
}
