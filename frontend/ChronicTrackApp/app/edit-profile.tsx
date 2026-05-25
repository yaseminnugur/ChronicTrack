import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput, Switch, Platform, KeyboardAvoidingView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/context/ThemeContext';
import type { ColorPalette } from '@/constants/theme';
import { router } from 'expo-router';
import { getUserProfile, updateUserProfile } from '../services/userService';
import { filterDecimalInput, filterIntegerInput, safeParseInt } from '../utils/numberUtils';

export default function EditProfileScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');

  const [isSmoking, setIsSmoking] = useState(false);
  const [activityLevel, setActivityLevel] = useState('Orta');
  const [saltLevel, setSaltLevel] = useState('Orta Düzey');
  const [onboardingData, setOnboardingData] = useState<any>(null);

  // Editable onboarding fields
  const [diabetesType, setDiabetesType] = useState('');
  const [hba1c, setHba1c] = useState('');
  const [bloodPressureData, setBloodPressureData] = useState<any[]>([]);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const ACTIVITY_OPTIONS = ['Hareketsiz', 'Orta', 'Aktif', 'Sporcu'];
  const SALT_OPTIONS = ['Düşük', 'Orta Düzey', 'Yüksek'];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        if (data.user) {
          setWeight(data.user.weight ? data.user.weight.toString() : '');
          setHeight(data.user.height ? data.user.height.toString() : '');
          setAge(data.user.age ? data.user.age.toString() : '');
          setIsSmoking(!!data.user.isSmoking);
          setActivityLevel(data.user.activityLevel || 'Orta');
          setSaltLevel(data.user.saltLevel || 'Orta Düzey');
          if (data.user.onboardingData) {
            setOnboardingData(data.user.onboardingData);
            setDiabetesType(data.user.onboardingData.diabetesType || '');
            setHba1c(data.user.onboardingData.hba1c ? data.user.onboardingData.hba1c.toString() : '');
            setBloodPressureData(data.user.onboardingData.bloodPressureData || []);
          }
        }
      } catch (error) {
        console.error('Profil yüklenirken hata:', error);
        Alert.alert('Hata', 'Profil bilgileri yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const updateBPField = (index: number, field: 'sis' | 'dia' | 'pulse', value: string) => {
    const updated = [...bloodPressureData];
    const filtered = filterIntegerInput(value);
    updated[index] = { ...updated[index], [field]: filtered ? safeParseInt(filtered) : 0 };
    setBloodPressureData(updated);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updateData: any = {
        weight,
        height,
        age,
        isSmoking,
        activityLevel,
        saltLevel,
      };

      // Include onboarding data if it exists
      if (onboardingData) {
        updateData.diabetesType = diabetesType || undefined;
        updateData.hba1c = hba1c || undefined;
        if (bloodPressureData.length > 0) {
          updateData.bloodPressureData = bloodPressureData;
        }
      }

      await updateUserProfile(updateData);
      Alert.alert('Başarılı', 'Profil başarıyla güncellendi.', [
        { text: 'Tamam', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Profil güncellenirken hata:', error);
      Alert.alert('Hata', 'Profil güncellenemedi.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>

      {/* Header View */}
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Profile Info Subheader */}
          <View style={styles.headerTitleRow}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarFallback}>
                <Ionicons name="person" size={32} color={colors.textMuted} />
              </View>
              <View style={styles.cameraBtn}>
                <Ionicons name="camera" size={10} color="#FFF" />
              </View>
            </View>
            <View style={styles.headerTextCol}>
              <ThemedText style={styles.mainTitle}>Kişisel Sağlık Profili</ThemedText>
              <ThemedText style={styles.subTitle}>Hassas sağlık takibi için bilgilerinizi güncelleyin.</ThemedText>
            </View>
          </View>

          {/* Section: FİZİKSEL ÖZELLİKLER */}
          <View style={styles.formSection}>
            <ThemedText style={styles.sectionLabel}>FİZİKSEL ÖZELLİKLER</ThemedText>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Kilo (kg)</ThemedText>
              <View style={styles.inputWrapper}>
                <TextInput style={styles.input} value={weight} onChangeText={(text) => setWeight(filterDecimalInput(text))} keyboardType="decimal-pad" />
                <MaterialCommunityIcons name="weight" size={20} color={colors.textSecondary} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Boy (cm)</ThemedText>
              <View style={styles.inputWrapper}>
                <TextInput style={styles.input} value={height} onChangeText={(text) => setHeight(filterIntegerInput(text))} keyboardType="numeric" />
                <MaterialCommunityIcons name="ruler" size={20} color={colors.textSecondary} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Yaş</ThemedText>
              <View style={styles.inputWrapper}>
                <TextInput style={styles.input} value={age} onChangeText={(text) => setAge(filterIntegerInput(text))} keyboardType="numeric" />
                <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
              </View>
            </View>
          </View>

          {/* Section: YAŞAM TARZI VE ALIŞKANLIKLAR */}
          <View style={styles.formSection}>
            <ThemedText style={styles.sectionLabel}>YAŞAM TARZI VE ALIŞKANLIKLAR</ThemedText>

            {/* Smoking Toggle */}
            <View style={styles.toggleCard}>
              <View style={styles.toggleIconCol}>
                <View style={styles.smokeIconWrap}>
                  <FontAwesome5 name="smoking-ban" size={16} color="#0284C7" />
                </View>
              </View>
              <View style={styles.toggleTextCol}>
                <ThemedText style={styles.toggleTitle}>Sigara Kullanımı</ThemedText>
                <ThemedText style={styles.toggleDesc}>Şu anda sigara içiyor musunuz?</ThemedText>
              </View>
              <Switch
                value={isSmoking}
                onValueChange={setIsSmoking}
                trackColor={{ false: colors.border, true: '#0EA5E9' }}
                thumbColor={'#FFF'}
              />
            </View>

            {/* Activity Buttons */}
            <ThemedText style={styles.inputLabel}>Günlük Aktivite Düzeyi</ThemedText>
            <View style={styles.pillGrid}>
              {ACTIVITY_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  activeOpacity={0.7}
                  onPress={() => setActivityLevel(opt)}
                  style={[styles.pillBtn, activityLevel === opt && styles.pillBtnActive]}
                >
                  <ThemedText style={[styles.pillText, activityLevel === opt && styles.pillTextActive]}>{opt}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            {/* Salt Selector using Buttons instead of Slider */}
            <View style={styles.saltHeaderRow}>
              <ThemedText style={styles.inputLabel}>Tuz Tüketimi</ThemedText>
              <View style={styles.saltStatusBadge}>
                <ThemedText style={styles.saltStatusText}>{saltLevel}</ThemedText>
              </View>
            </View>
            <View style={styles.pillGrid}>
              {SALT_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  activeOpacity={0.7}
                  onPress={() => setSaltLevel(opt)}
                  style={[styles.pillBtn, saltLevel === opt && styles.pillBtnActive]}
                >
                  <ThemedText style={[styles.pillText, saltLevel === opt && styles.pillTextActive]}>{opt}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>

          </View>

          {/* Section: ONBOARDING DATA - Editable */}
          {onboardingData && (
            <View style={styles.formSection}>
              <View style={{flexDirection:'row', justifyContent:'space-between', alignItems: 'center', marginBottom: 20}}>
                <ThemedText style={[styles.sectionLabel, {marginBottom: 0}]}>SAĞLIK ÖLÇÜMLERİ</ThemedText>
                <FontAwesome5 name="pen" size={12} color="#0EA5E9" />
              </View>
              
              {(onboardingData.diabetesType !== undefined || diabetesType) && (
                <View style={[styles.inputGroup, { marginBottom: 16 }]}>
                  <ThemedText style={styles.inputLabel}>Diyabet Tipi</ThemedText>
                  <TouchableOpacity
                    style={[styles.inputWrapper, { justifyContent: 'space-between' }]}
                    activeOpacity={0.8}
                    onPress={() => setShowTypeDropdown(!showTypeDropdown)}
                  >
                    <ThemedText style={[styles.input, { color: diabetesType ? colors.text : colors.textMuted }]}>
                      {diabetesType || 'Tipinizi seçin'}
                    </ThemedText>
                    <Ionicons name={showTypeDropdown ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                  {showTypeDropdown && (
                    <View style={styles.dropdownMenu}>
                      <TouchableOpacity
                        style={styles.dropdownOption}
                        onPress={() => { setDiabetesType('Tip 1'); setShowTypeDropdown(false); }}
                      >
                        <ThemedText style={[styles.dropdownText, diabetesType === 'Tip 1' && { color: '#0EA5E9', fontWeight: '700' }]}>Tip 1</ThemedText>
                        {diabetesType === 'Tip 1' && <Ionicons name="checkmark" size={18} color="#0EA5E9" />}
                      </TouchableOpacity>
                      <View style={styles.dropdownDivider} />
                      <TouchableOpacity
                        style={styles.dropdownOption}
                        onPress={() => { setDiabetesType('Tip 2'); setShowTypeDropdown(false); }}
                      >
                        <ThemedText style={[styles.dropdownText, diabetesType === 'Tip 2' && { color: '#0EA5E9', fontWeight: '700' }]}>Tip 2</ThemedText>
                        {diabetesType === 'Tip 2' && <Ionicons name="checkmark" size={18} color="#0EA5E9" />}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}

              {(onboardingData.hba1c !== undefined || hba1c) && (
                <View style={[styles.inputGroup, { marginBottom: 16 }]}>
                  <ThemedText style={styles.inputLabel}>3 Aylık Şeker (HbA1c)</ThemedText>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      value={hba1c}
                      onChangeText={(text) => setHba1c(filterDecimalInput(text))}
                      keyboardType="decimal-pad"
                      placeholder="0.0"
                      placeholderTextColor={colors.textMuted}
                    />
                    <ThemedText style={{ fontSize: 13, color: colors.textTertiary, fontWeight: '600' }}>%</ThemedText>
                  </View>
                </View>
              )}

              {bloodPressureData && bloodPressureData.length > 0 && (
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel}>Tansiyon Ölçümleri</ThemedText>
                  {bloodPressureData.map((bp: any, idx: number) => (
                    <View key={idx} style={styles.bpEditRow}>
                      <View style={styles.bpIndexCircle}>
                        <ThemedText style={styles.bpIndexText}>{idx + 1}</ThemedText>
                      </View>
                      <View style={styles.bpInputGroup}>
                        <View style={styles.bpInputWrapper}>
                          <TextInput
                            style={styles.bpInput}
                            value={bp.sis?.toString() || ''}
                            onChangeText={(text) => updateBPField(idx, 'sis', text)}
                            keyboardType="numeric"
                            placeholder="Sis"
                            placeholderTextColor={colors.textMuted}
                            maxLength={3}
                          />
                          <ThemedText style={styles.bpSlash}>/</ThemedText>
                          <TextInput
                            style={styles.bpInput}
                            value={bp.dia?.toString() || ''}
                            onChangeText={(text) => updateBPField(idx, 'dia', text)}
                            keyboardType="numeric"
                            placeholder="Dia"
                            placeholderTextColor={colors.textMuted}
                            maxLength={3}
                          />
                          <ThemedText style={styles.bpUnitText}>mmHg</ThemedText>
                        </View>
                        <View style={styles.bpPulseWrapper}>
                          <FontAwesome5 name="heartbeat" size={12} color="#EF4444" style={{marginRight: 6}} />
                          <TextInput
                            style={styles.bpPulseInput}
                            value={bp.pulse?.toString() || ''}
                            onChangeText={(text) => updateBPField(idx, 'pulse', text)}
                            keyboardType="numeric"
                            placeholder="Nabız"
                            placeholderTextColor={colors.textMuted}
                            maxLength={3}
                          />
                          <ThemedText style={styles.bpUnitText}>bpm</ThemedText>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          <View style={styles.saveInfoBox}>
            <ThemedText style={styles.saveInfoText}>
              Değişiklikler sağlık analizlerinize anında yansıtılacaktır.
            </ThemedText>
          </View>

        </ScrollView>

        <View style={styles.fabContainer}>
          <TouchableOpacity style={styles.saveButton} activeOpacity={0.9} onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#FFF" style={{ marginRight: 8 }} />
            ) : (
              <FontAwesome5 name="save" size={16} color="#FFF" style={{ marginRight: 8 }} />
            )}
            <ThemedText style={styles.saveButtonText}>Değişiklikleri Kaydet</ThemedText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (c: ColorPalette) => StyleSheet.create({
  topNav: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 0,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: c.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: c.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 120,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 16,
  },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: c.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBtn: {
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
  mainTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: c.text,
    marginBottom: 4,
    lineHeight: 28,
  },
  subTitle: {
    fontSize: 12,
    color: c.textTertiary,
    lineHeight: 18,
  },
  formSection: {
    backgroundColor: c.surfaceMuted,
    borderRadius: 32,
    padding: 24,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: c.textMuted,
    letterSpacing: 1,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: c.textSecondary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.surface,
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
    shadowColor: c.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: c.text,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.surface,
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
    shadowColor: c.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 1,
  },
  toggleIconCol: {
    marginRight: 16,
  },
  smokeIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleTextCol: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: c.text,
    marginBottom: 4,
  },
  toggleDesc: {
    fontSize: 11,
    color: c.textTertiary,
  },
  pillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 24,
  },
  pillBtn: {
    flexBasis: '47%',
    margin: '1.5%',
    backgroundColor: c.surface,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: c.surface,
    shadowColor: c.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 1,
  },
  pillBtnActive: {
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: c.textSecondary,
  },
  pillTextActive: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
  saltHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  saltStatusBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  saltStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  saveInfoBox: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  saveInfoText: {
    fontSize: 12,
    color: c.textTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  fabContainer: {
    padding: 24,
    paddingTop: 12,
    backgroundColor: c.fabBackdrop,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#0EA5E9',
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dropdownMenu: {
    marginTop: 8,
    backgroundColor: c.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c.border,
    overflow: 'hidden',
  },
  dropdownOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dropdownText: {
    fontSize: 15,
    fontWeight: '600',
    color: c.textSecondary,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: c.surfaceMuted,
    width: '100%',
  },
  bpEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: c.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  bpIndexCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: c.iconCircleBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bpIndexText: {
    fontSize: 11,
    fontWeight: '700',
    color: c.textSecondary,
  },
  bpInputGroup: {
    flex: 1,
  },
  bpInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  bpInput: {
    width: 50,
    height: 36,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: c.text,
  },
  bpSlash: {
    fontSize: 18,
    fontWeight: '600',
    color: c.textMuted,
    marginHorizontal: 6,
  },
  bpUnitText: {
    fontSize: 11,
    fontWeight: '600',
    color: c.textTertiary,
    marginLeft: 8,
  },
  bpPulseWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bpPulseInput: {
    width: 50,
    height: 32,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: c.text,
  },
});
