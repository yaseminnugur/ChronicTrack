import React, { useState, useMemo } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { CustomButton } from '@/components/CustomButton';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useColors } from '@/context/ThemeContext';
import type { ColorPalette } from '@/constants/theme';
import { router } from 'expo-router';
import { saveOnboardingData } from '../../services/onboardingService';
import { filterIntegerInput } from '../../utils/numberUtils';
import { validateBloodPressure, HEALTH_RANGES } from '../../validations/healthValidation';

export default function BloodPressureEntryScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [sets, setSets] = useState([
    { id: 1, sis: '', dia: '', pulse: '' },
    { id: 2, sis: '', dia: '', pulse: '' },
    { id: 3, sis: '', dia: '', pulse: '' },
  ]);
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  // Doldurulmuş setlerin validasyonunu hesapla
  const setValidations = useMemo(() => {
    return sets.map(s => ({
      id: s.id,
      validation: (s.sis || s.dia) ? validateBloodPressure(s.sis, s.dia, s.pulse) : null,
    }));
  }, [sets]);

  const handleSave = async () => {
    setShowErrors(true);

    // Doldurulmuş setlerde hata var mı kontrol et
    const filledSets = setValidations.filter(sv => sv.validation !== null);
    const hasErrors = filledSets.some(sv => sv.validation && !sv.validation.isValid);
    if (hasErrors) {
      return;
    }

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
    const numericValue = filterIntegerInput(value);
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

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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

                    {(() => {
                      const sv = setValidations.find(s => s.id === item.id);
                      const errors = sv?.validation?.errors || {};
                      return (
                        <>
                          <ThemedText style={styles.inputLabel}>Sistolik (Büyük)</ThemedText>
                          <TextInput
                            style={[
                              styles.smallInput,
                              { color: colors.text, backgroundColor: colors.background, borderColor: showErrors && errors.systolic ? '#FCA5A5' : colors.border }
                            ]}
                            value={item.sis}
                            onChangeText={(val) => updateSet(item.id, 'sis', val)}
                            placeholder="---"
                            placeholderTextColor={colors.textMuted}
                            keyboardType="numeric"
                            maxLength={3}
                          />
                          {showErrors && errors.systolic ? (
                            <ThemedText style={styles.fieldError}>{errors.systolic}</ThemedText>
                          ) : null}

                          <ThemedText style={styles.inputLabel}>Diyastolik (Küçük)</ThemedText>
                          <TextInput
                            style={[
                              styles.smallInput,
                              { color: colors.text, backgroundColor: colors.background, borderColor: showErrors && errors.diastolic ? '#FCA5A5' : colors.border }
                            ]}
                            value={item.dia}
                            onChangeText={(val) => updateSet(item.id, 'dia', val)}
                            placeholder="---"
                            placeholderTextColor={colors.textMuted}
                            keyboardType="numeric"
                            maxLength={3}
                          />
                          {showErrors && errors.diastolic ? (
                            <ThemedText style={styles.fieldError}>{errors.diastolic}</ThemedText>
                          ) : null}

                          <ThemedText style={styles.inputLabel}>Nabız (Dakika)</ThemedText>
                          <TextInput
                            style={[
                              styles.smallInput,
                              { color: colors.text, backgroundColor: colors.background, borderColor: showErrors && errors.pulse ? '#FCA5A5' : colors.border }
                            ]}
                            value={item.pulse}
                            onChangeText={(val) => updateSet(item.id, 'pulse', val)}
                            placeholder="---"
                            placeholderTextColor={colors.textMuted}
                            keyboardType="numeric"
                            maxLength={3}
                          />
                          {showErrors && errors.pulse ? (
                            <ThemedText style={styles.fieldError}>{errors.pulse}</ThemedText>
                          ) : null}
                        </>
                      );
                    })()}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (c: ColorPalette) => StyleSheet.create({
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
    color: c.textMuted,
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
    shadowColor: c.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 15,
    elevation: 2,
    borderWidth: 1,
    borderColor: c.surfaceSubtle,
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
    backgroundColor: c.divider,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  circleText: {
    fontSize: 12,
    fontWeight: '700',
    color: c.textSecondary,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: c.divider,
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
    color: c.textTertiary,
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
  fieldError: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '500',
    marginBottom: 12,
    marginTop: -8,
    paddingHorizontal: 4,
  },
  addSetPill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.surfaceSubtle,
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
    color: c.textSecondary,
    lineHeight: 18,
  },
  infoTextBold: {
    fontSize: 12,
    fontWeight: '700',
    color: c.text,
  },
  skipButton: {
    shadowOpacity: 0,
    elevation: 0,
  }
});
