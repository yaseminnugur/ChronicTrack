import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: 80,
          paddingTop: 8,
          paddingBottom: 24,
          backgroundColor: '#FFFFFF',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ana Ekran',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="diabetes"
        options={{
          title: 'Diyabet',
          tabBarIcon: ({ color }) => <FontAwesome5 size={20} name="tint" color={color} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: focused ? '#1E3A8A' : '#2563EB',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16,
              shadowColor: '#2563EB',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}>
              <Ionicons name="add" size={28} color="#FFF" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="bloodPressure"
        options={{
          title: 'Tansiyon',
          tabBarIcon: ({ color }) => <FontAwesome5 size={20} name="heartbeat" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <FontAwesome5 size={24} name="user-circle" color={color} />,
        }}
      />
    </Tabs>
  );
}
