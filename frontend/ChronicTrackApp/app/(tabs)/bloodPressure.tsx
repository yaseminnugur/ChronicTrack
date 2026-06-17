import React, { useState, useMemo } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useColors } from '@/context/ThemeContext';
import type { ColorPalette } from '@/constants/theme';
import { router, useFocusEffect } from 'expo-router';
import AnalysisView from '@/components/AnalysisView';
import { getBloodPressureStatus } from '../../utils/healthStatusUtils';
import { getBloodPressures } from '../../services/healthService';
import { getUserProfile } from '../../services/userService';
import { getAnalysis } from '../../services/aiAnalysisService';
import DateRangePicker from '@/components/DateRangePicker';

export default function BloodPressureListScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [activeTab, setActiveTab] = useState<'Liste' | 'Analiz'>('Liste');
  const [records, setRecords] = useState<any[]>([]);
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
            getBloodPressures(dateRange),
            getUserProfile()
          ]);

          let allRecords = data || [];

          if (profile?.user?.onboardingData?.bloodPressureData) {
            const onboardingTs = new Date(profile.user.onboardingData.createdAt || profile.user.createdAt).getTime();
            const startTs = dateRange.startDate ? new Date(dateRange.startDate).getTime() : -Infinity;
            const endTs = dateRange.endDate ? new Date(dateRange.endDate).getTime() : Infinity;

            if (onboardingTs >= startTs && onboardingTs <= endTs) {
              const onboardingRecords = profile.user.onboardingData.bloodPressureData.map((bp: any, idx: number) => ({
                id: `onboarding-${idx}`,
                systolic: bp.sis,
                diastolic: bp.dia,
                pulse: bp.pulse,
                measuredAt: profile.user.onboardingData.createdAt || profile.user.createdAt,
                notes: `İlk Kayıt (Set ${idx + 1})`
              }));
              allRecords = [...allRecords, ...onboardingRecords];
            }
          }

          allRecords.sort((a: any, b: any) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime());

          setRecords(allRecords);
          setDataVersion((v) => v + 1);

          getAnalysis('BLOOD_PRESSURE')
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

    // Tarih filtresi varsa ortalama tüm görünür kayıtlar üzerinden.
    let summarySysSum = 0;
    let summaryDiaSum = 0;
    let summaryCount = 0;

    records.forEach((item) => {
      const d = new Date(item.measuredAt);
      const dateStr = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });

      const sys = Number(item.systolic);
      const dia = Number(item.diastolic);

      let dateGroup = dateStr;
      const isToday = d.toDateString() === today.toDateString();
      if (isToday) {
        dateGroup = 'Bugün, ' + dateStr;
      }
      else if (d.toDateString() === yesterday.toDateString()) {
        dateGroup = 'Dün, ' + dateStr;
      }

      if (isFiltered || isToday) {
        summarySysSum += sys;
        summaryDiaSum += dia;
        summaryCount++;
      }

      if (!groups[dateGroup]) groups[dateGroup] = [];

      const timeStr = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      let type = 'normal';
      const bpStatus = getBloodPressureStatus(sys, dia);

      groups[dateGroup].push({
        id: item.id,
        title: item.notes || 'Ölçüm',
        time: timeStr,
        value: `${item.systolic}/${item.diastolic}`,
        detail: bpStatus.label,
        type: type,
        icon: 'heart',
        status: bpStatus,
      });
    });

    const avgSys = summaryCount > 0 ? Math.round(summarySysSum / summaryCount) : null;
    const avgDia = summaryCount > 0 ? Math.round(summaryDiaSum / summaryCount) : null;

    const formattedGroups = Object.keys(groups).map((key, index) => ({
      id: index.toString(),
      dateGroup: key,
      items: groups[key]
    }));

    return { formattedGroups, avgSys, avgDia, summaryCount };
  };

  const { formattedGroups, avgSys, avgDia, summaryCount } = groupData();

  const avgStatus = avgSys !== null && avgDia !== null
    ? getBloodPressureStatus(avgSys, avgDia)
    : null;
  const summaryCardColor = avgStatus?.color || colors.textTertiary;
  const summaryTitle = isFiltered ? 'Seçilen Aralık Ortalaması' : 'Bugünkü Ortalama';
  const summaryEmptyMessage = isFiltered ? 'Bu aralıkta kayıt yok' : 'Bugün Kayıt Yok';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.preTitle}>İZLEME</ThemedText>
          <ThemedText style={styles.title}>Tansiyon</ThemedText>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: '#E11D48', shadowColor: '#E11D48' }]}
          activeOpacity={0.8}
          onPress={() => router.push('/add-bloodPressure')}
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
            <ThemedText style={[styles.segmentText, activeTab === 'Liste' && { color: '#E11D48', fontWeight: '700' }]}>
              Liste
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'Analiz' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('Analiz')}
            activeOpacity={0.8}
          >
            <ThemedText style={[styles.segmentText, activeTab === 'Analiz' && { color: '#E11D48', fontWeight: '700' }]}>
              Analiz
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Tarih Filtresi */}
        {activeTab === 'Liste' && (
          <View style={{ paddingHorizontal: 4 }}>
            <DateRangePicker
              themeColor="#E11D48"
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
            <View style={[styles.summaryCard, { backgroundColor: summaryCardColor, shadowColor: summaryCardColor }]}>
              <ThemedText style={styles.summaryTitle}>
                {summaryTitle}
                {isFiltered && summaryCount > 0 ? ` · ${summaryCount} ölçüm` : ''}
              </ThemedText>
              <View style={styles.summaryValueRow}>
                <ThemedText style={styles.summaryValue}>{avgSys !== null ? `${avgSys}/${avgDia}` : '--/--'}</ThemedText>
                <ThemedText style={styles.summaryUnit}>mmHg</ThemedText>
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

            {formattedGroups.length > 0 ? (
              formattedGroups.map((group) => (
                <View key={group.id} style={styles.groupContainer}>
                  <ThemedText style={styles.groupTitle}>{group.dateGroup}</ThemedText>

                  {group.items.map((item: any) => {
                    return (
                      <View key={item.id} style={styles.listItem}>
                        <View style={styles.itemLeft}>
                          <View style={[styles.iconCircle, { borderWidth: 1.5, borderColor: item.status.bgColor }]}>
                            <FontAwesome5 name={item.icon as any} size={16} color={item.status.color} />
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
                          <ThemedText style={styles.itemUnit}>mmHg</ThemedText>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ))
            ) : (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <Ionicons name="pulse" size={48} color={colors.borderStrong} style={{ marginBottom: 16 }} />
                <ThemedText style={{ fontSize: 16, fontWeight: '700', color: colors.textTertiary }}>Henüz kayıt bulunamadı.</ThemedText>
                <ThemedText style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>İlk ölçümünüzü girmek için + butonuna tıklayın.</ThemedText>
              </View>
            )}
          </View>
        ) : (
          <AnalysisView analysisType="BLOOD_PRESSURE" dataVersion={dataVersion} />
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
    backgroundColor: '#E11D48',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E11D48',
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
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
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
  pillStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: c.surfaceMuted,
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: '#E11D48',
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
