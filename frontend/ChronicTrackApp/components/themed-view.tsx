import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors } from '@/constants/theme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: 'background' | 'cardBackground' | 'inputBackground';
};

export function ThemedView({ style, lightColor, darkColor, variant = 'background', ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, variant);

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
