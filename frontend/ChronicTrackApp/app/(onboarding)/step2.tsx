import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { CustomButton } from '@/components/CustomButton';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { router } from 'expo-router';

export default function Step2Screen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const colors = Colors[theme as keyof typeof Colors];

  const [selectedConditions, setSelectedConditions] = useState<string[]>(['Tansiyon']);

  const toggleCondition = (id: string) => {
    if (id === 'Hiçbiri') {
      setSelectedConditions(['Hiçbiri']);
      return;
    }

    let newSelection = selectedConditions.filter(c => c !== 'Hiçbiri');
    if (newSelection.includes(id)) {
      newSelection = newSelection.filter(c => c !== id);
    } else {
      newSelection.push(id);
    }
    setSelectedConditions(newSelection);
  };

  const conditions = [
    {
      id: 'Diyabet',
      title: 'Diyabet',
      subtitle: 'Tip 1, Tip 2',
      icon: 'tint',
      iconType: 'FontAwesome5'
    },
    {
      id: 'Tansiyon',
      title: 'Tansiyon',
      subtitle: 'Kronik tansiyon yönetimi',
      icon: 'chart-line',
      iconType: 'FontAwesome5'
    },
    {
      id: 'Hiçbiri',
      title: 'Hiçbiri',
      subtitle: 'Teşhis edilmiş kronik durum yok',
      icon: 'ban',
      iconType: 'FontAwesome5'
    }
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.logoRow} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={colors.primary} style={{ marginRight: 12 }} />
          <View style={[styles.miniLogo, { backgroundColor: colors.primary }]}>
            <FontAwesome5 name="shield-alt" size={12} color="#FFF" />
          </View>
          <ThemedText style={[styles.brandText, { color: colors.primary }]}>ChronicTrack</ThemedText>
        </TouchableOpacity>
        <ThemedText style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '600' }}>
          Adım 2 / 2
        </ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.pageHeader}>
          <ThemedText type="title" style={styles.pageTitle}>Aşağıdaki durumlardan herhangi biri teşhis edildi mi?</ThemedText>
          <ThemedText type="secondary" style={styles.pageSubtitle}>
            Birden fazla seçenek belirleyebilirsiniz
          </ThemedText>
        </View>

        <View style={styles.listContainer}>
          {conditions.map((item) => {
            const isSelected = selectedConditions.includes(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.card,
                  { backgroundColor: colors.cardBackground },
                  isSelected && { borderColor: colors.primary, borderWidth: 1.5, shadowColor: colors.primary, elevation: 2, shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }
                ]}
                onPress={() => toggleCondition(item.id)}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.iconWrapper,
                  { backgroundColor: item.id === 'Hiçbiri' ? '#E5E7EB' : (isSelected ? '#DDF0FF' : '#EAF3FA') }
                ]}>
                  {item.iconType === 'Ionicons' ? (
                    // @ts-ignore
                    <Ionicons name={item.icon} size={24} color={item.id === 'Hiçbiri' ? '#6B7280' : colors.primary} />
                  ) : (
                    <FontAwesome5 name={item.icon} size={22} color={item.id === 'Hiçbiri' ? '#6B7280' : colors.primary} />
                  )}
                </View>

                <View style={styles.textWrapper}>
                  <ThemedText style={styles.itemTitle}>{item.title}</ThemedText>
                  <ThemedText style={styles.itemSubtitle}>{item.subtitle}</ThemedText>
                </View>

                <View style={styles.checkboxWrapper}>
                  {isSelected ? (
                    <View style={[styles.checkedCircle, { backgroundColor: colors.primary }]}>
                      <Ionicons name="checkmark" size={16} color="#FFF" />
                    </View>
                  ) : (
                    <View style={styles.uncheckedCircle} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ flex: 1 }} />

        <View style={styles.bottomSection}>
          <CustomButton
            title="Devam Et"
            onPress={() => {
              // Finish onboarding, go to main app
              router.replace('/(tabs)');
            }}
            style={{ marginBottom: 12 }}
            rightIcon={<Ionicons name="arrow-forward" size={20} color="#FFF" />}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  brandText: {
    fontSize: 16,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    flexGrow: 1,
    paddingBottom: 40,
  },
  pageHeader: {
    marginBottom: 32,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  pageSubtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  listContainer: {
    marginBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'transparent', // default invisible border to take same space
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textWrapper: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  checkboxWrapper: {
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uncheckedCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#C2C8D0',
  },
  bottomSection: {
    marginTop: 40,
    alignItems: 'center',
  },
  encryptionInfo: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    textAlign: 'center',
  }
});
