import React, { useMemo } from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { CustomInput, CustomInputProps } from './CustomInput';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';
import { useColors } from '@/context/ThemeContext';
import type { ColorPalette } from '@/constants/theme';

interface ControlledInputProps<T extends FieldValues> extends Omit<CustomInputProps, 'value' | 'onChangeText'> {
  control: Control<T>;
  name: Path<T>;
}

export function ControlledInput<T extends FieldValues>({
  control,
  name,
  ...props
}: ControlledInputProps<T>) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View style={styles.container}>
          <CustomInput
            {...props}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={!!error}
          />
          {error && (
            <ThemedText style={styles.errorText}>
              {error.message}
            </ThemedText>
          )}
        </View>
      )}
    />
  );
}

const createStyles = (c: ColorPalette) => StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 4,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: -16,
    marginBottom: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
});
