import React, { useMemo } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useColors } from '@/context/ThemeContext';
import type { ColorPalette } from '@/constants/theme';
import { router } from 'expo-router';

export default function AddMeasurementScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
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

const createStyles = (c: ColorPalette) => StyleSheet.create({
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
    color: c.text,
    marginBottom: 12,
    paddingTop: 8,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 14,
    color: c.textSecondary,
    lineHeight: 22,
    fontWeight: '500',
  },
  card: {
    backgroundColor: c.surface,
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: c.shadow,
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
    color: c.text,
    marginBottom: 12,
    width: '85%',
  },
  cardSubtitle: {
    fontSize: 13,
    color: c.textSecondary,
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
