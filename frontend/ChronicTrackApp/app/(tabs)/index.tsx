import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { CustomButton } from '@/components/CustomButton';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { router } from 'expo-router';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const colors = Colors[theme as keyof typeof Colors];

  // Demo state to toggle between empty and filled screens
  const [hasData, setHasData] = useState(false);
  const [activeTab, setActiveTab] = useState<'Kan Şekeri' | 'Tansiyon'>('Kan Şekeri');

  const handleAddBloodSugar = () => {
    router.push('/(data-entry)/diabetes');
  };

  const handleAddBloodPressure = () => {
    router.push('/(data-entry)/bloodPressure');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerRow}>
          <View>
            <ThemedText style={styles.preTitle}>{hasData ? 'GÜNLÜK GENEL BAKIŞ' : 'Hoş Geldiniz'}</ThemedText>
            <ThemedText style={styles.title}>Günaydın,{'\n'}Yasemin</ThemedText>
          </View>
          {/* A hidden/discreet toggle for testing the UI */}
          <TouchableOpacity onPress={() => setHasData(!hasData)} style={styles.demoToggle}>
             <Ionicons name="swap-horizontal" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* METRICS CARDS */}
        {hasData ? (
          // FILLED STATE CARDS
          <View style={styles.rowCards}>
            <View style={[styles.filledCard, { marginRight: 8 }]}>
              <View style={styles.iconRedCircle}>
                <Ionicons name="water-outline" size={18} color="#E11D48" />
              </View>
              <ThemedText style={styles.cardLabel}>Son Kan{'\n'}Şekeri</ThemedText>
              <View style={styles.valueRow}>
                <ThemedText style={styles.cardValue}>110</ThemedText>
              </View>
              <ThemedText style={styles.cardUnit}>mg/dL</ThemedText>
            </View>

            <View style={[styles.filledCard, { marginLeft: 8 }]}>
              <View style={styles.iconBlueCircle}>
                <FontAwesome5 name="wave-square" size={14} color="#0EA5E9" />
              </View>
              <ThemedText style={styles.cardLabel}>Son Tansiyon</ThemedText>
              <View style={styles.valueRow}>
                <ThemedText style={styles.cardValue}>120/80</ThemedText>
              </View>
              <ThemedText style={styles.cardUnit}>mmHg</ThemedText>
            </View>
          </View>
        ) : (
          // EMPTY STATE CARDS
          <View style={styles.colCards}>
            <View style={styles.emptyCard}>
              <View style={styles.emptyCardHeader}>
                <View style={styles.iconBlueCircleOutline}>
                  <Ionicons name="water-outline" size={16} color="#0EA5E9" />
                </View>
                <ThemedText style={styles.emptyCardBadgeText}>GLİKOZ</ThemedText>
              </View>
              <ThemedText style={styles.emptyCardLabel}>Son Kan Şekeri</ThemedText>
              <ThemedText style={styles.emptyCardPlaceholder}>Ölçüm girilmedi</ThemedText>
              <TouchableOpacity onPress={handleAddBloodSugar} style={styles.linkRow} activeOpacity={0.7}>
                <ThemedText style={[styles.linkText, { color: '#0EA5E9' }]}>Veri Ekle</ThemedText>
                <Ionicons name="arrow-forward" size={14} color="#0EA5E9" style={{ marginLeft: 4, marginTop: 2 }} />
              </TouchableOpacity>
            </View>

            <View style={styles.emptyCard}>
              <View style={styles.emptyCardHeader}>
                <View style={styles.iconRedCircleOutline}>
                  <Ionicons name="heart-outline" size={18} color="#E11D48" />
                </View>
                <ThemedText style={styles.emptyCardBadgeText}>TANSİYON</ThemedText>
              </View>
              <ThemedText style={styles.emptyCardLabel}>Son Tansiyon</ThemedText>
              <ThemedText style={styles.emptyCardPlaceholder}>Ölçüm girilmedi</ThemedText>
              <TouchableOpacity onPress={handleAddBloodPressure} style={styles.linkRow} activeOpacity={0.7}>
                <ThemedText style={[styles.linkText, { color: '#E11D48' }]}>Veri Ekle</ThemedText>
                <Ionicons name="arrow-forward" size={14} color="#E11D48" style={{ marginLeft: 4, marginTop: 2 }} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ANALYSIS SECTION */}
        <View style={styles.analysisSection}>
          <View style={styles.analysisHeader}>
            <ThemedText style={styles.analysisTitle}>Sağlık Analizi</ThemedText>
            {hasData ? (
              <TouchableOpacity style={styles.dropdownBadge} activeOpacity={0.7}>
                <ThemedText style={styles.dropdownBadgeText}>Son 7 Gün</ThemedText>
                <Ionicons name="chevron-down" size={12} color="#4B5563" />
              </TouchableOpacity>
            ) : (
              <View style={styles.grayBadge}>
                <ThemedText style={styles.grayBadgeText}>Haftalık</ThemedText>
              </View>
            )}
          </View>

          {hasData && (
            <View style={styles.segmentContainer}>
              <TouchableOpacity 
                style={[styles.segmentBtn, activeTab === 'Kan Şekeri' && styles.segmentBtnActive]}
                onPress={() => setActiveTab('Kan Şekeri')}
                activeOpacity={0.8}
              >
                <ThemedText style={[styles.segmentText, activeTab === 'Kan Şekeri' && styles.segmentTextActive]}>
                  Kan Şekeri
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.segmentBtn, activeTab === 'Tansiyon' && styles.segmentBtnActive]}
                onPress={() => setActiveTab('Tansiyon')}
                activeOpacity={0.8}
              >
                <ThemedText style={[styles.segmentText, activeTab === 'Tansiyon' && styles.segmentTextActive]}>
                  Tansiyon
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {hasData ? (
            <View style={styles.chartBox}>
              <View style={styles.tooltipPill}>
                <ThemedText style={styles.tooltipText}>110 mg/dL (Ort)</ThemedText>
              </View>
              {/* Mock Bar Chart */}
              <View style={styles.barsRow}>
                {[40, 60, 50, 80, 50, 45, 55].map((height, index) => {
                  const isMiddle = index === 3;
                  return (
                    <View key={index} style={styles.barWrapper}>
                      <View style={[
                        styles.barFill, 
                        { height: `${height}%`, backgroundColor: isMiddle ? '#0EA5E9' : '#93C5FD' }
                      ]} />
                    </View>
                  );
                })}
              </View>
              {/* X-Axis */}
              <View style={styles.xAxisRow}>
                {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day, idx) => (
                  <ThemedText key={idx} style={styles.xAxisLabel}>{day}</ThemedText>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.emptyChartBox}>
              <View style={styles.emptyChartCircle}>
                <Ionicons name="bar-chart-outline" size={32} color="#CBD5E1" />
              </View>
              <ThemedText style={styles.emptyChartTitle}>Henüz ölçüm girilmedi</ThemedText>
              <ThemedText style={styles.emptyChartSubtitle}>
                Verilerinizi takip etmeye başlamak için ilk ölçümünüzü ekleyin.
              </ThemedText>
            </View>
          )}
        </View>

        <View style={{ flex: 1, minHeight: 40 }} />

        {/* BOTTOM BUTTONS */}
        <CustomButton
          title="Kan Şekeri Ekle"
          onPress={handleAddBloodSugar}
          style={{ marginBottom: 12 }}
          leftIcon={<Ionicons name="add" size={20} color="#FFF" style={{ marginRight: 6 }} />}
        />

        <CustomButton
          title="Tansiyon Ekle"
          onPress={handleAddBloodPressure}
          style={{ backgroundColor: '#E2E8F0', borderColor: 'transparent' }}
          textStyle={{ color: '#0F172A' }}
          leftIcon={<Ionicons name="add" size={20} color="#0F172A" style={{ marginRight: 6 }} />}
        />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    flexGrow: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  preTitle: {
    fontSize: 11,
    letterSpacing: 1,
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 38,
    letterSpacing: -1,
  },
  demoToggle: {
    padding: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
  },
  
  // Filled Cards
  rowCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  filledCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 15,
    elevation: 2,
  },
  iconRedCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FFE4E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: '#FFF',
  },
  iconBlueCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: '#FFF',
  },
  cardLabel: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 18,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  cardValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardUnit: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },

  // Empty Cards
  colCards: {
    marginBottom: 32,
  },
  emptyCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
  },
  emptyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  iconBlueCircleOutline: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRedCircleOutline: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FFE4E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCardBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 1,
  },
  emptyCardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  emptyCardPlaceholder: {
    fontSize: 15,
    fontWeight: '600',
    fontStyle: 'italic',
    color: '#94A3B8',
    marginBottom: 16,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Analysis Section
  analysisSection: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 15,
    elevation: 2,
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  dropdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  dropdownBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginRight: 4,
  },
  grayBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  grayBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },

  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    padding: 4,
    marginBottom: 24,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 20,
  },
  segmentBtnActive: {
    backgroundColor: '#0EA5E9',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#FFF',
  },

  // Chart
  chartBox: {
    backgroundColor: '#E2EEED', // very light neutral/blue according to design
    borderRadius: 20,
    padding: 16,
    paddingTop: 32,
    alignItems: 'center',
  },
  tooltipPill: {
    position: 'absolute',
    top: -12,
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  tooltipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: '100%',
    height: 120,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  barWrapper: {
    width: 24,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barFill: {
    width: 20,
    borderRadius: 10,
  },
  xAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
  },
  xAxisLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F172A',
    width: 24,
    textAlign: 'center',
  },

  // Empty Chart
  emptyChartBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
  },
  emptyChartCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  emptyChartTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  emptyChartSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  }
});
