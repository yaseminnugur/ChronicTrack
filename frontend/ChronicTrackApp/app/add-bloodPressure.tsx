import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TextInput, TouchableOpacity, Platform, Modal, Pressable, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { CustomButton } from '@/components/CustomButton';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddBloodPressureScreen() {
  const [sis, setSis] = useState('');
  const [dia, setDia] = useState('');
  const [pulse, setPulse] = useState('');
  const [notes, setNotes] = useState('');
  
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [iosPickerStep, setIosPickerStep] = useState<'date' | 'time'>('date');

  const handleSave = () => {
    router.back();
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
          <ThemedText style={styles.title}>Tansiyon Ekle</ThemedText>
          <ThemedText style={styles.subtitle}>
            Günlük ölçümlerinizi kaydederek kalp sağlığınızı koruyun.
          </ThemedText>
        </View>

        <View style={styles.formCard}>
          <ThemedText style={styles.label}>SİSTOLİK (BÜYÜK)</ThemedText>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={sis}
              onChangeText={setSis}
              placeholder="120"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
            <ThemedText style={styles.unitText}>mmHg</ThemedText>
          </View>

          <ThemedText style={styles.label}>DİASTOLİK (KÜÇÜK)</ThemedText>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={dia}
              onChangeText={setDia}
              placeholder="80"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
            <ThemedText style={styles.unitText}>mmHg</ThemedText>
          </View>

          <ThemedText style={styles.label}>NABIZ (KALP ATIŞ HIZI)</ThemedText>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={pulse}
              onChangeText={setPulse}
              placeholder="72"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
            <ThemedText style={styles.unitTextItalic}>BPM</ThemedText>
          </View>

          <ThemedText style={styles.label}>ÖLÇÜM ZAMANI</ThemedText>
          <TouchableOpacity style={styles.inputWrapper} activeOpacity={0.7} onPress={openPicker}>
            <ThemedText style={styles.dateTextPlaceholder}>
              {date.toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}
            </ThemedText>
            <FontAwesome5 name="calendar-alt" size={16} color="#4B5563" />
          </TouchableOpacity>

          <ThemedText style={styles.label}>NOTLAR</ThemedText>
          <View style={[styles.inputWrapper, styles.multilineWrapper]}>
            <TextInput
              style={styles.multilineInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Nasıl hissediyorsunuz? (Örn: Yürüyüşten sonra biraz başım döndü)"
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
            />
          </View>

          <View style={styles.infoBox}>
            <View style={styles.infoIconCircle}>
              <FontAwesome5 name="info" size={10} color="#FFF" />
            </View>
            <ThemedText style={styles.infoText}>
              İpucu: En doğru ölçüm için tansiyonunuzu ölçmeden önce 5 dakika sakince oturun. Ayaklarınızı yere düz basın.
            </ThemedText>
          </View>
        </View>
      </ScrollView>

      <View style={styles.fabContainer}>
        <CustomButton
          title="Ölçümü Kaydet"
          onPress={handleSave}
          leftIcon={<FontAwesome5 name="save" size={16} color="#FFF" style={{ marginRight: 8 }} />}
        />
      </View>
      </KeyboardAvoidingView>

      {/* Date / Time Pickers */}
      {Platform.OS === 'ios' ? (
        <Modal visible={showDatePicker} transparent animationType="fade">
          <Pressable style={styles.modalOverlay} onPress={() => { setShowDatePicker(false); setIosPickerStep('date'); }}>
            <Pressable style={[styles.modalContent, { paddingBottom: 40, alignItems: 'center' }]} onPress={(e) => e.stopPropagation()}>
              <View style={[styles.modalHeader, { width: '100%', flexDirection: 'row', justifyContent: 'space-between' }]}>
                <ThemedText style={styles.modalTitle}>{iosPickerStep === 'date' ? 'Tarih Seçin' : 'Saat Seçin'}</ThemedText>
                <TouchableOpacity onPress={handleIosDone}>
                  <ThemedText style={{ color: '#E11D48', fontWeight: 'bold' }}>{iosPickerStep === 'date' ? 'İleri' : 'Bitti'}</ThemedText>
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
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B91C1C',
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
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  unitText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  unitTextItalic: {
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
    color: '#9CA3AF',
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  infoIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
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
  fabContainer: {
    padding: 24,
    paddingTop: 12,
    backgroundColor: 'rgba(248, 250, 252, 0.95)',
  }
});
