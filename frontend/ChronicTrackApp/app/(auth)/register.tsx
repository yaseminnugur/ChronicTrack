import React, { useState } from 'react';
import { StyleSheet, View, Platform, Dimensions, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ControlledInput } from '@/components/ControlledInput';
import { CustomButton } from '@/components/CustomButton';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormData } from '@/validations/auth';
import { api } from '../../services/api';

const { width } = Dimensions.get('window');

export default function RegisterScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const colors = Colors[theme as keyof typeof Colors];

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      passwordConfirm: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (response.status === 201) {
        Alert.alert('Başarılı', 'Kayıt işlemi başarılı. Lütfen giriş yapın.', [
          { text: 'Tamam', onPress: () => router.replace('/(auth)/login') }
        ]);
      }
    } catch (error: any) {
      console.log('Register Error: ', error.message);
      const message = error.response?.data?.error || 'Bir hata oluştu.';
      Alert.alert('Hata', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.mainContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <View style={[styles.logoContainer, { backgroundColor: '#E1EBF9' }]}>
                <FontAwesome5 name="shield-alt" size={24} color={colors.primary} />
              </View>
              <ThemedText type="title" style={styles.brandName}>
                Kayıt Ol
              </ThemedText>
              <ThemedText type="secondary" style={styles.subtitle}>
                Daha iyi bir sağlık yolculuğuna bugün ChronicTrack ile başlayın.
              </ThemedText>
            </View>

            <ThemedView variant="cardBackground" style={styles.card}>
              <ControlledInput
                control={control}
                name="name"
                label="Ad Soyad"
                iconName="person"
                iconType="Ionicons"
                placeholder="Ahmet Yılmaz"
              />

              <ControlledInput
                control={control}
                name="email"
                label="E-posta"
                iconName="mail"
                iconType="Ionicons"
                placeholder="isim@ornek.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <ControlledInput
                control={control}
                name="password"
                label="Şifre"
                iconName="lock-closed"
                iconType="Ionicons"
                placeholder="••••••••"
                isPassword={!showPassword}
                rightIconName={showPassword ? 'eye-off' : 'eye'}
                rightIconType="Ionicons"
                onRightIconPress={() => setShowPassword(!showPassword)}
              />

              <ControlledInput
                control={control}
                name="passwordConfirm"
                label="Şifre Tekrar"
                iconName="shield-checkmark"
                iconType="Ionicons"
                placeholder="••••••••"
                isPassword={true}
              />

              <View style={styles.termsContainer}>
                <ThemedText style={[styles.termsText, { color: colors.textSecondary }]}>
                  Kayıt Ol butonuna tıklayarak,{' '}
                  <ThemedText type="link" onPress={() => console.log('Hizmet Şartları')} style={{ fontSize: 12 }}>
                    Hizmet Şartlarımızı
                  </ThemedText>
                  {' '}ve{' '}
                  <ThemedText type="link" onPress={() => console.log('Gizlilik Politikası')} style={{ fontSize: 12 }}>
                    Gizlilik Politikamızı
                  </ThemedText>
                  {' '}kabul etmiş sayılırsınız.
                </ThemedText>
              </View>

              <CustomButton
                title="Kayıt Ol"
                onPress={handleSubmit(onSubmit)}
                loading={loading}
                style={styles.registerButton}
                rightIcon={<Ionicons name="arrow-forward" size={18} color="#FFF" />}
              />

              <View style={styles.footerRow}>
                <ThemedText style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '500' }}>
                  Zaten bir hesabınız var mı?{' '}
                </ThemedText>
                {/* @ts-ignore */}
                <ThemedText type="link" onPress={() => router.back()}>
                  Giriş Yap
                </ThemedText>
              </View>
            </ThemedView>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 8,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
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
  termsContainer: {
    marginBottom: 20,
    marginTop: -4,
  },
  termsText: {
    fontSize: 12,
    lineHeight: 18,
  },
  registerButton: {
    marginBottom: 24,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
