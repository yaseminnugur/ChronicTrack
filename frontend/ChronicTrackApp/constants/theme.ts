/**
 * Custom color theme for ChronicTrack app.
 *
 * Semantik isimlendirme:
 *  - background: sayfa zemin rengi (SafeAreaView)
 *  - surface: standart kart/listItem zemini
 *  - surfaceMuted: ikincil kart/bölüm zemini (örn. "Sağlık Özeti" kabı)
 *  - surfaceSubtle: girintili input/segment zemini
 *  - text: birincil metin
 *  - textSecondary / textTertiary / textMuted: hiyerarşik kademeler
 *  - border / borderStrong: hat renkleri
 *  - iconCircleBg: yuvarlak ikon kutu zemini (rowCard ikonu vb.)
 *  - overlay: modal/floating arka plan örtüsü (rgba)
 *  - shadow: gölge rengi
 *
 * Brand ve semantic-status renkleri (kırmızı/mavi/yeşil/sarı) ekranlardan
 * doğrudan kullanılmaya devam eder; tema değişiminden etkilenmez.
 */
import { Platform } from 'react-native';

const primaryBrand = '#1378C6';

export const Colors = {
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceMuted: '#F1F5F9',
    surfaceSubtle: '#F3F4F6',
    cardBackground: '#FFFFFF',
    inputBackground: '#F3F4F6',

    text: '#0F172A',
    textSecondary: '#475569',
    textTertiary: '#64748B',
    textMuted: '#94A3B8',
    textInverse: '#FFFFFF',

    border: '#E2E8F0',
    borderStrong: '#CBD5E1',
    divider: '#E5E7EB',

    iconCircleBg: '#E2E8F0',
    icon: '#94A3B8',

    overlay: 'rgba(0,0,0,0.5)',
    fabBackdrop: 'rgba(248, 250, 252, 0.9)',
    shadow: '#000000',

    tint: primaryBrand,
    primary: primaryBrand,
    tabBarBackground: '#FFFFFF',
    tabBarBorder: '#E5E7EB',
    tabIconDefault: '#94A3B8',
    tabIconSelected: primaryBrand,
  },
  dark: {
    background: '#0B1220',
    surface: '#1A2332',
    surfaceMuted: '#111A2B',
    surfaceSubtle: '#1F2937',
    cardBackground: '#1A2332',
    inputBackground: '#1F2937',

    text: '#F1F5F9',
    textSecondary: '#CBD5E1',
    textTertiary: '#94A3B8',
    textMuted: '#64748B',
    textInverse: '#0F172A',

    border: '#334155',
    borderStrong: '#475569',
    divider: '#334155',

    iconCircleBg: '#1F2937',
    icon: '#94A3B8',

    overlay: 'rgba(0,0,0,0.7)',
    fabBackdrop: 'rgba(11, 18, 32, 0.92)',
    shadow: '#000000',

    tint: primaryBrand,
    primary: primaryBrand,
    tabBarBackground: '#0F172A',
    tabBarBorder: '#1F2937',
    tabIconDefault: '#64748B',
    tabIconSelected: primaryBrand,
  },
};

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';
export type ColorPalette = typeof Colors.light;

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
