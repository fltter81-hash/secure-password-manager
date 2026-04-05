import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePasswordStore } from '../../store/passwordStore';
import { darkTheme, lightTheme } from '../../constants/theme';

export default function AuthenticatedLayout() {
  const settings = usePasswordStore((state) => state.settings);
  const theme = settings.theme === 'dark' ? darkTheme : lightTheme;
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="passwords"
        options={{
          title: 'Şifreler',
          tabBarIcon: ({ color, size }) => <Ionicons name="key" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="generator"
        options={{
          title: 'Oluşturucu',
          tabBarIcon: ({ color, size }) => <Ionicons name="shuffle" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Kategoriler',
          tabBarIcon: ({ color, size }) => <Ionicons name="grid" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ayarlar',
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
