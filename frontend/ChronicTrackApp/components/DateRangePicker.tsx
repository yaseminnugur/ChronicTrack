import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Modal, TouchableOpacity } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { ThemedText } from './themed-text';
import { Ionicons } from '@expo/vector-icons';
import { CustomButton } from './CustomButton';

// Türkçe yerelleştirme
LocaleConfig.locales['tr'] = {
  monthNames: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
  monthNamesShort: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
  dayNames: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
  dayNamesShort: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
  today: 'Bugün'
};
LocaleConfig.defaultLocale = 'tr';

interface DateRangePickerProps {
  onApply: (startDate: string | undefined, endDate: string | undefined) => void;
  themeColor?: string;
}

const getLocalTodayString = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function DateRangePicker({ onApply, themeColor = '#0EA5E9' }: DateRangePickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [markedDates, setMarkedDates] = useState<any>({});
  const today = getLocalTodayString();
  const currentMonthKey = today.substring(0, 7); // "YYYY-MM"
  const [visibleMonth, setVisibleMonth] = useState(currentMonthKey);
  const isAtCurrentMonth = visibleMonth >= currentMonthKey;

  // Seçili tarih aralığını hesapla
  useEffect(() => {
    let marks: any = {};
    if (startDate) {
      marks[startDate] = { startingDay: true, color: themeColor, textColor: 'white' };
      if (endDate) {
        marks[endDate] = { endingDay: true, color: themeColor, textColor: 'white' };
        
        // Aradaki günleri doldur
        const start = new Date(startDate);
        const end = new Date(endDate);
        const current = new Date(start);
        current.setDate(current.getDate() + 1);
        
        while (current < end) {
          const dateString = current.toISOString().split('T')[0];
          marks[dateString] = { color: themeColor, textColor: 'white', opacity: 0.5 };
          current.setDate(current.getDate() + 1);
        }
      }
    }
    setMarkedDates(marks);
  }, [startDate, endDate, themeColor]);

  const onDayPress = (day: any) => {
    // Gelecek tarih seçimini engelle (Calendar maxDate'in üzerine ek güvenlik)
    if (day.dateString > today) return;

    if (!startDate || (startDate && endDate)) {
      setStartDate(day.dateString);
      setEndDate(null);
    } else if (startDate && !endDate) {
      if (day.dateString > startDate) {
        setEndDate(day.dateString);
      } else if (day.dateString < startDate) {
        setEndDate(startDate);
        setStartDate(day.dateString);
      } else {
        // Aynı güne tıklandıysa tek gün seçimi yap
        setEndDate(day.dateString);
      }
    }
  };

  const handleApply = () => {
    setModalVisible(false);
    // Sadece başlangıç seçildiyse tek gün seçimi olarak uygula
    const finalEnd = endDate || startDate;
    onApply(startDate || undefined, finalEnd || undefined);
  };

  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    setModalVisible(false);
    onApply(undefined, undefined);
  };

  const formatDateLabel = () => {
    if (startDate && endDate) {
      if (startDate === endDate) return startDate;
      return `${startDate} - ${endDate}`;
    } else if (startDate) {
      return startDate;
    }
    return 'Tarih Seç';
  };

  return (
    <View>
      <TouchableOpacity 
        style={[styles.triggerBtn, { borderColor: themeColor }]} 
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="calendar-outline" size={18} color={themeColor} style={{ marginRight: 8 }} />
        <ThemedText style={[styles.triggerText, { color: themeColor }]}>
          {formatDateLabel()}
        </ThemedText>
        {(startDate || endDate) && (
          <TouchableOpacity onPress={handleClear} style={{ marginLeft: 'auto', padding: 4 }}>
            <Ionicons name="close-circle" size={16} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Tarih Aralığı Seç</ThemedText>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Calendar
              markingType={'period'}
              markedDates={markedDates}
              onDayPress={onDayPress}
              maxDate={today}
              current={today}
              disableArrowRight={isAtCurrentMonth}
              onMonthChange={(m: any) => {
                setVisibleMonth(`${m.year}-${String(m.month).padStart(2, '0')}`);
              }}
              theme={{
                todayTextColor: themeColor,
                arrowColor: themeColor,
                textDisabledColor: '#CBD5E1',
              }}
            />

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
                <ThemedText style={styles.clearBtnText}>Temizle</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.applyBtn, { backgroundColor: themeColor }]} onPress={handleApply}>
                <ThemedText style={styles.applyBtnText}>Uygula</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  triggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: '#FFF',
    marginBottom: 16,
  },
  triggerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    overflow: 'hidden',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 20,
    gap: 12,
  },
  clearBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  clearBtnText: {
    color: '#64748B',
    fontWeight: '600',
  },
  applyBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  applyBtnText: {
    color: '#FFF',
    fontWeight: '700',
  }
});
