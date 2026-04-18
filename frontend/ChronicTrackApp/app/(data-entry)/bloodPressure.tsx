import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { CustomButton } from '@/components/CustomButton';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { router } from 'expo-router';
import { saveOnboardingData } from '../../services/onboardingService';

export default function BloodPressureEntryScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const colors = Colors[theme as keyof typeof Colors];

  const [sets, setSets] = useState([
    { id: 1, sis: '', dia: '', pulse: '' },
    { id: 2, sis: '', dia: '', pulse: '' },
    { id: 3, sis: '', dia: '', pulse: '' },
  ]);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const validSets = sets.filter(s => s.sis && s.dia);
      if (validSets.length > 0) {
        await saveOnboardingData({
          bloodPressureData: validSets.map(set => ({
            sis: set.sis,
            dia: set.dia,
            pulse: set.pulse || '0',
          })),
        });
      }
      router.replace('/(tabs)');
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  const updateSet = (id: number, field: 'sis' | 'dia' | 'pulse', value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setSets(sets.map(s => s.id === id ? { ...s, [field]: numericValue } : s));
  };

  const addSet = () => {
    setSets([...sets, { id: sets.length + 1, sis: '', dia: '', pulse: '' }]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* HEADER */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.logoRow} onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(onboarding)/step2');
          }
        }} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={colors.primary} style={{ marginRight: 12 }} />
          <View style={[styles.miniLogo, { backgroundColor: colors.primary }]}>
            <FontAwesome5 name="shield-alt" size={12} color="#FFF" />
          </View>
          <ThemedText style={[styles.brandText, { color: colors.primary }]}>ChronicTrack</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.pageHeader}>
          <ThemedText style={styles.preTitle}>FORM KAYDI</ThemedText>
          <ThemedText type="title" style={styles.pageTitle}>Tansiyon Veri Girişi</ThemedText>
          <ThemedText type="secondary" style={styles.pageSubtitle}>
            Sağlık takibiniz için son ölçümlerinizi aşağıya giriniz. Bu veriler medikal geçmişinizde güvenle saklanacaktır.
          </ThemedText>
        </View>

        {/* Card */}
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.cardTopRow}>
            <ThemedText style={[styles.cardTitle, { color: colors.primary }]}>Son Tansiyon Setleri</ThemedText>
            <View style={styles.badge}>
              <FontAwesome5 name="history" size={10} color={colors.primary} style={{ marginRight: 4 }} />
              <ThemedText style={styles.badgeText}>Son 3 Kayıt</ThemedText>
            </View>
          </View>

          <View style={styles.setsList}>
            {sets.map((item, index) => {
              const isLast = index === sets.length - 1;
              return (
                <View key={item.id} style={styles.setItemContainer}>
                  {/* Timeline logic */}
                  <View style={styles.timelineColumn}>
                    <View style={styles.circle}>
                      <ThemedText style={styles.circleText}>{item.id}</ThemedText>
                    </View>
                    {!isLast && <View style={styles.line} />}
                  </View>

                  <View style={styles.setInputColumn}>
                    <ThemedText style={styles.setTitle}>Ölçüm Seti</ThemedText>

                    <ThemedText style={styles.inputLabel}>Sistolik (Büyük)</ThemedText>
                    <TextInput
                      style={[styles.smallInput, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                      value={item.sis}
                      onChangeText={(val) => updateSet(item.id, 'sis', val)}
                      placeholder="---"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      maxLength={3}
                    />

                    <ThemedText style={styles.inputLabel}>Diyastolik (Küçük)</ThemedText>
                    <TextInput
                      style={[styles.smallInput, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                      value={item.dia}
                      onChangeText={(val) => updateSet(item.id, 'dia', val)}
                      placeholder="---"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      maxLength={3}
                    />

                    <ThemedText style={styles.inputLabel}>Nabız (Dakika)</ThemedText>
                    <TextInput
                      style={[styles.smallInput, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                      value={item.pulse}
                      onChangeText={(val) => updateSet(item.id, 'pulse', val)}
                      placeholder="---"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      maxLength={3}
                    />
                  </View>
                </View>
              );
            })}
          </View>

          <TouchableOpacity style={styles.addSetPill} onPress={addSet} activeOpacity={0.7}>
            <FontAwesome5 name="plus-circle" size={14} color={colors.primary} />
            <ThemedText style={[styles.addSetText, { color: colors.textSecondary }]}> Yeni Set Ekle</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <View style={styles.infoIconWrapper}>
            <Ionicons name="information" size={14} color="#FFF" />
          </View>
          <ThemedText style={styles.infoText}>
            <ThemedText style={styles.infoTextBold}>Uzman Notu</ThemedText>{'\n'}
            Ölçümleri dinlenmiş bir vaziyette, 5 dakika arayla almanız sonuçların doğruluğunu artırır.
          </ThemedText>
        </View>

        <CustomButton
          title="Verileri Kaydet"
          onPress={handleSave}
          style={{ marginBottom: 16 }}
        />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  brandText: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
  pageHeader: {
    marginBottom: 24,
  },
  preTitle: {
    fontSize: 11,
    letterSpacing: 1.5,
    color: '#9CA3AF',
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 14,
    lineHeight: 22,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    paddingTop: 32,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 15,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    maxWidth: '65%',
    lineHeight: 28,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0EFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1378C6',
    marginLeft: 2,
  },
  setsList: {
    marginBottom: 8,
  },
  setItemContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  timelineColumn: {
    width: 32,
    alignItems: 'center',
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  circleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginTop: -4,
    marginBottom: -4,
  },
  setInputColumn: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 24,
  },
  setTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
  },
  smallInput: {
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 16,
  },
  addSetPill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 8,
  },
  addSetText: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F4F9FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#E6F0FA',
  },
  infoIconWrapper: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1378C6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
  },
  infoTextBold: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  skipButton: {
    shadowOpacity: 0,
    elevation: 0,
  }
});
