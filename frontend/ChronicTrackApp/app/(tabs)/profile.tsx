import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile } from '../../services/userService';

export default function ProfileTab() {
  const { signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const fetchProfile = async () => {
        try {
          const res = await getUserProfile();
          setProfile(res.user);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }, [])
  );

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/(auth)/login');
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' }}>
        <ThemedText>Yükleniyor...</ThemedText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Profile Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          </TouchableOpacity>

          <View style={styles.avatarWrapper}>
            {/* Fallback avatar icon if no image */}
            <View style={styles.avatarFallback}>
              <Ionicons name="person" size={48} color="#94A3B8" />
            </View>
            <TouchableOpacity style={styles.editAvatarBtn} activeOpacity={0.8} onPress={() => router.push('/edit-profile')}>
              <FontAwesome5 name="pen" size={10} color="#FFF" />
            </TouchableOpacity>
          </View>
          <ThemedText style={styles.userName}>{profile?.name || 'Kullanıcı'}</ThemedText>
        </View>

        {/* Info Section */}
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>Sağlık Özeti</ThemedText>

          {/* Card: Kilo */}
          <View style={styles.summaryCard}>
            <View style={styles.cardHeaderRow}>
              <MaterialCommunityIcons name="weight" size={24} color="#0284C7" />
              <ThemedText style={styles.cardLabelText}>KİLO</ThemedText>
            </View>
            <View style={styles.cardValueRow}>
              <ThemedText style={styles.cardValueBig}>{profile?.weight || '--'}</ThemedText>
              <ThemedText style={styles.cardValueUnit}>kg</ThemedText>
            </View>
          </View>

          {/* Card: Boy */}
          <View style={styles.summaryCard}>
            <View style={styles.cardHeaderRow}>
              <MaterialCommunityIcons name="ruler" size={24} color="#0284C7" />
              <ThemedText style={styles.cardLabelText}>BOY</ThemedText>
            </View>
            <View style={styles.cardValueRow}>
              <ThemedText style={styles.cardValueBig}>{profile?.height || '--'}</ThemedText>
              <ThemedText style={styles.cardValueUnit}>cm</ThemedText>
            </View>
          </View>

          {/* Card: Yaş */}
          <View style={styles.summaryCard}>
            <View style={styles.cardHeaderRow}>
              <MaterialCommunityIcons name="calendar-blank" size={24} color="#0284C7" />
              <ThemedText style={styles.cardLabelText}>YAŞ</ThemedText>
            </View>
            <View style={styles.cardValueRow}>
              <ThemedText style={styles.cardValueBig}>{profile?.age || '--'}</ThemedText>
              <ThemedText style={styles.cardValueUnit}>yaş</ThemedText>
            </View>
          </View>

          {/* Card: Sigara Kullanımı */}
          <View style={styles.rowCard}>
            <View style={styles.rowCardIconWrapper}>
              <FontAwesome5 name="smoking-ban" size={18} color="#64748B" />
            </View>
            <View style={styles.rowCardTextCol}>
              <ThemedText style={styles.rowCardLabel}>SİGARA KULLANIMI</ThemedText>
              <ThemedText style={styles.rowCardValue}>{profile?.isSmoking ? 'Kullanıyor' : 'Kullanmıyor'}</ThemedText>
            </View>
          </View>

          {/* Card: Fiziksel Aktivite */}
          <View style={styles.rowCard}>
            <View style={[styles.rowCardIconWrapper, { backgroundColor: '#FFF' }]}>
              <Ionicons name="barbell" size={20} color="#0284C7" />
            </View>
            <View style={styles.rowCardTextCol}>
              <ThemedText style={styles.rowCardLabel}>FİZİKSEL AKTİVİTE</ThemedText>
              <ThemedText style={styles.rowCardValue}>{profile?.activityLevel || 'Belirtilmedi'}</ThemedText>
            </View>
          </View>

          {/* Card: Tuz Tüketimi */}
          <View style={styles.rowCard}>
            <View style={[styles.rowCardIconWrapper, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="water" size={20} color="#991B1B" />
            </View>
            <View style={styles.rowCardTextCol}>
              <ThemedText style={styles.rowCardLabel}>TUZ TÜKETİMİ</ThemedText>
              <ThemedText style={styles.rowCardValue}>{profile?.saltLevel || 'Belirtilmedi'}</ThemedText>
            </View>
          </View>

        </View>

      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.updateButton} activeOpacity={0.9} onPress={() => router.push('/edit-profile')}>
          <FontAwesome5 name="briefcase-medical" size={16} color="#FFF" style={{ marginRight: 8 }} />
          <ThemedText style={styles.updateButtonText}>Tıbbi Profili Güncelle</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 100,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  logoutBtn: {
    position: 'absolute',
    top: -10,
    right: 0,
    padding: 8,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F8FAFC',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 30,
  },
  sectionContainer: {
    backgroundColor: '#F1F5F9',
    borderRadius: 32,
    padding: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardLabelText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 1,
  },
  cardValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  cardValueBig: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 38,
  },
  cardValueUnit: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginLeft: 6,
  },
  rowCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  rowCardIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  rowCardTextCol: {
    flex: 1,
  },
  rowCardLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 1,
    marginBottom: 4,
  },
  rowCardValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 22,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: 'rgba(248, 250, 252, 0.9)', // frosted glass effect could be added
  },
  updateButton: {
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
  updateButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  }
});
