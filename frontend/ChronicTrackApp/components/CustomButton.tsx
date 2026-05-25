import React, { ReactNode, useMemo } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { ThemedText } from './themed-text';
import { useColors } from '@/context/ThemeContext';
import type { ColorPalette } from '@/constants/theme';

export interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'outline' | 'text';
  style?: ViewStyle;
  textStyle?: TextStyle;
  rightIcon?: ReactNode;
  leftIcon?: ReactNode;
}

export function CustomButton({
  title,
  loading = false,
  variant = 'primary',
  style,
  textStyle,
  disabled,
  rightIcon,
  leftIcon,
  ...rest
}: CustomButtonProps) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const primaryColor = colors.primary;

  const getBackgroundColor = () => {
    if (variant === 'primary') return disabled ? '#A0C4E4' : primaryColor;
    return 'transparent';
  };

  const getTextColor = () => {
    if (variant === 'primary') return '#FFFFFF';
    return primaryColor;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        variant === 'outline' && { borderColor: primaryColor, borderWidth: 1 },
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <View style={styles.buttonContent}>
          {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
          <ThemedText
            style={[
              styles.title,
              { color: getTextColor() },
              textStyle,
            ]}
          >
            {title}
          </ThemedText>
          {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}

const createStyles = (c: ColorPalette) => StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 28, // fully rounded pill
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowColor: '#1378C6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginLeft: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
