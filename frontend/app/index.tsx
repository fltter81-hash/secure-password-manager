import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { isPinSetup, isSessionActive } from '../services/auth';
import { usePasswordStore } from '../store/passwordStore';
import { darkTheme } from '../constants/theme';

export default function IndexPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const settings = usePasswordStore((state) => state.settings);
  const theme = settings.theme === 'dark' ? darkTheme : darkTheme; // İlk yüklemede her zaman dark
  
  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  async function checkAuthStatus() {
    try {
      // PIN kurulmuş mu kontrol et
      const pinSetup = await isPinSetup();
      
      if (!pinSetup) {
        // PIN kurulmamış, kurulum ekranına git
        router.replace('/setup-pin');
        return;
      }
      
      // Session aktif mi kontrol et
      const sessionActive = await isSessionActive();
      
      if (sessionActive) {
        // Oturum aktif, ana ekrana git
        router.replace('/(authenticated)/passwords');
      } else {
        // Giriş ekranına git
        router.replace('/login');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // Hata durumunda giriş ekranına yönlendir
      router.replace('/login');
    } finally {
      setIsChecking(false);
    }
  }
  
  if (isChecking) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.text, { color: theme.text }]}>Yükleniyor...</Text>
      </View>
    );
  }
  
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
  },
});
