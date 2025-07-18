import { Dimensions, Platform, StatusBar } from 'react-native';

const { width, height } = Dimensions.get('window');

export const layout = {
  // Screen dimensions
  screen: {
    width,
    height,
  },

  // Status bar height
  statusBarHeight: StatusBar.currentHeight || 0,

  // Safe area insets (will be set dynamically)
  safeArea: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Padding
  padding: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },

  // Margins
  margin: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Border radius
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    round: 50,
  },

  // Button sizes
  button: {
    height: {
      small: 36,
      medium: 44,
      large: 52,
    },
    padding: {
      horizontal: 16,
      vertical: 12,
    },
  },

  // Input sizes
  input: {
    height: 48,
    padding: {
      horizontal: 16,
      vertical: 12,
    },
  },

  // Card dimensions
  card: {
    padding: 16,
    margin: 8,
    borderRadius: 12,
  },

  // Game board dimensions
  gameBoard: {
    size: Math.min(width - 40, 350),
    tileSize: Math.min(width - 40, 350) / 4,
    gap: 4,
  },

  // Header dimensions
  header: {
    height: 56,
    padding: 16,
  },

  // Navigation bar dimensions
  navigation: {
    height: Platform.OS === 'ios' ? 44 : 56,
    padding: 16,
  },

  // Tab bar dimensions
  tabBar: {
    height: Platform.OS === 'ios' ? 83 : 60,
    padding: 8,
  },

  // Modal dimensions
  modal: {
    borderRadius: 16,
    padding: 20,
  },

  // Avatar sizes
  avatar: {
    small: 32,
    medium: 48,
    large: 64,
    xlarge: 96,
  },

  // Icon sizes
  icon: {
    small: 16,
    medium: 24,
    large: 32,
    xlarge: 48,
  },

  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  // Line heights
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 36,
    xxxl: 40,
  },

  // Shadows
  shadow: {
    small: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },

  // Z-index values
  zIndex: {
    base: 0,
    card: 1,
    header: 10,
    modal: 100,
    overlay: 200,
    tooltip: 300,
  },

  // Animation durations
  animation: {
    fast: 200,
    normal: 300,
    slow: 500,
  },

  // Breakpoints
  breakpoints: {
    small: 375,
    medium: 768,
    large: 1024,
  },

  // Platform-specific values
  platform: {
    ios: {
      statusBarHeight: 44,
      navigationBarHeight: 44,
      tabBarHeight: 83,
    },
    android: {
      statusBarHeight: 24,
      navigationBarHeight: 56,
      tabBarHeight: 60,
    },
  },
};

// Helper functions
export const isSmallScreen = () => width < layout.breakpoints.small;
export const isMediumScreen = () =>
  width >= layout.breakpoints.small && width < layout.breakpoints.medium;
export const isLargeScreen = () => width >= layout.breakpoints.medium;

export const getResponsiveValue = (small, medium, large) => {
  if (isSmallScreen()) return small;
  if (isMediumScreen()) return medium;
  return large;
};

export const getGameBoardSize = () => {
  const maxSize = Math.min(width - layout.spacing.lg * 2, 350);
  return {
    boardSize: maxSize,
    tileSize: maxSize / 4,
  };
};
