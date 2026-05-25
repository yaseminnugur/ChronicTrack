import React, { useMemo } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useColors } from '@/context/ThemeContext';
import type { ColorPalette } from '@/constants/theme';
import { ThemedText } from './themed-text';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export interface CustomInputProps extends TextInputProps {
  label: string;
  iconName?: string;
  iconType?: 'FontAwesome5' | 'Ionicons' | 'MaterialCommunityIcons';
  rightLabel?: string;
  onRightLabelPress?: () => void;
  rightIconName?: string;
  rightIconType?: 'FontAwesome5' | 'Ionicons' | 'MaterialCommunityIcons';
  onRightIconPress?: () => void;
  isPassword?: boolean;
  error?: boolean;
}

export function CustomInput({
  label,
  iconName,
  iconType = 'Ionicons',
  rightLabel,
  onRightLabelPress,
  rightIconName,
  rightIconType = 'Ionicons',
  onRightIconPress,
  isPassword = false,
  error = false,
  ...rest
}: CustomInputProps) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isFocused, setIsFocused] = React.useState(false);

  const renderIcon = (type: string, name: string, size: number, color: string) => {
    switch (type) {
      case 'FontAwesome5':
        // @ts-ignore
        return <FontAwesome5 name={name} size={size} color={color} />;
      case 'MaterialCommunityIcons':
        // @ts-ignore
        return <MaterialCommunityIcons name={name} size={size} color={color} />;
      case 'Ionicons':
      default:
        // @ts-ignore
        return <Ionicons name={name} size={size} color={color} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <ThemedText type="label" style={{ color: colors.textSecondary }}>
          {label}
        </ThemedText>
        {rightLabel && (
          <TouchableOpacity onPress={onRightLabelPress}>
            <ThemedText style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>
              {rightLabel}
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.inputBackground,
            borderColor: error ? '#FF3B30' : (isFocused ? colors.primary : colors.inputBackground),
            borderWidth: 1,
          },
        ]}
      >
        {iconName && (
          <View style={styles.iconContainer}>
            {renderIcon(iconType, iconName, 20, isFocused ? colors.primary : colors.icon)}
          </View>
        )}
        <TextInput
          style={[
            styles.input,
            { color: colors.text }
          ]}
          placeholderTextColor={colors.icon}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword}
          autoCapitalize="none"
          {...rest}
        />
        {rightIconName && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIconContainer}>
            {renderIcon(rightIconType, rightIconName, 20, colors.icon)}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const createStyles = (c: ColorPalette) => StyleSheet.create({
  container: {
    marginBottom: 20,
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    fontWeight: '500',
  },
  iconContainer: {
    marginRight: 12,
  },
  rightIconContainer: {
    marginLeft: 12,
  },
});
