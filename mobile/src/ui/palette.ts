// Accent → [start, end] gradient pair for avatars and covers.
const map: Record<string, [string, string]> = {
  coral: ['#FF8A5B', '#E8340F'],
  sage: ['#7FC79E', '#2E8B6B'],
  lilac: ['#B197E0', '#7A54C2'],
  amber: ['#FFC15A', '#E8901F'],
  ink: ['#5B6270', '#2B303A'],
  user: ['#FF9C8A', '#FF6A3D'],
};

export function accentTint(accent: string): [string, string] {
  return map[accent] ?? map.coral;
}
