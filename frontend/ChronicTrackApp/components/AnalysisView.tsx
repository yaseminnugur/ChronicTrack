import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/context/ThemeContext';
import type { ColorPalette } from '@/constants/theme';

export default function AnalysisView() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>

      {/* Genel Sağlık Riski Card */}
      <View style={styles.riskCard}>
        <View style={styles.riskHeader}>
          <ThemedText style={styles.riskPreTitle}>GENEL SAĞLIK RİSKİ</ThemedText>
          <View style={styles.aiBadge}>
            <ThemedText style={styles.aiBadgeText}>Yapay Zeka Onaylı</ThemedText>
          </View>
        </View>

        <View style={styles.riskLevelRow}>
          <ThemedText style={styles.riskLevelText}>Orta</ThemedText>
          <View style={styles.riskDot} />
        </View>

        <ThemedText style={styles.riskDescription}>
          Son 72 saatteki kardiyovasküler telemetriniz ve uyku düzeninize dayanarak, dinlenme kalp hızı değişkenliğinde hafif bir artış tespit ettik.
        </ThemedText>

        <View style={styles.miniCardsRow}>
          <View style={styles.miniCard}>
            <FontAwesome5 name="heartbeat" size={16} color="#0284C7" style={{ marginBottom: 8 }} />
            <ThemedText style={styles.miniCardValue}>78 bpm</ThemedText>
            <ThemedText style={styles.miniCardLabel}>Ort.{'\n'}Dinlenme</ThemedText>
          </View>
          <View style={styles.miniCard}>
            <MaterialCommunityIcons name="asterisk" size={20} color="#E11D48" style={{ marginBottom: 4 }} />
            <ThemedText style={styles.miniCardValue}>Yüksek</ThemedText>
            <ThemedText style={styles.miniCardLabel}>Stres{'\n'}Seviyesi</ThemedText>
          </View>
        </View>
      </View>

      <ThemedText style={styles.sectionTitle}>YZ Önerileri</ThemedText>

      {/* Rec 1 */}
      <View style={styles.recCard}>
        <View style={[styles.recIconCircle, { backgroundColor: '#E0F2FE' }]}>
          <Ionicons name="water" size={20} color="#0284C7" />
        </View>
        <View style={styles.recContent}>
          <ThemedText style={styles.recTitle}>Hidrasyonu Artırın</ThemedText>
          <ThemedText style={styles.recDesc}>
            Kan viskozite belirteçleri, kalp yükünü azaltmak için bugün fazladan 500 ml su tüketilmesini öneriyor.
          </ThemedText>
        </View>
      </View>

      {/* Rec 2 */}
      <View style={styles.recCard}>
        <View style={[styles.recIconCircle, { backgroundColor: '#DBEAFE' }]}>
          <Ionicons name="moon" size={20} color="#1E3A8A" />
        </View>
        <View style={styles.recContent}>
          <ThemedText style={styles.recTitle}>Erken Uyuyun</ThemedText>
          <ThemedText style={styles.recDesc}>
            Bu gece 8 saat uyumayı hedefleyin. Toparlanma puanınız şu anda haftalık temel değerinizin %15 altındadır.
          </ThemedText>
        </View>
      </View>

      {/* Rec 3 */}
      <View style={styles.recCard}>
        <View style={[styles.recIconCircle, { backgroundColor: colors.iconCircleBg }]}>
          <FontAwesome5 name="spa" size={16} color={colors.text} />
        </View>
        <View style={styles.recContent}>
          <ThemedText style={styles.recTitle}>Rehberli Nefes</ThemedText>
          <ThemedText style={styles.recDesc}>
            Kortizol seviyelerini dengelemek için saat 14:00'den önce 5 dakikalık uyumlu nefes seansı önerilir.
          </ThemedText>
        </View>
      </View>

      {/* Alert Card */}
      <View style={styles.alertCard}>
        <View style={styles.alertLeftColorBar} />
        <View style={styles.alertIconCol}>
          <Ionicons name="warning" size={24} color="#7F1D1D" />
        </View>
        <View style={styles.alertContent}>
          <ThemedText style={styles.alertTitle}>Potansiyel Dehidrasyon Uyarısı</ThemedText>
          <ThemedText style={styles.alertDesc}>
            Analizimiz, yüksek aktivite seviyeleriniz ile azalan metabolik nem seviyeleri arasında bir korelasyon göstermektedir. Halsizlik devam ederse lütfen doktorunuza danışın.
          </ThemedText>
        </View>
      </View>

      {/* Accuracy Card */}
      <View style={styles.accuracyCard}>
        <ThemedText style={styles.accuracyPreTitle}>ANALİZ HASSASİYETİ</ThemedText>
        <ThemedText style={styles.accuracyTitle}>%98.4 Güven Aralığı</ThemedText>
        <ThemedText style={styles.accuracyDesc}>
          Veriler, 6 aylık tarihsel sağlık eğiliminizle çapraz referanslanmıştır.
        </ThemedText>
      </View>

    </View>
  );
}

const createStyles = (c: ColorPalette) => StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  riskCard: {
    backgroundColor: c.surfaceMuted,
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  riskPreTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: c.textSecondary,
    letterSpacing: 1,
    lineHeight: 16,
    width: '40%',
  },
  aiBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E3A8A',
    lineHeight: 14,
  },
  riskLevelRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  riskLevelText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#0284C7',
    lineHeight: 56,
  },
  riskDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F43F5E',
    marginLeft: 8,
    marginBottom: 14,
  },
  riskDescription: {
    fontSize: 13,
    color: c.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  miniCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  miniCard: {
    flex: 1,
    backgroundColor: c.surface,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
  },
  miniCardValue: {
    fontSize: 14,
    fontWeight: '800',
    color: c.text,
    marginBottom: 2,
    lineHeight: 20,
  },
  miniCardLabel: {
    fontSize: 11,
    color: c.textTertiary,
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: c.text,
    marginBottom: 16,
    marginLeft: 4,
    lineHeight: 20,
  },
  recCard: {
    flexDirection: 'row',
    backgroundColor: c.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: c.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  recIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  recContent: {
    flex: 1,
  },
  recTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: c.text,
    marginBottom: 6,
    lineHeight: 20,
  },
  recDesc: {
    fontSize: 12,
    color: c.textSecondary,
    lineHeight: 18,
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: '#FEE2E2',
    borderRadius: 24,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
    marginTop: 8,
  },
  alertLeftColorBar: {
    width: 6,
    backgroundColor: '#DC2626',
    position: 'absolute',
    left: 0,
    top: 24,
    bottom: 24,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  alertIconCol: {
    paddingTop: 24,
    paddingLeft: 24,
    paddingRight: 12,
  },
  alertContent: {
    flex: 1,
    paddingVertical: 24,
    paddingRight: 24,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#7F1D1D',
    marginBottom: 6,
    lineHeight: 20,
  },
  alertDesc: {
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 18,
  },
  accuracyCard: {
    backgroundColor: '#0284C7',
    borderRadius: 24,
    padding: 28,
    marginTop: 8,
  },
  accuracyPreTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#BAE6FD',
    letterSpacing: 1,
    marginBottom: 8,
    lineHeight: 14,
  },
  accuracyTitle: {
    fontSize: 28,
    fontWeight: '800',
    fontStyle: 'italic',
    color: '#FFF',
    marginBottom: 12,
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  accuracyDesc: {
    fontSize: 12,
    color: '#E0F2FE',
    lineHeight: 18,
  }
});
