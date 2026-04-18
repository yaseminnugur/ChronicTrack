import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TextInput, TouchableOpacity, Platform, Modal, Pressable, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { CustomButton } from '@/components/CustomButton';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { saveBloodSugar } from '../services/healthService';

const MEAL_OPTIONS = ['Yemek Öncesi', 'Yemek Sonrası', 'Uyku Öncesi', 'Açlık', 'Diğerleri'];

export default function AddDiabetesScreen() {
  const [glucose, setGlucose] = useState('');
  const [notes, setNotes] = useState('');
  
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [iosPickerStep, setIosPickerStep] = useState<'date' | 'time'>('date');
  
  const [mealState, setMealState] = useState(MEAL_OPTIONS[0]);
  const [showMealModal, setShowMealModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      if (glucose) {
        setSaving(true);
        await saveBloodSugar({
          glucose,
          mealState,
          notes,
        });
      }
      router.back();
    } catch (e) {
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      
      {/* Header with Back Button */}
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
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
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.inputHuge}
              value={glucose}
              onChangeText={setGlucose}
              placeholder="---"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
            <View style={styles.unitBadge}>
              <ThemedText style={styles.unitBadgeText}>mg/dL</ThemedText>
            </View>
          </View>

          <ThemedText style={styles.label}>ÖLÇÜM TARİHİ VE SAATİ</ThemedText>
          <TouchableOpacity style={styles.inputWrapper} activeOpacity={0.7} onPress={openPicker}>
            <Ionicons name="calendar-outline" size={18} color="#2563EB" style={{ marginRight: 12 }} />
            <ThemedText style={styles.dateTextPlaceholder}>
              {date.toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}
            </ThemedText>
            <Ionicons name="calendar" size={16} color="#4B5563" />
          </TouchableOpacity>

          <ThemedText style={styles.label}>ÖĞÜN DURUMU</ThemedText>
          <TouchableOpacity style={styles.inputWrapper} activeOpacity={0.7} onPress={() => setShowMealModal(true)}>
            <ThemedText style={styles.dateTextPlaceholder}>{mealState}</ThemedText>
            <Ionicons name="chevron-down" size={20} color="#4B5563" />
          </TouchableOpacity>

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
                textColor="#0F172A"
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
            {MEAL_OPTIONS.map((opt, i) => {
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

const styles = StyleSheet.create({
  topNav: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
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
    color: '#0F172A',
    marginBottom: 8,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  guidanceBanner: {
    backgroundColor: '#F1F5F9',
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
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guidancePreTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 6,
  },
  guidanceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    width: '75%',
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 15,
    elevation: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  inputHuge: {
    flex: 1,
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 2,
  },
  unitBadge: {
    backgroundColor: '#475569',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  unitBadgeText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  dateTextPlaceholder: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
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
    color: '#0F172A',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
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
    color: '#0F172A',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalOptionActive: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: -12,
    borderBottomWidth: 0,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '500',
  },
  modalOptionTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  fabContainer: {
    padding: 24,
    paddingTop: 12,
    backgroundColor: 'rgba(248, 250, 252, 0.95)',
  }
});
