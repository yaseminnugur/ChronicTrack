import React, { useMemo, useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile } from '../../services/userService';
import { useColors, useTheme } from '@/context/ThemeContext';
import type { ColorPalette, ThemeMode } from '@/constants/theme';

export default function ProfileTab() {
  const { signOut } = useAuth();
  const colors = useColors();
  const { mode, setMode } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const fetchProfile = async () => {
        try {
          const res = await getUserProfile();
          setProfile(res.user);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }, [])
  );

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/(auth)/login');
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedText>Yükleniyor...</ThemedText>
      </SafeAreaView>
    );
  }

  const themeOptions: { key: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'light', label: 'Açık', icon: 'sunny-outline' },
    { key: 'dark', label: 'Koyu', icon: 'moon-outline' },
    { key: 'system', label: 'Sistem', icon: 'phone-portrait-outline' },
  ];

  const stats = [
    { label: 'KİLO', value: profile?.weight || '--', unit: 'kg' },
    { label: 'BOY', value: profile?.height || '--', unit: 'cm' },
    { label: 'YAŞ', value: profile?.age || '--', unit: 'yaş' },
  ];

  const lifestyle = [
    {
      label: 'Sigara',
      value: profile?.isSmoking ? 'Kullanıyor' : 'Kullanmıyor',
      icon: <FontAwesome5 name="smoking-ban" size={16} color={colors.textSecondary} />,
    },
    {
      label: 'Fiziksel Aktivite',
      value: profile?.activityLevel || 'Belirtilmedi',
      icon: <Ionicons name="barbell-outline" size={18} color="#0284C7" />,
    },
    {
      label: 'Tuz Tüketimi',
      value: profile?.saltLevel || 'Belirtilmedi',
      icon: <Ionicons name="water-outline" size={18} color="#991B1B" />,
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Compact Header: avatar + isim yan yana */}
        <View style={styles.headerRow}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarFallback}>
              <Ionicons name="person" size={28} color={colors.textMuted} />
            </View>
            <TouchableOpacity
              style={styles.editAvatarBtn}
              activeOpacity={0.8}
              onPress={() => router.push('/edit-profile')}
            >
              <FontAwesome5 name="pen" size={8} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.headerTextCol}>
            <ThemedText style={styles.headerLabel}>HOŞ GELDİN</ThemedText>
            <ThemedText style={styles.userName} numberOfLines={1}>
              {profile?.name || 'Kullanıcı'}
            </ThemedText>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* Stat Grid — Kilo / Boy / Yaş */}
        <View style={styles.statGrid}>
          {stats.map((stat, i) => (
            <View
              key={stat.label}
              style={[
                styles.statCard,
                i !== stats.length - 1 && styles.statCardDivider,
              ]}
            >
              <ThemedText style={styles.statLabel}>{stat.label}</ThemedText>
              <View style={styles.statValueRow}>
                <ThemedText style={styles.statValue}>{stat.value}</ThemedText>
              </View>
              <ThemedText style={styles.statUnit}>{stat.unit}</ThemedText>
            </View>
          ))}
        </View>

        {/* Lifestyle List */}
        <ThemedText style={styles.sectionHeader}>Yaşam Tarzı</ThemedText>
        <View style={styles.listCard}>
          {lifestyle.map((item, i) => (
            <View
              key={item.label}
              style={[
                styles.listRow,
                i !== lifestyle.length - 1 && styles.listRowDivider,
              ]}
            >
              <View style={styles.listIcon}>{item.icon}</View>
              <ThemedText style={styles.listLabel}>{item.label}</ThemedText>
              <ThemedText style={styles.listValue} numberOfLines={1}>
                {item.value}
              </ThemedText>
            </View>
          ))}
        </View>

        {/* Görünüm */}
        <ThemedText style={styles.sectionHeader}>Görünüm</ThemedText>
        <View style={styles.themeCard}>
          <View style={styles.themeRow}>
            {themeOptions.map((opt) => {
              const active = mode === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.themeOption, active && styles.themeOptionActive]}
                  activeOpacity={0.8}
                  onPress={() => setMode(opt.key)}
                >
                  <Ionicons
                    name={opt.icon}
                    size={18}
                    color={active ? '#FFF' : colors.textSecondary}
                  />
                  <ThemedText
                    style={[
                      styles.themeOptionLabel,
                      { color: active ? '#FFF' : colors.textSecondary },
                    ]}
                  >
                    {opt.label}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
          <ThemedText style={styles.themeHint}>
            {mode === 'system'
              ? 'Cihaz ayarlarınızla otomatik eşleşir.'
              : mode === 'dark'
              ? 'Koyu tema her zaman aktif.'
              : 'Açık tema her zaman aktif.'}
          </ThemedText>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.updateButton}
          activeOpacity={0.9}
          onPress={() => router.push('/edit-profile')}
        >
          <FontAwesome5 name="briefcase-medical" size={16} color="#FFF" style={{ marginRight: 8 }} />
          <ThemedText style={styles.updateButtonText}>Tıbbi Profili Güncelle</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (c: ColorPalette) => StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
  },

  // Compact header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: c.iconCircleBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: c.background,
  },
  headerTextCol: {
    flex: 1,
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: c.textTertiary,
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: c.text,
    lineHeight: 26,
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: c.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Stat grid
  statGrid: {
    flexDirection: 'row',
    backgroundColor: c.surface,
    borderRadius: 20,
    paddingVertical: 18,
    marginBottom: 32,
    shadowColor: c.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  statCardDivider: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: c.border,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: c.textTertiary,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    color: c.text,
    lineHeight: 30,
  },
  statUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: c.textTertiary,
    marginTop: 4,
  },

  // Section header (üst başlık)
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: c.textTertiary,
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
    textTransform: 'uppercase',
  },

  // Lifestyle list
  listCard: {
    backgroundColor: c.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 28,
    shadowColor: c.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  listRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.border,
  },
  listIcon: {
    width: 28,
    alignItems: 'center',
    marginRight: 12,
  },
  listLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: c.text,
  },
  listValue: {
    fontSize: 14,
    fontWeight: '700',
    color: c.textSecondary,
    maxWidth: 160,
    textAlign: 'right',
  },

  // Theme card
  themeCard: {
    backgroundColor: c.surface,
    borderRadius: 16,
    padding: 12,
    shadowColor: c.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 12,
    gap: 6,
    backgroundColor: c.surfaceMuted,
  },
  themeOptionActive: {
    backgroundColor: '#0EA5E9',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  themeOptionLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  themeHint: {
    fontSize: 11,
    color: c.textTertiary,
    marginTop: 10,
    textAlign: 'center',
  },

  // FAB
  fabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: c.fabBackdrop,
  },
  updateButton: {
    flexDirection: 'row',
    backgroundColor: '#0EA5E9',
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  updateButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
