// Theme configuration for the Fire Alarm app

export const colors = {
  // Primary colors
  primary: '#2196F3',
  primaryDark: '#1976D2',
  primaryLight: '#BBDEFB',
  
  // Background colors
  background: '#121212',
  surfaceBackground: '#1E1E1E',
  cardBackground: '#2D2D2D',
  
  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#808080',
  
  // Status colors
  statusActive: '#4CAF50',
  statusInactive: '#9E9E9E',
  statusWarning: '#FFC107',
  statusError: '#F44336',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
  },
  subheader: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  header: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
  },
}; 