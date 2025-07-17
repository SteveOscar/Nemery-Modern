// src/constants/colors.js
const colors = {
  // Matrix/Hacker Theme
  primary: '#00FF41', // Matrix green
  primaryDark: '#00B32D',
  primaryLight: '#39FF8B',

  accent: '#39FF14', // Neon green accent
  accentGlow: '#00FF41', // For glowing effects

  // Success, warning, error (all greenish for Matrix vibe)
  success: '#00FF41',
  warning: '#BFFF00',
  error: '#FF1744', // Keep error red for contrast

  // Backgrounds
  background: '#0A0F0A', // Deep black-green
  surface: '#101A10', // Slightly lighter for cards
  card: '#162616',

  // Text
  text: '#C8FFC8', // Pale green
  textSecondary: '#39FF8B',
  textTertiary: '#00FF41',

  // Borders
  border: '#00FF41',
  borderLight: '#39FF8B',

  // Game-specific
  gameBackground: '#0A0F0A',
  gameBoard: '#162616',
  tileEmpty: '#1A2B1A',
  tile2: '#003B00',
  tile4: '#005C00',
  tile8: '#007D00',
  tile16: '#00A000',
  tile32: '#00C300',
  tile64: '#00FF41',
  tile128: '#39FF8B',
  tile256: '#BFFF00',
  tile512: '#39FF14',
  tile1024: '#C8FFC8',
  tile2048: '#FFFFFF',

  // Text colors for tiles
  tileTextDark: '#00FF41',
  tileTextLight: '#C8FFC8',

  // Overlay
  overlay: 'rgba(0, 255, 65, 0.15)', // Greenish overlay
  overlayLight: 'rgba(0, 255, 65, 0.08)',

  // Shadow/Glow
  shadow: 'rgba(0,255,65,0.3)',
  shadowDark: 'rgba(0,255,65,0.6)',
  glow: '#00FF41',

  // White and black
  white: '#FFFFFF',
  black: '#000000',

  // Transparent
  transparent: 'transparent',
};

export { colors };

export const darkColors = {
  ...colors,
};

export const tileColors = {
  0: colors.tileEmpty,
  2: colors.tile2,
  4: colors.tile4,
  8: colors.tile8,
  16: colors.tile16,
  32: colors.tile32,
  64: colors.tile64,
  128: colors.tile128,
  256: colors.tile256,
  512: colors.tile512,
  1024: colors.tile1024,
  2048: colors.tile2048,
};

export const tileTextColors = {
  dark: colors.tileTextDark,
  light: colors.tileTextLight,
}; 