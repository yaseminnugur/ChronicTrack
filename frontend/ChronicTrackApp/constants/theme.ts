/**
 * Custom color theme for ChronicTrack app.
 */
import { Platform } from 'react-native';

const primaryBrand = '#1378C6'; // Primary blue from logo and button
const backgroundLight = '#F2F6FA'; // Light blue-gray background in login screen
const cardBackground = '#FFFFFF';
const textPrimary = '#1E1E1E';
const textSecondary = '#666666';
const inputBackground = '#F3F4F6';
const iconColor = '#9E9E9E';

export const Colors = {
  light: {
    text: textPrimary,
    textSecondary: textSecondary,
    background: backgroundLight,
    cardBackground: cardBackground,
    inputBackground: inputBackground,
    tint: primaryBrand,
    primary: primaryBrand,
    icon: iconColor,
    tabIconDefault: iconColor,
    tabIconSelected: primaryBrand,
    border: '#E5E7EB',
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#A0AAB2',
    background: '#151718',
    cardBackground: '#202325',
    inputBackground: '#2B2F31',
    tint: primaryBrand,
    primary: primaryBrand,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: primaryBrand,
    border: '#3A3F42',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
