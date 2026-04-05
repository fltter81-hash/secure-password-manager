import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { verifyPin, authenticateWithBiometric, checkBiometricAvailability } from '../services/auth';
import { getBiometricEnabled } from '../services/storage';
import { usePasswordStore } from '../store/passwordStore';
import { darkTheme } from '../constants/theme';

export default function LoginPage() {
  const router = useRouter();
  const loadPasswords = usePasswordStore((state) => state.loadPasswords);
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showBiometric, setShowBiometric] = useState(false);
  const theme = darkTheme;
  
  useEffect(() => {
    checkAndPromptBiometric();
  }, []);
  
  const checkAndPromptBiometric = async () => {
    const biometricEnabled = await getBiometricEnabled();
    const biometricAvailable = await checkBiometricAvailability();
    
    if (biometricEnabled && biometricAvailable) {
      setShowBiometric(true);
      // Otomatik olarak biyometrik istemi göster
      setTimeout(() => {
        handleBiometricAuth();
      }, 500);
    }
  };
  
  const handleBiometricAuth = async () => {
    try {
      const success = await authenticateWithBiometric();
      if (success) {
        // Biyometrik başarılı, şifreleri yükle ve ana ekrana git
        await loadPasswords();
        router.replace('/(authenticated)/passwords');
      }
    } catch (error) {
      console.error('Biometric auth error:', error);
    }
  };
  
  const handleNumberPress = (num: string) => {
    if (pin.length < 6) {
      const newPin = pin + num;
      setPin(newPin);
      
      if (newPin.length === 6) {
        setTimeout(() => {
          handleLogin(newPin);
        }, 300);
      }
    }
  };
  
  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };
  
  const handleLogin = async (finalPin: string) => {
    try {
      setIsLoading(true);
      
      const success = await verifyPin(finalPin);
      
      if (success) {
        // PIN doğru, şifreleri yükle
        await loadPasswords();
        router.replace('/(authenticated)/passwords');
      } else {
        Alert.alert('Hata', 'Yanlış PIN kodu!');
        setPin('');
      }
    } catch (error) {
      Alert.alert('Hata', 'Giriş yapılamadı. Lütfen tekrar deneyin.');
      setPin('');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="lock-closed" size={80} color={theme.primary} />
            <Text style={[styles.title, { color: theme.text }]}>Şifre Yöneticisi</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Devam etmek için PIN\'inizi girin
            </Text>
          </View>
          
          {/* PIN Dots */}
          <View style={styles.pinContainer}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <View
                key={i}
                style={[
                  styles.pinDot,
                  {
                    backgroundColor: pin.length > i ? theme.primary : 'transparent',
                    borderColor: theme.border,
                  },
                ]}
              />
            ))}
          </View>
          
          {/* Biometric Button */}
          {showBiometric && (
            <TouchableOpacity
              style={styles.biometricButton}
              onPress={handleBiometricAuth}
              disabled={isLoading}
            >
              <Ionicons name="finger-print" size={32} color={theme.primary} />
              <Text style={[styles.biometricText, { color: theme.textSecondary }]}>
                Biyometrik ile Giriş
              </Text>
            </TouchableOpacity>
          )}
          
          {/* Number Pad */}
          <View style={styles.numberPad}>
            {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['', '0', 'back']].map(
              (row, rowIndex) => (
                <View key={rowIndex} style={styles.numberRow}>
                  {row.map((num) => {
                    if (num === '') {
                      return <View key="empty" style={styles.numberButton} />;
                    }
                    if (num === 'back') {
                      return (
                        <TouchableOpacity
                          key="back"
                          style={styles.numberButton}
                          onPress={handleBackspace}
                          disabled={isLoading}
                        >
                          <Ionicons name="backspace-outline" size={28} color={theme.text} />
                        </TouchableOpacity>
                      );
                    }
                    return (
                      <TouchableOpacity
                        key={num}
                        style={[
                          styles.numberButton,
                          { backgroundColor: theme.cardBackground },
                        ]}
                        onPress={() => handleNumberPress(num)}
                        disabled={isLoading}
                      >
                        <Text style={[styles.numberText, { color: theme.text }]}>{num}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-around',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 24,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 40,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  biometricButton: {
    alignItems: 'center',
    marginBottom: 24,
  },
  biometricText: {
    marginTop: 8,
    fontSize: 16,
  },
  numberPad: {
    gap: 16,
    marginBottom: 40,
  },
  numberRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  numberButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    fontSize: 28,
    fontWeight: '500',
  },
});
