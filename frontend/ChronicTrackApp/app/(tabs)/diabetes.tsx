import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AnalysisView from '@/components/AnalysisView';

const MOCK_DATA = [
  {
    id: '1',
    dateGroup: 'Bugün, 24 Ekim',
    items: [
      { id: '1-1', title: 'Kahvaltı Öncesi', time: '08:30', value: '95', unit: 'MG/DL', type: 'normal', icon: 'moon', iconFam: 'Ionicons' },
      { id: '1-2', title: 'Öğle Yemeği Sonrası', time: '14:15', value: '142', unit: 'MG/DL', type: 'high', icon: 'silverware-fork-knife', iconFam: 'MaterialCommunityIcons' },
      { id: '1-3', title: 'Egzersiz Sonrası', time: '17:45', value: '110', unit: 'MG/DL', type: 'normal', icon: 'barbell', iconFam: 'Ionicons' },
    ]
  },
  {
    id: '2',
    dateGroup: 'Dün, 23 Ekim',
    items: [
      { id: '2-1', title: 'Yatmadan Önce', time: '22:45', value: '102', unit: 'MG/DL', type: 'neutral', icon: 'moon', iconFam: 'Ionicons' },
    ]
  }
];

export default function DiabetesListScreen() {
  const [activeTab, setActiveTab] = useState<'Liste' | 'Analiz'>('Liste');

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
            <ThemedText style={styles.summaryValue}>104</ThemedText>
            <ThemedText style={styles.summaryUnit}>mg/dL</ThemedText>
          </View>

          <View style={styles.summaryFooter}>
            <View style={styles.pillNormal}>
              <ThemedText style={styles.pillNormalText}>Normal{'\n'}Aralık</ThemedText>
            </View>
            <View style={styles.trendInfo}>
              <Ionicons name="trending-down" size={14} color="#FFF" style={{ marginRight: 4, marginTop: 2 }} />
              <ThemedText style={styles.trendText}>dünden bu yana{'\n'}-4%</ThemedText>
            </View>
          </View>
        </View>

        {/* List Section */}
        {MOCK_DATA.map((group) => (
          <View key={group.id} style={styles.groupContainer}>
            <ThemedText style={styles.groupTitle}>{group.dateGroup}</ThemedText>

            {group.items.map((item) => {
              const valColor = item.type === 'high' ? '#DC2626' : item.type === 'normal' ? '#0284C7' : '#475569';

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
    lineHeight: 14,
  },
  trendInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  trendText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '500',
    lineHeight: 14,
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
  },
  itemUnit: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
  }
});
