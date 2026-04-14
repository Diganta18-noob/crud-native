export const Colors = {
  // Primary palette
  primary: '#6C63FF',
  primaryLight: '#8B85FF',
  primaryDark: '#4B44CC',

  // Admin accent
  admin: '#FF6B35',
  adminLight: '#FF8C5A',

  // User accent
  user: '#22D3A5',
  userLight: '#4DDFBA',

  // Neutrals
  background: '#0F0F14',
  surface: '#1A1A24',
  surfaceHigh: '#252532',
  border: '#2E2E3D',

  // Semantic
  success: '#22D3A5',
  warning: '#FFB020',
  error: '#FF4D4F',
  info: '#4FA3FF',

  // Text
  textPrimary: '#F0F0F8',
  textSecondary: '#8888A8',
  textMuted: '#55556A',

  // Always
  white: '#FFFFFF',
  black: '#000000',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 6,
  md: 12,
  lg: 18,
  xl: 24,
  full: 999,
};

export const Typography = {
  displayLG: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.5 },
  displayMD: { fontSize: 24, fontWeight: '700' as const },
  heading: { fontSize: 20, fontWeight: '600' as const },
  subheading: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodySmall: { fontSize: 13, fontWeight: '400' as const },
  caption: { fontSize: 11, fontWeight: '500' as const, letterSpacing: 0.5 },
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
};
