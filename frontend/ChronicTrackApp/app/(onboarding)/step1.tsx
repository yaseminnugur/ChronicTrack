import React, { useState, useMemo } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Switch, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { CustomButton } from '@/components/CustomButton';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useColors } from '@/context/ThemeContext';
import type { ColorPalette } from '@/constants/theme';
import { router } from 'expo-router';
import { saveStep1Profile } from '../../services/onboardingService';
import { filterDecimalInput, filterIntegerInput } from '../../utils/numberUtils';

export default function Step1Screen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [loading, setLoading] = useState(false);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');

  const handleWeightInput = (text: string) => {
    setWeight(filterDecimalInput(text));
  };

  const handleIntegerInput = (text: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    setter(filterIntegerInput(text));
  };

  const [smoker, setSmoker] = useState(false);
  const [activityLevel, setActivityLevel] = useState('Orta');
  const [saltLevel, setSaltLevel] = useState('Orta');

  const activityOptions = [
    { id: 'Hareketsiz', icon: 'chair', label: 'Hareketsiz' },
    { id: 'Orta', icon: 'walking', label: 'Orta' },
    { id: 'Aktif', icon: 'running', label: 'Aktif' },
    { id: 'Sporcu', icon: 'dumbbell', label: 'Sporcu' },
  ];

  const saltOptions = [
    { id: 'Düşük', label: 'Düşük' },
    { id: 'Orta', label: 'Orta' },
    { id: 'Yüksek', label: 'Yüksek' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.topHeader}>
        <View style={styles.logoRow}>
          <View style={[styles.miniLogo, { backgroundColor: colors.primary }]}>
            <FontAwesome5 name="shield-alt" size={12} color="#FFF" />
          </View>
          <ThemedText style={[styles.brandText, { color: colors.primary }]}>ChronicTrack</ThemedText>
        </View>
        <ThemedText style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '600' }}>
          Adım 1 / 2
        </ThemedText>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.pageHeader}>
          <ThemedText type="title" style={styles.pageTitle}>Kişisel Sağlık Profili</ThemedText>
          <ThemedText type="secondary" style={styles.pageSubtitle}>
            Daha iyi bir takip için temel bilgilerinizi girin.
          </ThemedText>
        </View>

        <View style={styles.sectionTitleRow}>
          <FontAwesome5 name="expand-arrows-alt" size={16} color={colors.primary} />
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Fiziksel Özellikler</ThemedText>
        </View>

        <View style={[styles.card, { backgroundColor: colors.inputBackground }]}>
          <View style={styles.inputWrapper}>
            <ThemedText style={styles.inputLabel}>KİLO (KG)</ThemedText>
            <View style={[styles.inputBox, { backgroundColor: colors.cardBackground }]}>
              <TextInput
                style={[styles.inputField, { color: colors.text }]}
                value={weight}
                onChangeText={handleWeightInput}
                placeholder="70"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                maxLength={5}
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <ThemedText style={styles.inputLabel}>BOY (CM)</ThemedText>
            <View style={[styles.inputBox, { backgroundColor: colors.cardBackground }]}>
              <TextInput
                style={[styles.inputField, { color: colors.text }]}
                value={height}
                onChangeText={(text) => handleIntegerInput(text, setHeight)}
                placeholder="175"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <ThemedText style={styles.inputLabel}>YAŞ</ThemedText>
            <View style={[styles.inputBox, { backgroundColor: colors.cardBackground }]}>
              <TextInput
                style={[styles.inputField, { color: colors.text }]}
                value={age}
                onChangeText={(text) => handleIntegerInput(text, setAge)}
                placeholder="45"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
          </View>
        </View>


        <View style={[styles.sectionTitleRow, { marginTop: 32 }]}>
          <FontAwesome5 name="heart" solid size={16} color={colors.primary} />
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Yaşam Tarzı ve Alışkanlıklar</ThemedText>
        </View>

        <View style={[styles.card, { backgroundColor: colors.inputBackground, paddingVertical: 12 }]}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ fontSize: 15, fontWeight: '700', marginBottom: 4 }}>Sigara Kullanımı</ThemedText>
              <ThemedText style={{ fontSize: 13, color: colors.textSecondary }}>Aktif olarak kullanıyor musunuz?</ThemedText>
            </View>
            <Switch
              trackColor={{ false: colors.borderStrong, true: colors.primary }}
              thumbColor={"#FFFFFF"}
              onValueChange={setSmoker}
              value={smoker}
            />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.inputBackground, marginTop: 16 }]}>
          <ThemedText style={{ fontSize: 15, fontWeight: '700', marginBottom: 16 }}>Günlük Aktivite Seviyesi</ThemedText>
          <View style={styles.gridContainer}>
            {activityOptions.map((opt) => {
              const isActive = activityLevel === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.gridItem,
                    { backgroundColor: colors.cardBackground },
                    isActive && { backgroundColor: '#DDF0FF', borderColor: colors.primary, borderWidth: 1 }
                  ]}
                  onPress={() => setActivityLevel(opt.id)}
                  activeOpacity={0.7}
                >
                  <FontAwesome5
                    name={opt.icon}
                    size={20}
                    color={isActive ? colors.primary : colors.textSecondary}
                    style={{ marginBottom: 8 }}
                  />
                  <ThemedText style={[
                    { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
                    isActive && { color: colors.primary }
                  ]}>
                    {opt.label}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.inputBackground, marginTop: 16, marginBottom: 40 }]}>
          <ThemedText style={{ fontSize: 15, fontWeight: '700', marginBottom: 16 }}>Tuz Tüketimi</ThemedText>
          <View style={styles.rowContainer}>
            {saltOptions.map((opt) => {
              const isActive = saltLevel === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.rowItem,
                    { backgroundColor: colors.cardBackground },
                    isActive && { backgroundColor: '#DDF0FF', borderColor: colors.primary, borderWidth: 1 }
                  ]}
                  onPress={() => setSaltLevel(opt.id)}
                  activeOpacity={0.7}
                >
                  <ThemedText style={[
                    { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
                    isActive && { color: colors.primary }
                  ]}>
                    {opt.label}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <CustomButton
          title="Profili Kaydet"
          loading={loading}
          onPress={async () => {
            try {
              setLoading(true);
              await saveStep1Profile({
                weight,
                height,
                age,
                isSmoking: smoker,
                activityLevel,
                saltLevel,
              });
              router.push('/(onboarding)/step2');
            } catch (error) {
              console.error('Profil kaydedilirken hata oluştu', error);
            } finally {
              setLoading(false);
            }
          }}
          style={{ marginBottom: 40 }}
          rightIcon={<FontAwesome5 name="save" size={18} color="#FFF" style={{ marginRight: 8 }} />}
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: c.divider, // Lighter border
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
    fontSize: 16,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  pageHeader: {
    marginBottom: 32,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 10,
  },
  card: {
    borderRadius: 24,
    padding: 20,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: c.textTertiary,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputBox: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  inputField: {
    fontSize: 20,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    aspectRatio: 1.5,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowItem: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
});
