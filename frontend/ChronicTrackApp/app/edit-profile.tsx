import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput, Switch, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function EditProfileScreen() {
  const [weight, setWeight] = useState('72');
  const [height, setHeight] = useState('175');
  const [age, setAge] = useState('68');
  
  const [isSmoking, setIsSmoking] = useState(false);
  const [activityLevel, setActivityLevel] = useState('Orta');
  const [saltLevel, setSaltLevel] = useState('Orta Düzey');

  const ACTIVITY_OPTIONS = ['Hareketsiz', 'Orta', 'Aktif', 'Sporcu'];
  const SALT_OPTIONS = ['Düşük', 'Orta Düzey', 'Yüksek'];

  const handleSave = () => {
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      
      {/* Header View */}
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Info Subheader */}
        <View style={styles.headerTitleRow}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarFallback}>
              <Ionicons name="person" size={32} color="#94A3B8" />
            </View>
            <View style={styles.cameraBtn}>
              <Ionicons name="camera" size={10} color="#FFF" />
            </View>
          </View>
          <View style={styles.headerTextCol}>
            <ThemedText style={styles.mainTitle}>Kişisel Sağlık Profili</ThemedText>
            <ThemedText style={styles.subTitle}>Hassas sağlık takibi için bilgilerinizi güncelleyin.</ThemedText>
          </View>
        </View>

        {/* Section: FİZİKSEL ÖZELLİKLER */}
        <View style={styles.formSection}>
          <ThemedText style={styles.sectionLabel}>FİZİKSEL ÖZELLİKLER</ThemedText>
          
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Kilo (kg)</ThemedText>
            <View style={styles.inputWrapper}>
              <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="numeric" />
              <MaterialCommunityIcons name="weight" size={20} color="#475569" />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Boy (cm)</ThemedText>
            <View style={styles.inputWrapper}>
              <TextInput style={styles.input} value={height} onChangeText={setHeight} keyboardType="numeric" />
              <MaterialCommunityIcons name="ruler" size={20} color="#475569" />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Yaş</ThemedText>
            <View style={styles.inputWrapper}>
              <TextInput style={styles.input} value={age} onChangeText={setAge} keyboardType="numeric" />
              <Ionicons name="calendar-outline" size={20} color="#475569" />
            </View>
          </View>
        </View>

        {/* Section: YAŞAM TARZI VE ALIŞKANLIKLAR */}
        <View style={styles.formSection}>
          <ThemedText style={styles.sectionLabel}>YAŞAM TARZI VE ALIŞKANLIKLAR</ThemedText>
          
          {/* Smoking Toggle */}
          <View style={styles.toggleCard}>
            <View style={styles.toggleIconCol}>
              <View style={styles.smokeIconWrap}>
                <FontAwesome5 name="smoking-ban" size={16} color="#0284C7" />
              </View>
            </View>
            <View style={styles.toggleTextCol}>
              <ThemedText style={styles.toggleTitle}>Sigara Kullanımı</ThemedText>
              <ThemedText style={styles.toggleDesc}>Şu anda sigara içiyor musunuz?</ThemedText>
            </View>
            <Switch 
              value={isSmoking} 
              onValueChange={setIsSmoking} 
              trackColor={{ false: '#E2E8F0', true: '#0EA5E9' }}
              thumbColor={'#FFF'}
            />
          </View>

          {/* Activity Buttons */}
          <ThemedText style={styles.inputLabel}>Günlük Aktivite Düzeyi</ThemedText>
          <View style={styles.pillGrid}>
            {ACTIVITY_OPTIONS.map((opt) => (
              <TouchableOpacity 
                key={opt}
                activeOpacity={0.7}
                onPress={() => setActivityLevel(opt)}
                style={[styles.pillBtn, activityLevel === opt && styles.pillBtnActive]}
              >
                <ThemedText style={[styles.pillText, activityLevel === opt && styles.pillTextActive]}>{opt}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          {/* Salt Selector using Buttons instead of Slider */}
          <View style={styles.saltHeaderRow}>
            <ThemedText style={styles.inputLabel}>Tuz Tüketimi</ThemedText>
            <View style={styles.saltStatusBadge}>
              <ThemedText style={styles.saltStatusText}>{saltLevel}</ThemedText>
            </View>
          </View>
          <View style={styles.pillGrid}>
            {SALT_OPTIONS.map((opt) => (
              <TouchableOpacity 
                key={opt}
                activeOpacity={0.7}
                onPress={() => setSaltLevel(opt)}
                style={[styles.pillBtn, saltLevel === opt && styles.pillBtnActive]}
              >
                <ThemedText style={[styles.pillText, saltLevel === opt && styles.pillTextActive]}>{opt}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>

        </View>
        
        {/* Save Info */}
        <View style={styles.saveInfoBox}>
          <ThemedText style={styles.saveInfoText}>
            Değişiklikler sağlık analizlerinize anında yansıtılacaktır.
          </ThemedText>
        </View>

      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.saveButton} activeOpacity={0.9} onPress={handleSave}>
          <FontAwesome5 name="save" size={16} color="#FFF" style={{ marginRight: 8 }} />
          <ThemedText style={styles.saveButtonText}>Değişiklikleri Kaydet</ThemedText>
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topNav: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 0,
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
    paddingBottom: 120,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 16,
  },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F8FAFC',
  },
  headerTextCol: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
    lineHeight: 28,
  },
  subTitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  formSection: {
    backgroundColor: '#F1F5F9',
    borderRadius: 32,
    padding: 24,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 1,
  },
  toggleIconCol: {
    marginRight: 16,
  },
  smokeIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleTextCol: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  toggleDesc: {
    fontSize: 11,
    color: '#64748B',
  },
  pillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 24,
  },
  pillBtn: {
    flexBasis: '47%',
    margin: '1.5%',
    backgroundColor: '#FFF',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 1,
  },
  pillBtnActive: {
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  pillTextActive: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
  saltHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  saltStatusBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  saltStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  saveInfoBox: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  saveInfoText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  fabContainer: {
    padding: 24,
    paddingTop: 12,
    backgroundColor: 'rgba(248, 250, 252, 0.95)',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#0EA5E9',
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  }
});
