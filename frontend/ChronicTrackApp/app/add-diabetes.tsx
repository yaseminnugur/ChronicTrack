import React, { useState, useMemo } from 'react';
import { StyleSheet, View, ScrollView, TextInput, TouchableOpacity, Platform, Modal, Pressable, KeyboardAvoidingView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { CustomButton } from '@/components/CustomButton';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useColors } from '@/context/ThemeContext';
import type { ColorPalette } from '@/constants/theme';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { saveBloodSugar } from '../services/healthService';
import { filterDecimalInput } from '../utils/numberUtils';
import { validateBloodSugar, HEALTH_RANGES, MEAL_STATES } from '../validations/healthValidation';

export default function AddDiabetesScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [glucose, setGlucose] = useState('');
  const [notes, setNotes] = useState('');
  
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [iosPickerStep, setIosPickerStep] = useState<'date' | 'time'>('date');
  
  const [mealState, setMealState] = useState<string | null>(null);
  const [showMealModal, setShowMealModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  // Gerçek zamanlı validasyon
  const validation = useMemo(() => validateBloodSugar(glucose, mealState), [glucose, mealState]);

  const handleSave = async () => {
    setShowErrors(true);

    if (!validation.isValid) {
      return;
    }

    try {
      if (glucose && mealState) {
        setSaving(true);
        await saveBloodSugar({
          glucose,
          mealState,
          notes,
        });
      }
      router.back();
    } catch (e: any) {
      const serverMsg = e?.response?.data?.error;
      Alert.alert('Hata', serverMsg || 'Kayıt sırasında bir hata oluştu.');
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      if (Platform.OS === 'android') {
        setShowTimePicker(true);
      }
    }
  };

  const onChangeTime = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const openPicker = () => {
    setIosPickerStep('date');
    setShowDatePicker(true);
  };

  const handleIosDone = () => {
    if (iosPickerStep === 'date') {
      setIosPickerStep('time');
    } else {
      setShowDatePicker(false);
      setShowTimePicker(false);
      setIosPickerStep('date');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>

      {/* Header with Back Button */}
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <View style={styles.pillBadge}>
            <ThemedText style={styles.pillText}>SAĞLIK TAKİBİ</ThemedText>
          </View>
          <ThemedText style={styles.title}>Kan Şekeri Ekle</ThemedText>
          <ThemedText style={styles.subtitle}>
            Metabolik eğilimleri takip etmek için düzenli glikoz ölçümlerini kaydedin.
          </ThemedText>
        </View>

        {/* Guidance Banner */}
        <View style={styles.guidanceBanner}>
          <View style={styles.guidanceBlob}>
            <FontAwesome5 name="plus" size={32} color="#FFF" style={{ opacity: 0.8 }} />
          </View>
          <ThemedText style={styles.guidancePreTitle}>REHBERLİK</ThemedText>
          <ThemedText style={styles.guidanceText}>
            Düzenli kayıt tutmak, daha iyi genel sağlık sonuçlarına yol açar.
          </ThemedText>
        </View>

        <View style={styles.formCard}>
          <ThemedText style={styles.label}>GLİKOZ DEĞERİ (MG/DL)</ThemedText>
          <View style={[styles.inputWrapper, showErrors && validation.errors.glucose ? styles.inputWrapperError : null]}>
            <TextInput
              style={styles.inputHuge}
              value={glucose}
              onChangeText={(text) => setGlucose(filterDecimalInput(text))}
              placeholder="---"
              placeholderTextColor="#9CA3AF"
              keyboardType="decimal-pad"
            />
            <View style={styles.unitBadge}>
              <ThemedText style={styles.unitBadgeText}>mg/dL</ThemedText>
            </View>
          </View>
          {showErrors && validation.errors.glucose ? (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle" size={14} color="#DC2626" />
              <ThemedText style={styles.errorText}>{validation.errors.glucose}</ThemedText>
            </View>
          ) : (
            <ThemedText style={styles.rangeHint}>
              Geçerli aralık: {HEALTH_RANGES.glucose.min}–{HEALTH_RANGES.glucose.max} {HEALTH_RANGES.glucose.unit}
            </ThemedText>
          )}

          <ThemedText style={styles.label}>ÖLÇÜM TARİHİ VE SAATİ</ThemedText>
          <TouchableOpacity style={styles.inputWrapper} activeOpacity={0.7} onPress={openPicker}>
            <Ionicons name="calendar-outline" size={18} color="#2563EB" style={{ marginRight: 12 }} />
            <ThemedText style={styles.dateTextPlaceholder}>
              {date.toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}
            </ThemedText>
            <Ionicons name="calendar" size={16} color="#4B5563" />
          </TouchableOpacity>

          <ThemedText style={styles.label}>ÖĞÜN DURUMU</ThemedText>
          <TouchableOpacity
            style={[
              styles.inputWrapper,
              showErrors && validation.errors.mealState ? styles.inputWrapperError : null,
            ]}
            activeOpacity={0.7}
            onPress={() => setShowMealModal(true)}
          >
            <ThemedText
              style={[
                styles.dateTextPlaceholder,
                !mealState && { color: '#9CA3AF', fontWeight: '500' },
              ]}
            >
              {mealState || 'Öğün durumu seçin'}
            </ThemedText>
            <Ionicons name="chevron-down" size={20} color="#4B5563" />
          </TouchableOpacity>
          {showErrors && validation.errors.mealState ? (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle" size={14} color="#DC2626" />
              <ThemedText style={styles.errorText}>{validation.errors.mealState}</ThemedText>
            </View>
          ) : null}

          <ThemedText style={styles.label}>NOTLAR</ThemedText>
          <View style={[styles.inputWrapper, styles.multilineWrapper]}>
            <TextInput
              style={styles.multilineInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Nasıl hissediyorsunuz? Yeni bir yiyecek denediniz mi?"
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>

      </ScrollView>

      <View style={styles.fabContainer}>
        <CustomButton
          title="Ölçümü Kaydet"
          onPress={handleSave}
          loading={saving}
          leftIcon={<Ionicons name="checkmark-circle" size={18} color="#FFF" style={{ marginRight: 8 }} />}
        />
      </View>
      </KeyboardAvoidingView>

      {/* Date Pickers */}
      {Platform.OS === 'ios' ? (
        <Modal visible={showDatePicker} transparent animationType="fade">
          <Pressable style={styles.modalOverlay} onPress={() => { setShowDatePicker(false); setIosPickerStep('date'); }}>
            <Pressable style={[styles.modalContent, { paddingBottom: 40, alignItems: 'center' }]} onPress={(e) => e.stopPropagation()}>
              <View style={[styles.modalHeader, { width: '100%', flexDirection: 'row', justifyContent: 'space-between' }]}>
                <ThemedText style={styles.modalTitle}>{iosPickerStep === 'date' ? 'Tarih Seçin' : 'Saat Seçin'}</ThemedText>
                <TouchableOpacity onPress={handleIosDone}>
                  <ThemedText style={{ color: '#2563EB', fontWeight: 'bold' }}>{iosPickerStep === 'date' ? 'İleri' : 'Bitti'}</ThemedText>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={date}
                mode={iosPickerStep}
                display="spinner"
                maximumDate={new Date()}
                onChange={(e, d) => {
                  if (d) setDate(d);
                }}
                textColor={colors.text}
                style={{ width: 320, height: 200 }}
              />
            </Pressable>
          </Pressable>
        </Modal>
      ) : (
        <>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              maximumDate={new Date()}
              onChange={onChangeDate}
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              value={date}
              mode="time"
              display="default"
              onChange={onChangeTime}
            />
          )}
        </>
      )}

      {/* Meal State Modal */}
      <Modal visible={showMealModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowMealModal(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Öğün Durumu Seçin</ThemedText>
            </View>
            {MEAL_STATES.map((opt, i) => {
              const isSelected = mealState === opt;
              return (
                <TouchableOpacity 
                  key={i} 
                  style={[styles.modalOption, isSelected && styles.modalOptionActive]}
                  onPress={() => {
                    setMealState(opt);
                    setShowMealModal(false);
                  }}
                >
                  <ThemedText style={[styles.modalOptionText, isSelected && styles.modalOptionTextActive]}>
                    {opt}
                  </ThemedText>
                  {isSelected && <Ionicons name="checkmark-circle" size={20} color="#2563EB" />}
                </TouchableOpacity>
              )
            })}
          </View>
        </Pressable>
      </Modal>

    </SafeAreaView>
  );
}

const createStyles = (c: ColorPalette) => StyleSheet.create({
  topNav: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: c.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: c.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 100,
    flexGrow: 1,
  },
  header: {
    marginBottom: 24,
  },
  pillBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8',
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: c.text,
    marginBottom: 8,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 14,
    color: c.textSecondary,
    lineHeight: 22,
  },
  guidanceBanner: {
    backgroundColor: c.surfaceMuted,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  guidanceBlob: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: c.iconCircleBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guidancePreTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: c.textTertiary,
    letterSpacing: 1,
    marginBottom: 6,
  },
  guidanceText: {
    fontSize: 14,
    fontWeight: '700',
    color: c.text,
    width: '75%',
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: c.surface,
    borderRadius: 24,
    padding: 24,
    shadowColor: c.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 15,
    elevation: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: c.textSecondary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.surfaceSubtle,
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
    marginBottom: 4,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputWrapperError: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FFF5F5',
  },
  inputHuge: {
    flex: 1,
    fontSize: 24,
    fontWeight: '800',
    color: c.text,
    letterSpacing: 2,
  },
  unitBadge: {
    backgroundColor: c.textSecondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  unitBadgeText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
    gap: 6,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
    flex: 1,
  },
  rangeHint: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  dateTextPlaceholder: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: c.text,
  },
  multilineWrapper: {
    height: 100,
    alignItems: 'flex-start',
    paddingVertical: 16,
  },
  multilineInput: {
    flex: 1,
    width: '100%',
    fontSize: 14,
    color: c.text,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: c.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: c.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHeader: {
    marginBottom: 16,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: c.text,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: c.surfaceMuted,
  },
  modalOptionActive: {
    backgroundColor: c.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: -12,
    borderBottomWidth: 0,
  },
  modalOptionText: {
    fontSize: 16,
    color: c.textSecondary,
    fontWeight: '500',
  },
  modalOptionTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  fabContainer: {
    padding: 24,
    paddingTop: 12,
    backgroundColor: c.fabBackdrop,
  }
});
