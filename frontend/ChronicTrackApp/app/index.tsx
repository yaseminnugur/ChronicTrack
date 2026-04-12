import React from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function Index() {
  const { userToken, isOnboarded, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  // If token exists, check if onboarded
  if (userToken) {
    if (isOnboarded) {
      return <Redirect href="/(tabs)" />;
    } else {
      return <Redirect href="/(onboarding)/step1" />;
    }
  }

  return <Redirect href="/(auth)/login" />;
}
