import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { CustomButton } from '@/components/CustomButton';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { router, useLocalSearchParams } from 'expo-router';

export default function DiabetesEntryScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const colors = Colors[theme as keyof typeof Colors];
  const { next } = useLocalSearchParams<{ next: string }>();

  const [diabetesType, setDiabetesType] = useState('');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [sugarLevel, setSugarLevel] = useState('');

  const handleSave = () => {
    // In a real app we would save 'diabetesType' and 'sugarLevel' to backend/storage
    if (next === 'bloodPressure') {
      router.push('/(data-entry)/bloodPressure');
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleDecimalInput = (text: string) => {
    // Sadece rakam ve noktaya (ondalık) izin ver
    const numericValue = text.replace(/[^0-9.]/g, '');
    setSugarLevel(numericValue);
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
          <ThemedText type="title" style={styles.pageTitle}>Kan Veri Girişi</ThemedText>
          <ThemedText type="secondary" style={styles.pageSubtitle}>
            Sağlık metriklerinizi güncel tutarak tıbbi ekibinizden en iyi bakım önerilerini aldığınızdan emin olun.
          </ThemedText>
        </View>

        {/* Section 1: Durum Detayları */}
        <View style={[styles.card, { backgroundColor: colors.inputBackground }]}>
          <View style={styles.cardHeaderRow}>
            <FontAwesome5 name="briefcase-medical" size={16} color={colors.primary} />
            <ThemedText style={[styles.cardHeaderTitle, { color: colors.primary }]}>Durum Detayları</ThemedText>
          </View>
          
          <ThemedText style={styles.inputLabel}>Diyabet Tipi</ThemedText>
          <TouchableOpacity 
            style={[styles.dropdownTrigger, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
            activeOpacity={0.8}
            onPress={() => setShowTypeDropdown(!showTypeDropdown)}
          >
            <ThemedText style={{ color: diabetesType ? colors.text : colors.textSecondary, flex: 1 }}>
              {diabetesType || 'Tipinizi seçin'}
            </ThemedText>
            <Ionicons name={showTypeDropdown ? "chevron-up" : "chevron-down"} size={20} color={colors.icon} />
          </TouchableOpacity>
          {showTypeDropdown && (
            <View style={[styles.dropdownMenu, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <TouchableOpacity 
                style={styles.dropdownOption} 
                onPress={() => { setDiabetesType('Tip 1'); setShowTypeDropdown(false); }}
              >
                <ThemedText style={{ color: colors.text }}>Tip 1</ThemedText>
              </TouchableOpacity>
              <View style={[styles.dropdownDivider, { backgroundColor: colors.border }]} />
              <TouchableOpacity 
                style={styles.dropdownOption} 
                onPress={() => { setDiabetesType('Tip 2'); setShowTypeDropdown(false); }}
              >
                <ThemedText style={{ color: colors.text }}>Tip 2</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Section 2 Title */}
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
          3 Aylık Ortalama Şeker Değerleri (HbA1c)
        </ThemedText>

        {/* Section 2 Card */}
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.cardHeaderRowSpace}>
            <ThemedText style={styles.inputLabelBold}>Şeker Ölçümü</ThemedText>
            <View style={[styles.iconCircleRound, { backgroundColor: colors.primary }]}>
              <FontAwesome5 name="tint" size={10} color="#FFF" />
            </View>
          </View>

          <View style={styles.bigInputRow}>
            <TextInput 
              style={[styles.hugeInput, { color: colors.text, borderColor: colors.inputBackground }]}
              value={sugarLevel}
              onChangeText={handleDecimalInput}
              placeholder="0.0"
              placeholderTextColor="#D1D5DB"
              keyboardType="decimal-pad"
              maxLength={5}
            />
            <ThemedText style={styles.unitText}>mg/dL</ThemedText>
          </View>

          <ThemedText style={styles.bottomHint}>
            Şeker ölçüm değerini giriniz
          </ThemedText>
        </View>

        <View style={{ flex: 1, minHeight: 40 }} />

        <CustomButton
          title="Verileri Kaydet"
          onPress={handleSave}
          style={{ marginBottom: 40 }}
          rightIcon={<FontAwesome5 name="save" size={18} color="#FFF" style={{ marginRight: 8 }} />}
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
    flexGrow: 1,
  },
  pageHeader: {
    marginBottom: 32,
  },
  pageTitle: {
    fontSize: 28,
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
    padding: 20,
    marginBottom: 24,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    marginLeft: 4,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
  },
  dropdownMenu: {
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  dropdownDivider: {
    height: 1,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  cardHeaderRowSpace: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  inputLabelBold: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
  },
  iconCircleRound: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  hugeInput: {
    fontSize: 48,
    fontWeight: '300',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 140,
    textAlign: 'center',
    marginRight: 16,
  },
  unitText: {
    fontSize: 16,
    fontWeight: '700',
  },
  bottomHint: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  }
});
