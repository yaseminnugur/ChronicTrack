import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import AnalysisView from '@/components/AnalysisView';

const MOCK_DATA = [
  {
    id: '1',
    dateGroup: 'Bugün, 24 Ekim',
    items: [
      { id: '1-1', title: 'Sabah Ölçümü', time: '08:45', value: '125/82', detail: 'Hafif Yüksek', type: 'high', icon: 'heart' },
      { id: '1-2', title: 'Öğle Ölçümü', time: '14:20', value: '118/76', detail: 'Normal', type: 'normal', icon: 'heart' },
    ]
  },
  {
    id: '2',
    dateGroup: 'Dün, 23 Ekim',
    items: [
      { id: '2-1', title: 'Akşam Ölçümü', time: '21:45', value: '115/72', detail: 'Normal', type: 'normal', icon: 'moon' },
      { id: '2-2', title: 'Sabah Ölçümü', time: '08:00', value: '138/88', detail: 'Yüksek', type: 'danger', icon: 'heart' },
    ]
  }
];

export default function BloodPressureListScreen() {
  const [activeTab, setActiveTab] = useState<'Liste' | 'Analiz'>('Liste');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>

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

        {activeTab === 'Liste' ? (
          <View>
            {/* Big Summary Card (Adapted uniformly for BP) */}
            <View style={[styles.summaryCard, { backgroundColor: '#E11D48', shadowColor: '#E11D48' }]}>
          <ThemedText style={styles.summaryTitle}>Bugünkü Ortalama</ThemedText>
          <View style={styles.summaryValueRow}>
            <ThemedText style={styles.summaryValue}>118/76</ThemedText>
            <ThemedText style={styles.summaryUnit}>mmHg</ThemedText>
          </View>

          <View style={styles.summaryFooter}>
            <View style={styles.pillNormal}>
              <ThemedText style={styles.pillNormalText}>İdeal{'\n'}Aralık</ThemedText>
            </View>
            <View style={styles.trendInfo}>
              <Ionicons name="pulse" size={16} color="#FFF" style={{ marginRight: 6, marginTop: 2 }} />
              <ThemedText style={styles.trendText}>Nabız{'\n'}72 BPM</ThemedText>
            </View>
          </View>
        </View>

        {/* List Section */}
        {MOCK_DATA.map((group) => (
          <View key={group.id} style={styles.groupContainer}>
            <ThemedText style={styles.groupTitle}>{group.dateGroup}</ThemedText>

            {group.items.map((item) => {
              const valColor = item.type === 'danger' ? '#DC2626' : item.type === 'high' ? '#EA580C' : '#0F172A';
              const dotColor = item.type === 'danger' ? '#DC2626' : item.type === 'high' ? '#EA580C' : '#10B981';

              return (
                <View key={item.id} style={styles.listItem}>
                  <View style={styles.itemLeft}>
                    <View style={styles.iconCircle}>
                      <FontAwesome5 name={item.icon as any} size={16} color="#475569" />
                    </View>
                    <View>
                      <ThemedText style={styles.itemTitle}>{item.title}</ThemedText>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
                        <ThemedText style={styles.itemTime}>{item.time}  •  {item.detail}</ThemedText>
                      </View>
                    </View>
                  </View>

                  <View style={styles.itemRight}>
                    <ThemedText style={[styles.itemValue, { color: valColor }]}>{item.value}</ThemedText>
                    <ThemedText style={styles.itemUnit}>mmHg</ThemedText>
                  </View>
                </View>
              );
            })}
          </View>
        ))}
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
  summaryCard: {
    backgroundColor: '#E11D48',
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#E11D48',
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
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
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
  }
});
