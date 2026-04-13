import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthContextType = {
  userToken: string | null;
  isOnboarded: boolean;
  isLoading: boolean;
  signIn: (token: string, onboarded: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const onboardStatus = await AsyncStorage.getItem('isOnboarded');
        setUserToken(token);
        setIsOnboarded(onboardStatus === 'true');
      } catch (e) {
        console.error('Failed to load token', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, []);

  const signIn = async (token: string, onboarded: boolean) => {
    try {
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('isOnboarded', onboarded ? 'true' : 'false');
      setUserToken(token);
      setIsOnboarded(onboarded);
    } catch (e) {
      console.error('Failed to save token', e);
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('isOnboarded');
      setUserToken(null);
      setIsOnboarded(false);
    } catch (e) {
      console.error('Failed to remove token', e);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('isOnboarded', 'true');
      setIsOnboarded(true);
    } catch (e) {
      console.error('Failed to save onboard setting', e);
    }
  };

  return (
    <AuthContext.Provider value={{ userToken, isOnboarded, isLoading, signIn, signOut, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
}
