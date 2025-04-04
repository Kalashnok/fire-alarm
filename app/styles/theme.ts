import { StyleSheet, TextStyle } from 'react-native';

export const colors = {
  // Primary colors
  primary: '#FF3B30', // Emergency red
  secondary: '#FF9500', // Warning orange
  success: '#34C759', // Safe green
  danger: '#FF3B30', // Alert red
  warning: '#FF9500', // Warning orange
  
  // Background colors
  background: '#1C1C1E', // Dark background
  cardBackground: '#2C2C2E', // Slightly lighter background for cards
  surfaceBackground: '#3A3A3C', // Surface elements background
  
  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: '#EBEBF5',
  textTertiary: '#EBEBF599',
  
  // Status colors
  statusActive: '#34C759', // Active/Connected
  statusInactive: '#8E8E93', // Inactive/Disconnected
  statusError: '#FF3B30', // Error state
  statusWarning: '#FF9500', // Warning state
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography: Record<string, TextStyle> = {
  header: {
    fontSize: 24,
    fontWeight: '700',
  },
  subheader: {
    fontSize: 18,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
  },
  caption: {
    fontSize: 14,
  },
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: spacing.md,
    marginVertical: spacing.sm,
    marginHorizontal: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerText: {
    ...typography.header,
    color: colors.textPrimary,
  },
  subheaderText: {
    ...typography.subheader,
    color: colors.textSecondary,
  },
  bodyText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  captionText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.textPrimary,
    ...typography.body,
    fontWeight: '600',
  },
}); 