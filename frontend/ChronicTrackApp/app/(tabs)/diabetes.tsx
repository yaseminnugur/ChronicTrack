import React, { useState, useMemo } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, FlatList, Modal, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/context/ThemeContext';
import type { ColorPalette } from '@/constants/theme';
import { router, useFocusEffect } from 'expo-router';
import AnalysisView from '@/components/AnalysisView';
import { getHbA1cStatus, getBloodSugarStatus } from '../../utils/healthStatusUtils';
import { getBloodSugars } from '../../services/healthService';
import { getUserProfile } from '../../services/userService';
import { getAnalysis } from '../../services/aiAnalysisService';
import DateRangePicker from '@/components/DateRangePicker';

export default function DiabetesListScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [activeTab, setActiveTab] = useState<'Liste' | 'Analiz'>('Liste');
  const [records, setRecords] = useState<any[]>([]);
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ startDate?: string, endDate?: string }>({});
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  // AnalysisView'ı yeniden tetiklemek için sayaç. Her odak/yenileme sonrası bumplar.
  const [dataVersion, setDataVersion] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      const fetchRecords = async () => {
        try {
          const [data, profile] = await Promise.all([
            getBloodSugars(dateRange),
            getUserProfile()
          ]);
          setRecords(data || []);
          if (profile?.user?.onboardingData) {
            setOnboardingData(profile.user.onboardingData);
          }
          setDataVersion((v) => v + 1);

          getAnalysis('BLOOD_SUGAR')
            .then((res) => setAiSummary(res?.ai?.summary || null))
            .catch(() => setAiSummary(null));
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      fetchRecords();
    }, [dateRange])
  );

  const isFiltered = !!(dateRange.startDate || dateRange.endDate);

  const groupData = () => {
    const groups: any = {};
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Tarih filtresi varsa ortalama tüm görünür kayıtlar üzerinden (backend zaten
    // filtreyi uygulayıp gönderdi). Filtre yoksa sadece bugünün ortalaması.
    let summarySum = 0;
    let summaryCount = 0;

    records.forEach((item) => {
      const d = new Date(item.measuredAt);
      const dateStr = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });

      const glucoseVal = Number(item.glucose);

      let dateGroup = dateStr;
      const isToday = d.toDateString() === today.toDateString();
      if (isToday) {
         dateGroup = 'Bugün, ' + dateStr;
      }
      else if (d.toDateString() === yesterday.toDateString()) {
         dateGroup = 'Dün, ' + dateStr;
      }

      if (isFiltered || isToday) {
        summarySum += glucoseVal;
        summaryCount++;
      }

      if (!groups[dateGroup]) groups[dateGroup] = [];

      const timeStr = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      let type = 'normal';
      if (item.glucose > 140) type = 'high';
      else if (item.glucose < 70) type = 'danger';

      let icon = 'tint';
      let iconFam = 'FontAwesome5';
      if (item.mealState === 'Yemek Öncesi') { icon = 'silverware-fork-knife'; iconFam = 'MaterialCommunityIcons'; }
      else if (item.mealState === 'Yemek Sonrası') { icon = 'silverware-fork-knife'; iconFam = 'MaterialCommunityIcons'; }
      else if (item.mealState === 'Uyku Öncesi') { icon = 'moon'; iconFam = 'Ionicons'; }
      else if (item.mealState === 'Açlık') { icon = 'food-off'; iconFam = 'MaterialCommunityIcons'; }

      const glucoseStatus = getBloodSugarStatus(glucoseVal);

      groups[dateGroup].push({
        id: item.id,
        title: item.mealState || 'Ölçüm',
        time: timeStr,
        value: item.glucose.toString(),
        unit: 'MG/DL',
        type: type,
        icon: icon,
        iconFam: iconFam,
        status: glucoseStatus,
      });
    });

    const summaryAverage = summaryCount > 0 ? Math.round(summarySum / summaryCount) : null;

    const formattedGroups = Object.keys(groups).map((key, index) => ({
      id: index.toString(),
      dateGroup: key,
      items: groups[key]
    }));

    return { formattedGroups, summaryAverage, summaryCount };
  };

  const { formattedGroups, summaryAverage, summaryCount } = groupData();

  const avgStatus = summaryAverage !== null ? getBloodSugarStatus(summaryAverage) : null;
  const summaryCardColor = avgStatus?.color || colors.textTertiary;
  const summaryTitle = isFiltered ? 'Seçilen Aralık Ortalaması' : 'Bugünkü Ortalama';
  const summaryEmptyMessage = isFiltered ? 'Bu aralıkta kayıt yok' : 'Bugün Kayıt Yok';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.preTitle}>İZLEME</ThemedText>
          <ThemedText style={styles.title}>Kan Şekeri</ThemedText>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.8}
          onPress={() => router.push('/add-diabetes')}
        >
          <Ionicons name="add" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Segment Control */}
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'Liste' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('Liste')}
            activeOpacity={0.8}
          >
            <ThemedText style={[styles.segmentText, activeTab === 'Liste' && styles.segmentTextActive]}>
              Liste
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'Analiz' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('Analiz')}
            activeOpacity={0.8}
          >
            <ThemedText style={[styles.segmentText, activeTab === 'Analiz' && styles.segmentTextActive]}>
              Analiz
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Tarih Filtresi */}
        {activeTab === 'Liste' && (
          <View style={{ paddingHorizontal: 4 }}>
            <DateRangePicker
              themeColor="#0EA5E9"
              onApply={(startDate, endDate) => {
                setDateRange({
                  startDate: startDate ? new Date(`${startDate}T00:00:00`).toISOString() : undefined,
                  endDate: endDate ? new Date(`${endDate}T23:59:59.999`).toISOString() : undefined
                });
              }}
            />
          </View>
        )}

        {activeTab === 'Liste' ? (
          <View>
            {/* Big Summary Card */}
            <View style={[styles.summaryCard, { backgroundColor: summaryCardColor, shadowColor: summaryCardColor }]}>
              <ThemedText style={styles.summaryTitle}>
                {summaryTitle}
                {isFiltered && summaryCount > 0 ? ` · ${summaryCount} ölçüm` : ''}
              </ThemedText>
              <View style={styles.summaryValueRow}>
                <ThemedText style={styles.summaryValue}>{summaryAverage !== null ? summaryAverage : '--'}</ThemedText>
                <ThemedText style={styles.summaryUnit}>mg/dL</ThemedText>
              </View>

              <View style={styles.summaryFooter}>
                {avgStatus ? (
                  <View style={[styles.pillStatus, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                    <Ionicons name={avgStatus.icon as any} size={12} color="#FFF" />
                    <ThemedText style={styles.pillNormalText}>{avgStatus.label}</ThemedText>
                  </View>
                ) : (
                  <View style={styles.pillNormal}>
                    <ThemedText style={styles.pillNormalText}>{summaryEmptyMessage}</ThemedText>
                  </View>
                )}
              </View>

              {aiSummary && (
                <View style={styles.aiSummaryRow}>
                  <Ionicons name="sparkles" size={12} color="rgba(255,255,255,0.9)" style={{ marginRight: 6, marginTop: 2 }} />
                  <ThemedText style={styles.aiSummaryText} numberOfLines={3}>
                    {aiSummary}
                  </ThemedText>
                </View>
              )}
            </View>

            {/* HbA1c Card from Onboarding */}
            {onboardingData && onboardingData.hba1c && (
              <View style={styles.hba1cCard}>
                 <View style={styles.hba1cHeader}>
                    <ThemedText style={styles.hba1cLabel}>3 Aylık Şeker (HbA1c)</ThemedText>
                    {(() => {
                      const hba1cStatus = getHbA1cStatus(Number(onboardingData.hba1c));
                      return (
                        <View style={[styles.hba1cBadge, { backgroundColor: hba1cStatus.bgColor }]}>
                          <ThemedText style={[styles.hba1cBadgeText, { color: hba1cStatus.color }]}>{hba1cStatus.label}</ThemedText>
                        </View>
                      );
                    })()}
                 </View>
                 <View style={styles.hba1cValueRow}>
                    <ThemedText style={styles.hba1cValue}>{onboardingData.hba1c}</ThemedText>
                    <ThemedText style={styles.hba1cUnit}>%</ThemedText>
                 </View>
                 {onboardingData.diabetesType && (
                   <ThemedText style={styles.hba1cTypeText}>
                     Diyabet Tipi: <ThemedText style={styles.hba1cTypeValue}>{onboardingData.diabetesType}</ThemedText>
                   </ThemedText>
                 )}
              </View>
            )}

            {/* List Section */}
            {formattedGroups.length > 0 ? (
              formattedGroups.map((group) => (
                <View key={group.id} style={styles.groupContainer}>
                  <ThemedText style={styles.groupTitle}>{group.dateGroup}</ThemedText>

                  {group.items.map((item: any) => {
                    const valColor = item.type === 'high' ? '#DC2626' : item.type === 'danger' ? '#991B1B' : '#0284C7';

                    return (
                      <View key={item.id} style={styles.listItem}>
                        <View style={styles.itemLeft}>
                          <View style={[styles.iconCircle, { borderWidth: 1.5, borderColor: item.status.bgColor }]}>
                            {item.iconFam === 'Ionicons' ? (
                              <Ionicons name={item.icon as any} size={20} color={item.status.color} />
                            ) : (
                              <MaterialCommunityIcons name={item.icon as any} size={20} color={item.status.color} />
                            )}
                          </View>
                          <View>
                            <ThemedText style={styles.itemTitle}>{item.title}</ThemedText>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                              <View style={[styles.statusDot, { backgroundColor: item.status.color }]} />
                              <ThemedText style={styles.itemTime}>{item.time}  •  {item.status.label}</ThemedText>
                            </View>
                          </View>
                        </View>

                        <View style={styles.itemRight}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name={item.status.icon as any} size={16} color={item.status.color} style={{ marginRight: 4 }} />
                            <ThemedText style={[styles.itemValue, { color: item.status.color }]}>{item.value}</ThemedText>
                          </View>
                          <ThemedText style={styles.itemUnit}>{item.unit}</ThemedText>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ))
        ) : (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <Ionicons name="water-outline" size={48} color={colors.borderStrong} style={{ marginBottom: 16 }} />
            <ThemedText style={{ fontSize: 16, fontWeight: '700', color: colors.textTertiary }}>Henüz kayıt bulunamadı.</ThemedText>
            <ThemedText style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>İlk ölçümünüzü girmek için + butonuna tıklayın.</ThemedText>
          </View>
        )}
          </View>
        ) : (
          <AnalysisView analysisType="BLOOD_SUGAR" dataVersion={dataVersion} />
        )}

      </ScrollView>

    </SafeAreaView>
  );
}

const createStyles = (c: ColorPalette) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  preTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: c.textTertiary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: c.text,
    lineHeight: 36,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0EA5E9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: c.surfaceMuted,
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
    backgroundColor: c.surface,
    shadowColor: c.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: c.textTertiary,
  },
  segmentTextActive: {
    color: '#0EA5E9',
    fontWeight: '700',
  },
  summaryCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  aiSummaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.18)',
  },
  aiSummaryText: {
    flex: 1,
    color: 'rgba(255,255,255,0.95)',
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 16,
  },
  summaryTitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -1,
    lineHeight: 38,
  },
  summaryUnit: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 8,
  },
  summaryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pillNormal: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pillNormalText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
  },
  trendInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  trendText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '500',
    lineHeight: 16,
  },
  groupContainer: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: c.textSecondary,
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: c.surface,
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: c.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: c.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: c.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: c.text,
    marginBottom: 4,
  },
  itemTime: {
    fontSize: 11,
    color: c.textTertiary,
    fontWeight: '500',
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemValue: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 28,
  },
  itemUnit: {
    fontSize: 9,
    fontWeight: '700',
    color: c.textTertiary,
    marginTop: 2,
  },
  hba1cCard: {
    backgroundColor: c.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: c.border,
    shadowColor: c.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  hba1cHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  hba1cLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: c.textSecondary,
  },
  hba1cBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  hba1cBadgeText: {
    fontSize: 10,
    color: '#1D4ED8',
    fontWeight: '700',
  },
  hba1cValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  hba1cValue: {
    fontSize: 36,
    fontWeight: '800',
    color: c.text,
    lineHeight: 42,
  },
  hba1cUnit: {
    fontSize: 14,
    fontWeight: '600',
    color: c.textTertiary,
    marginLeft: 8,
  },
  hba1cTypeText: {
    fontSize: 13,
    color: c.textSecondary,
    marginTop: 8,
  },
  hba1cTypeValue: {
    fontWeight: '700',
    color: c.text,
  },
  pillStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: c.surfaceMuted,
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: '#0EA5E9',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: c.textTertiary,
  },
  filterPillTextActive: {
    color: '#FFF',
  },
});
