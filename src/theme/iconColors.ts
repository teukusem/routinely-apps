export const iconColors = {
  sky: '#5B9DFF',
  skySoft: 'rgba(91, 157, 255, 0.2)',
  mint: '#3DDC97',
  mintSoft: 'rgba(61, 220, 151, 0.2)',
  coral: '#FF7B6B',
  coralSoft: 'rgba(255, 123, 107, 0.2)',
  amber: '#FFB547',
  amberSoft: 'rgba(255, 181, 71, 0.2)',
  lavender: '#A78BFA',
  lavenderSoft: 'rgba(167, 139, 250, 0.2)',
  rose: '#FF6B9D',
  roseSoft: 'rgba(255, 107, 157, 0.2)',
  teal: '#2DD4BF',
  tealSoft: 'rgba(45, 212, 191, 0.2)',
  violet: '#8B5CF6',
  violetSoft: 'rgba(139, 92, 246, 0.2)',
  lime: '#A3E635',
  limeSoft: 'rgba(163, 230, 53, 0.2)',
} as const;

export type IconAccentName =
  | 'sky'
  | 'mint'
  | 'coral'
  | 'amber'
  | 'lavender'
  | 'rose'
  | 'teal'
  | 'violet'
  | 'lime';

type IconSoftKey = `${IconAccentName}Soft`;

export function iconAccentPair(accent: IconAccentName) {
  const softKey = `${accent}Soft` as IconSoftKey;

  return {
    icon: iconColors[accent],
    soft: iconColors[softKey],
  };
}
