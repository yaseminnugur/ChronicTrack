import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function AddMeasurementScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.pageHeader}>
          <ThemedText style={styles.pageTitle}>Ölçüm Ekle</ThemedText>
          <ThemedText style={styles.pageSubtitle}>
            Kaydetmek istediğiniz ölçüm türünü seçin. Düzenli takip, sağlığınızı daha iyi yönetmenize yardımcı olur.
          </ThemedText>
        </View>

        {/* GLUCOSE CARD */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => router.push('/add-diabetes')}
        >
          {/* Decorative Background Blob */}
          <View style={[styles.blob, { backgroundColor: '#F0F9FF' }]} />

          <View style={[styles.iconCircle, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="water" size={20} color="#1D4ED8" />
          </View>

          <ThemedText style={styles.cardTitle}>Kan Şekeri Ölçümü Ekle</ThemedText>

          <ThemedText style={styles.cardSubtitle}>
            Metabolik eğilimleri takip etmek için yemeklerden önce veya sonra glikoz seviyelerini kaydedin.
          </ThemedText>

          <View style={styles.linkRow}>
            <ThemedText style={[styles.linkText, { color: '#2563EB' }]}>Glikoz Kaydet</ThemedText>
            <Ionicons name="arrow-forward" size={16} color="#2563EB" style={{ marginLeft: 4 }} />
          </View>
        </TouchableOpacity>

        {/* BLOOD PRESSURE CARD */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => router.push('/add-bloodPressure')}
        >
          {/* Decorative Background Blob */}
          <View style={[styles.blob, { backgroundColor: '#FFF1F2' }]} />

          <View style={[styles.iconCircle, { backgroundColor: '#FCE7F3' }]}>
            <FontAwesome5 name="heartbeat" size={18} color="#BE123C" />
          </View>

          <ThemedText style={styles.cardTitle}>Tansiyon Ölçümü Ekle</ThemedText>

          <ThemedText style={styles.cardSubtitle}>
            Kardiyovasküler sağlığı korumak için sistolik ve diyastolik değerleri takip edin.
          </ThemedText>

          <View style={styles.linkRow}>
            <ThemedText style={[styles.linkText, { color: '#E11D48' }]}>Basınç Günlüğü</ThemedText>
            <Ionicons name="arrow-forward" size={16} color="#E11D48" style={{ marginLeft: 4 }} />
          </View>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    flexGrow: 1,
  },
  pageHeader: {
    marginBottom: 32,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    paddingTop: 8,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 15,
    elevation: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  blob: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
    width: '85%',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 24,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    fontWeight: '700',
  }
});
