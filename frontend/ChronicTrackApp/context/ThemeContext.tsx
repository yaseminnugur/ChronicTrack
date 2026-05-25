import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Colors, type ColorPalette, type ResolvedTheme, type ThemeMode } from '@/constants/theme';

const STORAGE_KEY = '@chronictrack/theme-mode';
const DEFAULT_MODE: ThemeMode = 'system';

type ThemeContextValue = {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  colors: ColorPalette;
  setMode: (mode: ThemeMode) => void;
  isHydrated: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useSystemColorScheme();
  const [mode, setModeState] = useState<ThemeMode>(DEFAULT_MODE);
  const [isHydrated, setIsHydrated] = useState(false);

  // Uygulama açılışında kullanıcı tercihini AsyncStorage'dan yükle.
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setModeState(stored);
        }
      } catch (e) {
        console.warn('Theme tercihi okunamadı:', e);
      } finally {
        setIsHydrated(true);
      }
    })();
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch((e) => {
      console.warn('Theme tercihi yazılamadı:', e);
    });
  }, []);

  const resolved: ResolvedTheme =
    mode === 'system' ? ((systemScheme ?? 'light') as ResolvedTheme) : mode;

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      resolved,
      colors: Colors[resolved],
      setMode,
      isHydrated,
    }),
    [mode, resolved, setMode, isHydrated]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Provider olmadan çağrılırsa (örn. test ortamı) güvenli varsayılan.
    return {
      mode: 'system',
      resolved: 'light',
      colors: Colors.light,
      setMode: () => {},
      isHydrated: true,
    };
  }
  return ctx;
}

export function useColors(): ColorPalette {
  return useTheme().colors;
}
