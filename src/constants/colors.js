// src/constants/colors.js
const colors = {
  // Primary colors
  primary: '#007AFF',
  primaryDark: '#0056CC',
  primaryLight: '#4DA3FF',
  
  // Secondary colors
  secondary: '#5856D6',
  secondaryDark: '#3634A3',
  secondaryLight: '#7A79E0',
  
  // Accent color
  accent: '#FF6B35',
  
  // Success colors
  success: '#34C759',
  successDark: '#28A745',
  successLight: '#5CDB7F',
  
  // Warning colors
  warning: '#FF9500',
  warningDark: '#E6850E',
  warningLight: '#FFB340',
  
  // Error colors
  error: '#FF3B30',
  errorDark: '#DC3545',
  errorLight: '#FF6B5F',
  
  // Neutral colors
  background: '#F2F2F7',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  
  // Text colors
  text: '#000000',
  textSecondary: '#8E8E93',
  textTertiary: '#C7C7CC',
  
  // Border colors
  border: '#C6C6C8',
  borderLight: '#E5E5EA',
  
  // Game-specific colors
  gameBackground: '#FAF8EF',
  gameBoard: '#BBADA0',
  tileEmpty: '#CDC1B4',
  tile2: '#EEE4DA',
  tile4: '#EDE0C8',
  tile8: '#F2B179',
  tile16: '#F59563',
  tile32: '#F67C5F',
  tile64: '#F65E3B',
  tile128: '#EDCF72',
  tile256: '#EDCC61',
  tile512: '#EDC850',
  tile1024: '#EDC53F',
  tile2048: '#EDC22E',
  
  // Text colors for tiles
  tileTextDark: '#776E65',
  tileTextLight: '#F9F6F2',
  
  // Status colors
  online: '#34C759',
  offline: '#8E8E93',
  busy: '#FF9500',
  
  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  
  // Shadow colors
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.2)',
  
  // White and black
  white: '#FFFFFF',
  black: '#000000',
  
  // Transparent
  transparent: 'transparent',
};

export { colors };

// Dark theme colors (for future use)
export const darkColors = {
  ...colors,
  background: '#000000',
  surface: '#1C1C1E',
  card: '#2C2C2E',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  textTertiary: '#48484A',
  border: '#38383A',
  borderLight: '#48484A',
  gameBackground: '#1C1C1E',
  gameBoard: '#2C2C2E',
  tileEmpty: '#3A3A3C',
};

// Export individual color groups for convenience
export const tileColors = {
  0: '#CDC1B4', // tileEmpty
  2: '#EEE4DA', // tile2
  4: '#EDE0C8', // tile4
  8: '#F2B179', // tile8
  16: '#F59563', // tile16
  32: '#F67C5F', // tile32
  64: '#F65E3B', // tile64
  128: '#EDCF72', // tile128
  256: '#EDCC61', // tile256
  512: '#EDC850', // tile512
  1024: '#EDC53F', // tile1024
  2048: '#EDC22E', // tile2048
};

export const tileTextColors = {
  dark: '#776E65', // tileTextDark
  light: '#F9F6F2', // tileTextLight
}; 