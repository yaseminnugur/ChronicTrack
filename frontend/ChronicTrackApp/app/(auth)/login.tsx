import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Platform, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/CustomButton';
import { FontAwesome5 } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { router } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Backend URL from environment variables
const API_URL = process.env.EXPO_PUBLIC_API_URL as string;

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const colors = Colors[theme as keyof typeof Colors];
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      if (response.status === 200) {
        const { token } = response.data;
        // Save token
        await AsyncStorage.setItem('userToken', token);
        // Navigate to onboarding or tabs
        router.replace('/(onboarding)/step1');
      }
    } catch (error: any) {
      console.log('Login Error: ', error.message);
      const message = error.response?.data?.error || 'Giriş yapılamadı.';
      Alert.alert('Hata', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <View style={styles.header}>
          {/* Logo Placeholder */}
          <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
            <FontAwesome5 name="plus" size={24} color="#FFF" />
          </View>
          <ThemedText type="title" style={styles.brandName}>
            ChronicTrack
          </ThemedText>
          <ThemedText type="secondary" style={styles.subtitle}>
            Sağlık yolculuğunuz burada başlıyor.
          </ThemedText>
        </View>

        <ThemedView variant="cardBackground" style={styles.card}>
          <ThemedText type="title" style={styles.cardTitle}>
            Giriş Yap
          </ThemedText>

          <CustomInput
            label="E-posta adresi"
            iconName="mail"
            iconType="Ionicons"
            placeholder="isim@ornek.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <CustomInput
            label="Şifre"
            iconName="lock-closed"
            iconType="Ionicons"
            placeholder="••••••••"
            isPassword={!showPassword}
            value={password}
            onChangeText={setPassword}
            rightLabel="Unuttunuz mu?"
            rightIconName={showPassword ? 'eye-off' : 'eye'}
            rightIconType="Ionicons"
            onRightIconPress={() => setShowPassword(!showPassword)}
            onRightLabelPress={() => console.log('Forgot password action')}
          />

          <CustomButton
            title="Giriş Yap"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          />

          <View style={styles.footerRow}>
            <ThemedText style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '500' }}>
              Hesabınız yok mu?{' '}
            </ThemedText>
            {/* @ts-ignore */}
            <ThemedText type="link" onPress={() => router.push('/(auth)/register')}>
              Kayıt Ol
            </ThemedText>
          </View>
        </ThemedView>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 40,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: 'rgba(19, 120, 198, 0.3)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  card: {
    width: '100%',
    borderRadius: 32,
    padding: 24,
    paddingTop: 32,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
    marginBottom: 40,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 32,
    textAlign: 'center',
  },
  loginButton: {
    marginTop: 16,
    marginBottom: 24,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
