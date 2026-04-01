import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, Platform, Dimensions, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/CustomButton';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function RegisterScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const colors = Colors[theme as keyof typeof Colors];
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = () => {
    // In actual app, validate & register, then go to tabs or login
    // @ts-ignore
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.mainContent}>
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
              <CustomInput
                label="Ad Soyad"
                iconName="person"
                iconType="Ionicons"
                placeholder="Ahmet Yılmaz"
                value={name}
                onChangeText={setName}
              />

              <CustomInput
                label="E-posta"
                iconName="mail"
                iconType="Ionicons"
                placeholder="isim@ornek.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />

              <CustomInput
                label="Şifre"
                iconName="lock-closed"
                iconType="Ionicons"
                placeholder="••••••••"
                isPassword={!showPassword}
                value={password}
                onChangeText={setPassword}
                rightIconName={showPassword ? 'eye-off' : 'eye'}
                rightIconType="Ionicons"
                onRightIconPress={() => setShowPassword(!showPassword)}
              />

              <CustomInput
                label="Şifre Tekrar"
                iconName="shield-checkmark"
                iconType="Ionicons"
                placeholder="••••••••"
                isPassword={true}
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
              />

              <View style={styles.termsContainer}>
                <ThemedText style={[styles.termsText, { color: colors.textSecondary }]}>
                  Kayıt Ol butonuna tıklayarak,{' '}
                  <ThemedText type="link" onPress={() => console.log('Hizmet Şartları')} style={{fontSize: 12}}>
                    Hizmet Şartlarımızı
                  </ThemedText>
                  {' '}ve{' '}
                  <ThemedText type="link" onPress={() => console.log('Gizlilik Politikası')} style={{fontSize: 12}}>
                    Gizlilik Politikamızı
                  </ThemedText>
                  {' '}kabul etmiş sayılırsınız.
                </ThemedText>
              </View>

              <CustomButton
                title="Kayıt Ol"
                onPress={handleRegister}
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
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContent: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
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
