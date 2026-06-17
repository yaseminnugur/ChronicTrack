import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/context/ThemeContext';
import type { ColorPalette } from '@/constants/theme';
import {
  getAnalysis,
  refreshAnalysis,
  type AnalysisResult,
  type AnalysisType,
  type RiskLevel,
} from '@/services/aiAnalysisService';

interface AnalysisViewProps {
  analysisType: AnalysisType;
  /**
   * Parent ekran kayıtları her tazelediğinde bumplayan bir sayaç. Yeni ölçüm
   * eklenip geri dönüldüğünde parent useFocusEffect bunu artırır, biz de
   * analizimizi yeniden çekeriz. Risk değiştiyse backend AI'ı yeniden çağırır.
   */
  dataVersion?: number;
}

export default function AnalysisView({ analysisType, dataVersion = 0 }: AnalysisViewProps) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedOnce = useRef(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      if (hasLoadedOnce.current) setRefreshing(true);
      const res = await getAnalysis(analysisType);
      setData(res);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Analiz yüklenemedi');
    } finally {
      if (!hasLoadedOnce.current) {
        setLoading(false);
        hasLoadedOnce.current = true;
      }
      setRefreshing(false);
    }
  }, [analysisType]);

  const triggerRefresh = useCallback(async () => {
    if (refreshing) return;
    try {
      setError(null);
      setRefreshing(true);
      const res = await refreshAnalysis(analysisType);
      setData(res);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Analiz yenilenemedi');
    } finally {
      setRefreshing(false);
    }
  }, [analysisType, refreshing]);

  // Mount + dataVersion değiştikçe yenile. dataVersion parent'ın useFocusEffect'inde
  // ölçüm listesi tazelendikten sonra bumplanır → yeni veri eklenince tetiklenir.
  useEffect(() => {
    load();
  }, [load, dataVersion]);

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator color="#0EA5E9" size="large" />
        <ThemedText style={styles.loadingText}>Analiz hazırlanıyor…</ThemedText>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.loadingBox}>
        <Ionicons name="alert-circle-outline" size={32} color={colors.textMuted} />
        <ThemedText style={styles.loadingText}>{error || 'Veri bulunamadı'}</ThemedText>
        <TouchableOpacity style={styles.retryBtn} onPress={load}>
          <ThemedText style={styles.retryBtnText}>Tekrar Dene</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  const { deterministic, ai, fromCache, generatedAt } = data;
  const risk = deterministic.riskLevel as RiskLevel;
  const trend = deterministic.trend as string;
  const trendDelta = deterministic.trendDeltaPct as number | null;

  return (
    <View style={styles.container}>

      {/* Şimdi Analiz Et Butonu */}
      <TouchableOpacity
        style={[styles.analyzeNowBtn, refreshing && styles.analyzeNowBtnDisabled]}
        activeOpacity={0.8}
        onPress={triggerRefresh}
        disabled={refreshing}
      >
        {refreshing ? (
          <ActivityIndicator size="small" color="#FFF" style={{ marginRight: 8 }} />
        ) : (
          <Ionicons name="sparkles" size={16} color="#FFF" style={{ marginRight: 8 }} />
        )}
        <ThemedText style={styles.analyzeNowBtnText}>
          {refreshing ? 'Analiz Ediliyor…' : 'Şimdi Analiz Et'}
        </ThemedText>
      </TouchableOpacity>

      {/* Genel Sağlık Riski Card */}
      <View style={styles.riskCard}>
        <View style={styles.riskHeader}>
          <ThemedText style={styles.riskPreTitle}>
            {analysisType === 'BLOOD_SUGAR' ? 'KAN ŞEKERİ DURUMU' : 'TANSİYON DURUMU'}
          </ThemedText>
          <View style={styles.aiBadge}>
            {refreshing ? (
              <ActivityIndicator size="small" color="#1E3A8A" style={{ marginRight: 4, transform: [{ scale: 0.6 }] }} />
            ) : (
              <Ionicons name="sparkles" size={10} color="#1E3A8A" style={{ marginRight: 4 }} />
            )}
            <ThemedText style={styles.aiBadgeText}>
              {refreshing ? 'Güncelleniyor…' : 'Yapay Zeka'}
            </ThemedText>
          </View>
        </View>

        <View style={styles.riskLevelRow}>
          <ThemedText style={[styles.riskLevelText, { color: riskColor(risk) }]}>
            {riskLabel(risk)}
          </ThemedText>
          <View style={[styles.riskDot, { backgroundColor: riskColor(risk) }]} />
        </View>

        <ThemedText style={styles.riskDescription}>{ai.summary}</ThemedText>

        <View style={styles.miniCardsRow}>
          {renderMiniCards(analysisType, deterministic, styles)}
        </View>

        <View style={styles.trendRow}>
          <Ionicons
            name={trendIcon(trend)}
            size={14}
            color={trendColor(trend, analysisType)}
            style={{ marginRight: 6 }}
          />
          <ThemedText style={[styles.trendText, { color: trendColor(trend, analysisType) }]}>
            {trendLabel(trend, trendDelta)}
          </ThemedText>
        </View>
      </View>

      {/* AI Önerileri */}
      {ai.recommendations.length > 0 && (
        <>
          <ThemedText style={styles.sectionTitle}>YZ Önerileri</ThemedText>
          {ai.recommendations.map((rec, i) => (
            <View key={i} style={styles.recCard}>
              <View style={[styles.recIconCircle, { backgroundColor: recIconBg(rec.icon) }]}>
                <Ionicons
                  name={recIconName(rec.icon)}
                  size={20}
                  color={recIconColor(rec.icon)}
                />
              </View>
              <View style={styles.recContent}>
                <ThemedText style={styles.recTitle}>{rec.title}</ThemedText>
                <ThemedText style={styles.recDesc}>{rec.detail}</ThemedText>
              </View>
            </View>
          ))}
        </>
      )}

      {/* Doktor Uyarısı (varsa) */}
      {ai.doctorAdvice && (
        <View style={styles.alertCard}>
          <View style={styles.alertLeftColorBar} />
          <View style={styles.alertIconCol}>
            <Ionicons name="warning" size={24} color="#7F1D1D" />
          </View>
          <View style={styles.alertContent}>
            <ThemedText style={styles.alertTitle}>Sağlık Profesyoneline Danışın</ThemedText>
            <ThemedText style={styles.alertDesc}>{ai.doctorAdvice}</ThemedText>
          </View>
        </View>
      )}

      {/* Hassasiyet / Meta Kart */}
      <View style={styles.accuracyCard}>
        <ThemedText style={styles.accuracyPreTitle}>SON ANALİZ</ThemedText>
        <ThemedText style={styles.accuracyTitle}>{formatGeneratedAt(generatedAt)}</ThemedText>
        <ThemedText style={styles.accuracyDesc}>
          {deterministic.recordsConsidered} ölçüm değerlendirildi · {deterministic.windowDays} günlük pencere
          {fromCache ? ' · Önbellekten' : ' · Yeni üretildi'}
        </ThemedText>

      </View>

      {/* Disclaimer */}
      <ThemedText style={styles.disclaimer}>
        Bu öneriler bilgilendirme amaçlıdır ve tıbbi tavsiye yerine geçmez.
        Sağlık kararlarınız için mutlaka hekiminize danışın.
      </ThemedText>
    </View>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Mini cards (deterministic stats görsel özet)
function renderMiniCards(
  type: AnalysisType,
  d: any,
  styles: ReturnType<typeof createStyles>
) {
  if (type === 'BLOOD_SUGAR') {
    const stats = d.stats;
    return (
      <>
        <View style={styles.miniCard}>
          <FontAwesome5 name="tint" size={14} color="#0284C7" style={{ marginBottom: 8 }} />
          <ThemedText style={styles.miniCardValue}>
            {stats.avg != null ? `${stats.avg}` : '--'}
          </ThemedText>
          <ThemedText style={styles.miniCardLabel}>Ortalama{'\n'}mg/dL</ThemedText>
        </View>
        <View style={styles.miniCard}>
          <MaterialCommunityIcons name="target" size={16} color="#16A34A" style={{ marginBottom: 6 }} />
          <ThemedText style={styles.miniCardValue}>
            {stats.inRangePct != null ? `%${stats.inRangePct}` : '--'}
          </ThemedText>
          <ThemedText style={styles.miniCardLabel}>Hedefte (70-180)</ThemedText>
          {(stats.hyperCount > 0 || stats.hypoCount > 0) && (
            <View style={styles.breakdownRow}>
              {stats.hyperCount > 0 && (
                <ThemedText style={[styles.breakdownText, { color: '#DC2626' }]}>
                  ↑ {stats.hyperCount} yüksek
                </ThemedText>
              )}
              {stats.hyperCount > 0 && stats.hypoCount > 0 && (
                <ThemedText style={styles.breakdownDot}> · </ThemedText>
              )}
              {stats.hypoCount > 0 && (
                <ThemedText style={[styles.breakdownText, { color: '#7F1D1D' }]}>
                  ↓ {stats.hypoCount} düşük
                </ThemedText>
              )}
            </View>
          )}
        </View>
      </>
    );
  }
  // BLOOD_PRESSURE
  const stats = d.stats;
  return (
    <>
      <View style={styles.miniCard}>
        <FontAwesome5 name="heartbeat" size={14} color="#E11D48" style={{ marginBottom: 8 }} />
        <ThemedText style={styles.miniCardValue}>
          {stats.avgSystolic != null ? `${stats.avgSystolic}/${stats.avgDiastolic}` : '--/--'}
        </ThemedText>
        <ThemedText style={styles.miniCardLabel}>Ort.{'\n'}mmHg</ThemedText>
      </View>
      <View style={styles.miniCard}>
        <MaterialCommunityIcons name="pulse" size={18} color="#0284C7" style={{ marginBottom: 4 }} />
        <ThemedText style={styles.miniCardValue}>
          {stats.avgPulse != null ? `${stats.avgPulse}` : '--'}
        </ThemedText>
        <ThemedText style={styles.miniCardLabel}>Nabız{'\n'}bpm</ThemedText>
      </View>
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers
function riskLabel(r: RiskLevel): string {
  return r === 'LOW' ? 'İyi' : r === 'MEDIUM' ? 'Orta' : r === 'HIGH' ? 'Yüksek' : 'Kritik';
}
function riskColor(r: RiskLevel): string {
  return r === 'LOW' ? '#16A34A' : r === 'MEDIUM' ? '#F59E0B' : r === 'HIGH' ? '#DC2626' : '#7F1D1D';
}
function trendIcon(t: string): keyof typeof Ionicons.glyphMap {
  if (t === 'IMPROVING') return 'trending-down';
  if (t === 'WORSENING') return 'trending-up';
  if (t === 'STABLE') return 'remove';
  return 'help-circle-outline';
}
function trendColor(t: string, type: AnalysisType): string {
  // Glikoz ve tansiyon için: yükseliş kötüleşme, düşüş iyileşme
  if (t === 'IMPROVING') return '#16A34A';
  if (t === 'WORSENING') return '#DC2626';
  return '#64748B';
}
function trendLabel(t: string, delta: number | null): string {
  if (t === 'INSUFFICIENT_DATA') return 'Trend için yeterli veri yok';
  const pct = delta != null ? ` (%${Math.abs(delta)})` : '';
  if (t === 'IMPROVING') return `İyileşme trendi${pct}`;
  if (t === 'WORSENING') return `Yükseliş trendi${pct}`;
  return 'Stabil seyrediyor';
}
function formatGeneratedAt(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Az önce';
  if (mins < 60) return `${mins} dakika önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  return `${days} gün önce`;
}

function recIconName(icon?: string): keyof typeof Ionicons.glyphMap {
  switch (icon) {
    case 'water': return 'water';
    case 'moon': return 'moon';
    case 'barbell': return 'barbell';
    case 'nutrition': return 'nutrition';
    case 'spa': return 'leaf';
    case 'walk': return 'walk';
    case 'medical': return 'medical';
    case 'pulse': return 'pulse';
    default: return 'sparkles';
  }
}
function recIconBg(icon?: string): string {
  switch (icon) {
    case 'water': return '#E0F2FE';
    case 'moon': return '#DBEAFE';
    case 'barbell': return '#FEF3C7';
    case 'nutrition': return '#DCFCE7';
    case 'walk': return '#DCFCE7';
    case 'medical': return '#FEE2E2';
    case 'pulse': return '#FEE2E2';
    default: return '#F3E8FF';
  }
}
function recIconColor(icon?: string): string {
  switch (icon) {
    case 'water': return '#0284C7';
    case 'moon': return '#1E3A8A';
    case 'barbell': return '#D97706';
    case 'nutrition': return '#16A34A';
    case 'walk': return '#16A34A';
    case 'medical': return '#DC2626';
    case 'pulse': return '#DC2626';
    default: return '#7C3AED';
  }
}

const createStyles = (c: ColorPalette) => StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  loadingBox: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: c.textTertiary,
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#0EA5E9',
    borderRadius: 20,
    marginTop: 4,
  },
  retryBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  analyzeNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0EA5E9',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  analyzeNowBtnDisabled: {
    opacity: 0.7,
  },
  analyzeNowBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
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
    flex: 1,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 44,
    fontWeight: '800',
    lineHeight: 50,
  },
  riskDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 10,
    marginBottom: 12,
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
    marginBottom: 16,
  },
  miniCard: {
    flex: 1,
    backgroundColor: c.surface,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
  },
  miniCardValue: {
    fontSize: 16,
    fontWeight: '800',
    color: c.text,
    marginBottom: 2,
    lineHeight: 22,
  },
  miniCardLabel: {
    fontSize: 11,
    color: c.textTertiary,
    lineHeight: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    flexWrap: 'wrap',
  },
  breakdownText: {
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 14,
  },
  breakdownDot: {
    fontSize: 10,
    color: c.textMuted,
    lineHeight: 14,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '700',
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
    padding: 24,
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
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 8,
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  accuracyDesc: {
    fontSize: 12,
    color: '#E0F2FE',
    lineHeight: 18,
  },
  disclaimer: {
    fontSize: 11,
    color: c.textTertiary,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 8,
  },
});
