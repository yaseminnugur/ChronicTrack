import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CustomButton } from '@/components/CustomButton';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const colors = Colors[theme as keyof typeof Colors];

  const handleLogout = () => {
    // Navigate back to auth flow
    // @ts-ignore
    router.replace('/(auth)/login');
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
        <ThemedText type="title">Profil</ThemedText>
        <ThemedText style={{ marginTop: 10, textAlign: 'center', marginBottom: 20 }}>
          Kullanıcı profil ayarları burada olacak.
        </ThemedText>
        
        <CustomButton 
          title="Çıkış Yap" 
          variant="outline" 
          onPress={handleLogout}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    padding: 24,
    borderRadius: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  },
});
