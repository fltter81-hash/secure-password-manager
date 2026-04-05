import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { usePasswordStore } from '../store/passwordStore';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const settings = usePasswordStore((state) => state.settings);
  
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: settings.theme === 'dark' ? '#000000' : '#F2F2F7',
        },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="setup-pin" />
      <Stack.Screen name="login" />
      <Stack.Screen name="(authenticated)" />
      <Stack.Screen name="password/add" options={{ presentation: 'modal' }} />
      <Stack.Screen name="password/[id]" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
