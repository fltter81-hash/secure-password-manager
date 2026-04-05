import React, { useState } from 'react';
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
import { setupPin } from '../services/auth';
import { setBiometricEnabled } from '../services/storage';
import { checkBiometricAvailability } from '../services/auth';
import { darkTheme, lightTheme } from '../constants/theme';

export default function SetupPinPage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [isLoading, setIsLoading] = useState(false);
  const theme = darkTheme; // Kurulum her zaman dark tema
  
  const handleNumberPress = (num: string) => {
    if (step === 'enter') {
      if (pin.length < 6) {
        const newPin = pin + num;
        setPin(newPin);
        
        if (newPin.length === 6) {
          setTimeout(() => {
            setStep('confirm');
          }, 300);
        }
      }
    } else {
      if (confirmPin.length < 6) {
        const newConfirmPin = confirmPin + num;
        setConfirmPin(newConfirmPin);
        
        if (newConfirmPin.length === 6) {
          setTimeout(() => {
            handleConfirm(newConfirmPin);
          }, 300);
        }
      }
    }
  };
  
  const handleBackspace = () => {
    if (step === 'enter') {
      setPin(pin.slice(0, -1));
    } else {
      setConfirmPin(confirmPin.slice(0, -1));
    }
  };
  
  const handleConfirm = async (finalConfirmPin: string) => {
    if (pin !== finalConfirmPin) {
      Alert.alert('Hata', 'PIN kodları eşleşmiyor!', [
        {
          text: 'Tekrar Dene',
          onPress: () => {
            setPin('');
            setConfirmPin('');
            setStep('enter');
          },
        },
      ]);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // PIN'i kaydet
      await setupPin(pin);
      
      // Biyometrik özelliği kontrol et ve aktif et
      const biometricAvailable = await checkBiometricAvailability();
      if (biometricAvailable) {
        await setBiometricEnabled(true);
      }
      
      // Başarılı, ana ekrana yönlendir
      router.replace('/(authenticated)/passwords');
    } catch (error) {
      Alert.alert('Hata', 'PIN kaydedilemedi. Lütfen tekrar deneyin.');
      setPin('');
      setConfirmPin('');
      setStep('enter');
    } finally {
      setIsLoading(false);
    }
  };
  
  const currentPin = step === 'enter' ? pin : confirmPin;
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="shield-checkmark" size={80} color={theme.primary} />
            <Text style={[styles.title, { color: theme.text }]}>
              {step === 'enter' ? 'PIN Oluştur' : 'PIN\'i Onayla'}
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {step === 'enter'
                ? 'Şifrelerinizi korumak için 6 haneli PIN oluşturun'
                : 'PIN\'inizi tekrar girin'}
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
                    backgroundColor:
                      currentPin.length > i ? theme.primary : 'transparent',
                    borderColor: theme.border,
                  },
                ]}
              />
            ))}
          </View>
          
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
    paddingHorizontal: 32,
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
