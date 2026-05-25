import { useTheme } from '@/context/ThemeContext';

export function useColorScheme(): 'light' | 'dark' {
  return useTheme().resolved;
}
