import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { CustomButton } from '@/components/CustomButton';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { router, useFocusEffect } from 'expo-router';
import { getUserProfile } from '../../services/userService';
import { getDashboardData } from '../../services/healthService';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const colors = Colors[theme as keyof typeof Colors];

  const [hasData, setHasData] = useState(false);
  const [activeTab, setActiveTab] = useState<'Kan Şekeri' | 'Tansiyon'>('Kan Şekeri');
  const [userName, setUserName] = useState('');
  const [conditions, setConditions] = useState<string[]>([]);
  const [latestSugar, setLatestSugar] = useState<number | null>(null);
  const [latestBP, setLatestBP] = useState<{ sys: number, dia: number } | null>(null);
  const [recentSugars, setRecentSugars] = useState<any[]>([]);
  const [recentPressures, setRecentPressures] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<number>(7);
  const [showRangeModal, setShowRangeModal] = useState<boolean>(false);
  const [selectedBarId, setSelectedBarId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        try {
          const [profileRes, dashboardRes] = await Promise.all([
            getUserProfile(),
            getDashboardData(timeRange).catch(() => null)
          ]);

          if (profileRes.user) {
            if (profileRes.user.name) {
              setUserName(profileRes.user.name.split(' ')[0]);
            }
            const condString = profileRes.user.chronicConditions || 'Hiçbiri';
            const condArr = condString.split(',').map((c: string) => c.trim());
            setConditions(condArr);
            setHasData(condString !== 'Hiçbiri' && condString !== '');

            if (condArr.includes('Diyabet') && !condArr.includes('Tansiyon')) setActiveTab('Kan Şekeri');
            else if (condArr.includes('Tansiyon') && !condArr.includes('Diyabet')) setActiveTab('Tansiyon');
          }

          if (dashboardRes) {
            if (dashboardRes.latestBloodSugar) {
              setLatestSugar(dashboardRes.latestBloodSugar.glucose);
            }
            if (dashboardRes.latestBloodPressure) {
              setLatestBP({
                sys: dashboardRes.latestBloodPressure.systolic,
                dia: dashboardRes.latestBloodPressure.diastolic
              });
            }
            if (dashboardRes.recentBloodSugars) {
              setRecentSugars(dashboardRes.recentBloodSugars);
            }
            if (dashboardRes.recentBloodPressures) {
              setRecentPressures(dashboardRes.recentBloodPressures);
            }
          }
        } catch (err) {
          console.error('Failed to load data', err);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }, [timeRange])
  );

  const handleRangeSelect = (days: number) => {
    setTimeRange(days);
    setShowRangeModal(false);
    setSelectedBarId(null);
  };

  const getRangeLabel = () => {
    if (timeRange === 7) return 'Son 7 Gün';
    if (timeRange === 30) return 'Son 30 Gün';
    return 'Son 3 Ay';
  };

  const getChartData = () => {
    if (activeTab === 'Kan Şekeri') {
      return {
        data: recentSugars,
        maxValue: 250,
        getValue: (item: any) => item.glucose,
        unit: 'mg/dL',
        baseColor: '#FDA4AF',
        activeColor: '#E11D48',
      };
    } else {
      return {
        data: recentPressures,
        maxValue: 200,
        getValue: (item: any) => item.systolic,
        unit: 'mmHg',
        baseColor: '#93C5FD',
        activeColor: '#0EA5E9',
      };
    }
  };

  const chartConfig = getChartData();
  const currentChartData = chartConfig.data || [];
  const hasChartData = currentChartData.length > 0;

  const activeItem = currentChartData.find((d: any) => d.id === selectedBarId) || currentChartData[currentChartData.length - 1];

  const handleAddBloodSugar = () => {
    router.push('/add-diabetes' as any);
  };

  const handleAddBloodPressure = () => {
    router.push('/add-bloodPressure' as any);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.headerRow}>
          <View>
            <ThemedText style={styles.preTitle}>{hasData ? 'GÜNLÜK GENEL BAKIŞ' : 'Hoş Geldiniz'}</ThemedText>
            <ThemedText style={styles.title}>Günaydın,{'\n'}{userName || 'Kullanıcı'}</ThemedText>
          </View>
        </View>

        {/* METRICS CARDS */}
        {hasData ? (
          // FILLED STATE CARDS
          <View style={styles.rowCards}>
            {conditions.includes('Diyabet') && (
              <View style={[styles.filledCard, { marginRight: conditions.includes('Tansiyon') ? 8 : 0 }]}>
                <View style={styles.iconRedCircle}>
                  <Ionicons name="water-outline" size={18} color="#E11D48" />
                </View>
                <ThemedText style={styles.cardLabel}>Son Kan{'\n'}Şekeri</ThemedText>
                <View style={styles.valueRow}>
                  <ThemedText style={styles.cardValue}>{latestSugar !== null ? latestSugar : '--'}</ThemedText>
                </View>
                {latestSugar !== null && <ThemedText style={styles.cardUnit}>mg/dL</ThemedText>}
              </View>
            )}

            {conditions.includes('Tansiyon') && (
              <View style={[styles.filledCard, { marginLeft: conditions.includes('Diyabet') ? 8 : 0 }]}>
                <View style={styles.iconBlueCircle}>
                  <FontAwesome5 name="wave-square" size={14} color="#0EA5E9" />
                </View>
                <ThemedText style={styles.cardLabel}>Son Tansiyon</ThemedText>
                <View style={styles.valueRow}>
                  <ThemedText style={styles.cardValue}>{latestBP ? `${latestBP.sys}/${latestBP.dia}` : '--/--'}</ThemedText>
                </View>
                {latestBP && <ThemedText style={styles.cardUnit}>mmHg</ThemedText>}
              </View>
            )}
          </View>
        ) : (
          // EMPTY STATE CARDS
          <View style={styles.colCards}>
            <View style={styles.emptyCard}>
              <View style={styles.emptyCardHeader}>
                <View style={styles.iconBlueCircleOutline}>
                  <Ionicons name="water-outline" size={16} color="#0EA5E9" />
                </View>
                <ThemedText style={styles.emptyCardBadgeText}>GENEL SAĞLIK</ThemedText>
              </View>
              <ThemedText style={styles.emptyCardLabel}>Profilizini Düzenleyin</ThemedText>
              <ThemedText style={styles.emptyCardPlaceholder}>Onboarding tamamlandı, kronik rahatsızlık bildirmediniz. İhtiyaç durumunda profilinizi güncelleyebilirsiniz.</ThemedText>
            </View>
          </View>
        )}

        {/* ANALYSIS SECTION */}
        <View style={styles.analysisSection}>
          <View style={styles.analysisHeader}>
            <ThemedText style={styles.analysisTitle}>Sağlık Analizi</ThemedText>
            {hasData ? (
              <TouchableOpacity style={styles.dropdownBadge} activeOpacity={0.7} onPress={() => setShowRangeModal(true)}>
                <ThemedText style={styles.dropdownBadgeText}>{getRangeLabel()}</ThemedText>
                <Ionicons name="chevron-down" size={12} color="#4B5563" />
              </TouchableOpacity>
            ) : (
              <View style={styles.grayBadge}>
                <ThemedText style={styles.grayBadgeText}>Haftalık</ThemedText>
              </View>
            )}
          </View>

          {hasData && conditions.includes('Diyabet') && conditions.includes('Tansiyon') && (
            <View style={styles.segmentContainer}>
              <TouchableOpacity
                style={[styles.segmentBtn, activeTab === 'Kan Şekeri' && styles.segmentBtnActive]}
                onPress={() => { setActiveTab('Kan Şekeri'); setSelectedBarId(null); }}
                activeOpacity={0.8}
              >
                <ThemedText style={[styles.segmentText, activeTab === 'Kan Şekeri' && styles.segmentTextActive]}>
                  Kan Şekeri
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segmentBtn, activeTab === 'Tansiyon' && styles.segmentBtnActive]}
                onPress={() => { setActiveTab('Tansiyon'); setSelectedBarId(null); }}
                activeOpacity={0.8}
              >
                <ThemedText style={[styles.segmentText, activeTab === 'Tansiyon' && styles.segmentTextActive]}>
                  Tansiyon
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {hasChartData ? (
            <View style={styles.chartBox}>
              <View style={[styles.tooltipPill, { backgroundColor: chartConfig.activeColor }]}>
                {activeItem ? (
                  <ThemedText style={styles.tooltipText}>{chartConfig.getValue(activeItem)} {chartConfig.unit}</ThemedText>
                ) : (
                  <ThemedText style={styles.tooltipText}>Seçim Yapın</ThemedText>
                )}
              </View>
              {/* Dynamic Bar Chart */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'flex-end', paddingBottom: 16 }}>
                <View style={[styles.barsRow, { width: undefined, justifyContent: 'flex-start' }]}>
                  {currentChartData.map((item, index) => {
                    const val = chartConfig.getValue(item);
                    const maxVal = Math.max(...currentChartData.map((d: any) => chartConfig.getValue(d)), chartConfig.maxValue);
                    const heightPct = Math.max(Math.min((val / maxVal) * 100, 100), 5);
                    const isSelected = selectedBarId ? item.id === selectedBarId : index === currentChartData.length - 1;

                    return (
                      <TouchableOpacity
                        key={item.id || index}
                        style={[styles.barWrapper, { marginHorizontal: 6, width: 24 }]}
                        activeOpacity={0.7}
                        onPress={() => setSelectedBarId(item.id)}
                      >
                        <View style={[
                          styles.barFill,
                          { height: `${heightPct}%`, backgroundColor: isSelected ? chartConfig.activeColor : chartConfig.baseColor }
                        ]} />
                        <ThemedText style={[styles.xAxisLabel, { fontSize: 9, marginTop: 8, transform: [{ rotate: '-45deg' }] }]}>
                          {new Date(item.measuredAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })}
                        </ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          ) : (
            <View style={styles.emptyChartBox}>
              <View style={styles.emptyChartCircle}>
                <Ionicons name="bar-chart-outline" size={32} color="#CBD5E1" />
              </View>
              <ThemedText style={styles.emptyChartTitle}>Henüz {activeTab} verisi bulunamadı</ThemedText>
              <ThemedText style={styles.emptyChartSubtitle}>
                Alt kısımdaki ekle butonuyla ilk ölçümünüzü sisteme girebilirsiniz.
              </ThemedText>
            </View>
          )}
        </View>

        <View style={{ flex: 1, minHeight: 40 }} />

        {/* BOTTOM BUTTONS */}
        {conditions.includes('Diyabet') && (
          <CustomButton
            title="Kan Şekeri Ekle"
            onPress={handleAddBloodSugar}
            style={{ marginBottom: 12 }}
            leftIcon={<Ionicons name="add" size={20} color="#FFF" style={{ marginRight: 6 }} />}
          />
        )}

        {conditions.includes('Tansiyon') && (
          <CustomButton
            title="Tansiyon Ekle"
            onPress={handleAddBloodPressure}
            style={{ backgroundColor: conditions.includes('Diyabet') ? '#E2E8F0' : '#0EA5E9', borderColor: 'transparent' }}
            textStyle={{ color: conditions.includes('Diyabet') ? '#0F172A' : '#FFF' }}
            leftIcon={<Ionicons name="add" size={20} color={conditions.includes('Diyabet') ? '#0F172A' : '#FFF'} style={{ marginRight: 6 }} />}
          />
        )}

      </ScrollView>

      {/* Select Option Modal */}
      <Modal visible={showRangeModal} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowRangeModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <ThemedText style={styles.modalTitle}>Zaman Aralığı Seçin</ThemedText>

                <TouchableOpacity style={styles.modalOption} onPress={() => handleRangeSelect(7)}>
                  <ThemedText style={[styles.modalOptionText, timeRange === 7 && styles.modalOptionActive]}>Son 7 Gün</ThemedText>
                  {timeRange === 7 && <Ionicons name="checkmark" size={20} color="#0EA5E9" />}
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalOption} onPress={() => handleRangeSelect(30)}>
                  <ThemedText style={[styles.modalOptionText, timeRange === 30 && styles.modalOptionActive]}>Son 30 Gün</ThemedText>
                  {timeRange === 30 && <Ionicons name="checkmark" size={20} color="#0EA5E9" />}
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalOption} onPress={() => handleRangeSelect(90)}>
                  <ThemedText style={[styles.modalOptionText, timeRange === 90 && styles.modalOptionActive]}>Son 3 Ay</ThemedText>
                  {timeRange === 90 && <Ionicons name="checkmark" size={20} color="#0EA5E9" />}
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

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
    lineHeight: 34,
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
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 48,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#475569',
  },
  modalOptionActive: {
    color: '#0EA5E9',
    fontWeight: '600',
  }
});
