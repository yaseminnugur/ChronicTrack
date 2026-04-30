import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import AnalysisView from '@/components/AnalysisView';
import { getBloodSugars } from '../../services/healthService';
import { getUserProfile } from '../../services/userService';

export default function DiabetesListScreen() {
  const [activeTab, setActiveTab] = useState<'Liste' | 'Analiz'>('Liste');
  const [records, setRecords] = useState<any[]>([]);
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const fetchRecords = async () => {
        try {
          const [data, profile] = await Promise.all([
            getBloodSugars(),
            getUserProfile()
          ]);
          setRecords(data || []);
          if (profile?.user?.onboardingData) {
            setOnboardingData(profile.user.onboardingData);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      fetchRecords();
    }, [])
  );

  const groupData = () => {
    const groups: any = {};
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let todaySum = 0;
    let todayCount = 0;

    records.forEach((item) => {
      const d = new Date(item.measuredAt);
      const dateStr = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
      
      const glucoseVal = Number(item.glucose);

      let dateGroup = dateStr;
      if (d.toDateString() === today.toDateString()) {
         dateGroup = 'Bugün, ' + dateStr;
         todaySum += glucoseVal;
         todayCount++;
      }
      else if (d.toDateString() === yesterday.toDateString()) {
         dateGroup = 'Dün, ' + dateStr;
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
      
      groups[dateGroup].push({
        id: item.id,
        title: item.mealState || 'Ölçüm',
        time: timeStr,
        value: item.glucose.toString(),
        unit: 'MG/DL',
        type: type,
        icon: icon,
        iconFam: iconFam
      });
    });

    const averageToday = todayCount > 0 ? Math.round(todaySum / todayCount) : null;
    
    const formattedGroups = Object.keys(groups).map((key, index) => ({
      id: index.toString(),
      dateGroup: key,
      items: groups[key]
    }));

    return { formattedGroups, averageToday };
  };

  const { formattedGroups, averageToday } = groupData();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>

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

        {activeTab === 'Liste' ? (
          <View>
            {/* Big Summary Card */}
            <View style={styles.summaryCard}>
              <ThemedText style={styles.summaryTitle}>Bugünkü Ortalama</ThemedText>
              <View style={styles.summaryValueRow}>
                <ThemedText style={styles.summaryValue}>{averageToday !== null ? averageToday : '--'}</ThemedText>
                <ThemedText style={styles.summaryUnit}>mg/dL</ThemedText>
              </View>

              <View style={styles.summaryFooter}>
                <View style={styles.pillNormal}>
                  <ThemedText style={styles.pillNormalText}>Bugün {averageToday ? 'Kayıt Var' : 'Kayıt Yok'}</ThemedText>
                </View>
              </View>
            </View>

            {/* HbA1c Card from Onboarding */}
            {onboardingData && onboardingData.hba1c && (
              <View style={styles.hba1cCard}>
                 <View style={styles.hba1cHeader}>
                    <ThemedText style={styles.hba1cLabel}>3 Aylık Şeker (HbA1c)</ThemedText>
                    <View style={styles.hba1cBadge}>
                      <ThemedText style={styles.hba1cBadgeText}>İlk Kayıt Verisi</ThemedText>
                    </View>
                 </View>
                 <View style={styles.hba1cValueRow}>
                    <ThemedText style={styles.hba1cValue}>{onboardingData.hba1c}</ThemedText>
                    <ThemedText style={styles.hba1cUnit}>mg/dL</ThemedText>
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
                          <View style={styles.iconCircle}>
                            {item.iconFam === 'Ionicons' ? (
                              <Ionicons name={item.icon as any} size={20} color={valColor} />
                            ) : (
                              <MaterialCommunityIcons name={item.icon as any} size={20} color={valColor} />
                            )}
                          </View>
                          <View>
                            <ThemedText style={styles.itemTitle}>{item.title}</ThemedText>
                            <ThemedText style={styles.itemTime}>{item.time}</ThemedText>
                          </View>
                        </View>

                        <View style={styles.itemRight}>
                          <ThemedText style={[styles.itemValue, { color: valColor }]}>{item.value}</ThemedText>
                          <ThemedText style={styles.itemUnit}>{item.unit}</ThemedText>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ))
        ) : (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <Ionicons name="water-outline" size={48} color="#CBD5E1" style={{ marginBottom: 16 }} />
            <ThemedText style={{ fontSize: 16, fontWeight: '700', color: '#64748B' }}>Henüz kayıt bulunamadı.</ThemedText>
            <ThemedText style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>İlk ölçümünüzü girmek için + butonuna tıklayın.</ThemedText>
          </View>
        )}
          </View>
        ) : (
          <AnalysisView />
        )}

      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
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
    backgroundColor: '#F1F5F9',
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
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#0EA5E9',
    fontWeight: '700',
  },
  summaryCard: {
    backgroundColor: '#0EA5E9',
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
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
    color: '#334155',
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
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
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  itemTime: {
    fontSize: 11,
    color: '#64748B',
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
    color: '#64748B',
    marginTop: 2,
  },
  hba1cCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
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
    color: '#475569',
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
    color: '#0F172A',
    lineHeight: 42,
  },
  hba1cUnit: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 8,
  },
  hba1cTypeText: {
    fontSize: 13,
    color: '#475569',
    marginTop: 8,
  },
  hba1cTypeValue: {
    fontWeight: '700',
    color: '#1E293B',
  }
});
