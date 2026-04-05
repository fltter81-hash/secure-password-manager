import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  Switch,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { usePasswordStore } from '../../store/passwordStore';
import { darkTheme, lightTheme } from '../../constants/theme';
import { calculatePasswordStrength } from '../../services/encryption';

export default function GeneratorPage() {
  const settings = usePasswordStore((state) => state.settings);
  const theme = settings.theme === 'dark' ? darkTheme : lightTheme;
  
  const [length, setLength] = useState(16);
  const [useUppercase, setUseUppercase] = useState(true);
  const [useLowercase, setUseLowercase] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState('');
  
  const generatePassword = () => {
    let charset = '';
    if (useUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (useNumbers) charset += '0123456789';
    if (useSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (charset === '') {
      Alert.alert('Hata', 'En az bir karakter türü seçmelisiniz!');
      return;
    }
    
    let password = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      password += charset[array[i] % charset.length];
    }
    
    setGeneratedPassword(password);
  };
  
  const copyToClipboard = async () => {
    if (!generatedPassword) {
      Alert.alert('Hata', 'Önce bir şifre oluşturun!');
      return;
    }
    
    await Clipboard.setStringAsync(generatedPassword);
    Alert.alert('Başarılı', 'Şifre panoya kopyalandı!');
  };
  
  const strength = generatedPassword ? calculatePasswordStrength(generatedPassword) : 0;
  
  const getStrengthColor = () => {
    if (strength < 40) return theme.error;
    if (strength < 70) return theme.warning;
    return theme.success;
  };
  
  const getStrengthText = () => {
    if (strength < 40) return 'Zayıf';
    if (strength < 70) return 'Orta';
    return 'Güçlü';
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Şifre Oluşturucu</Text>
        </View>
        
        {/* Oluşturulan Şifre */}
        <View style={[styles.passwordContainer, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          {generatedPassword ? (
            <>
              <TextInput
                style={[styles.passwordText, { color: theme.text }]}
                value={generatedPassword}
                editable={false}
                multiline
                numberOfLines={3}
              />
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBar}>
                  <View
                    style={[
                      styles.strengthFill,
                      {
                        width: `${strength}%`,
                        backgroundColor: getStrengthColor(),
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.strengthText, { color: getStrengthColor() }]}>
                  {getStrengthText()}
                </Text>
              </View>
            </>
          ) : (
            <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
              Şifre burada görünecek
            </Text>
          )}
        </View>
        
        {/* Uzunluk Ayarı */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Uzunluk: {length}</Text>
          <View style={styles.sliderContainer}>
            <Text style={[styles.sliderLabel, { color: theme.textSecondary }]}>8</Text>
            <View style={styles.slider}>
              {[8, 12, 16, 20, 24, 28, 32].map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[
                    styles.sliderDot,
                    {
                      backgroundColor: length >= val ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => setLength(val)}
                />
              ))}
            </View>
            <Text style={[styles.sliderLabel, { color: theme.textSecondary }]}>32</Text>
          </View>
        </View>
        
        {/* Seçenekler */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Karakter Türleri</Text>
          
          <View style={styles.option}>
            <Text style={[styles.optionText, { color: theme.text }]}>Büyük Harf (A-Z)</Text>
            <Switch
              value={useUppercase}
              onValueChange={setUseUppercase}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <View style={styles.option}>
            <Text style={[styles.optionText, { color: theme.text }]}>Küçük Harf (a-z)</Text>
            <Switch
              value={useLowercase}
              onValueChange={setUseLowercase}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <View style={styles.option}>
            <Text style={[styles.optionText, { color: theme.text }]}>Rakamlar (0-9)</Text>
            <Switch
              value={useNumbers}
              onValueChange={setUseNumbers}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <View style={styles.option}>
            <Text style={[styles.optionText, { color: theme.text }]}>Özel Karakterler (!@#$%)</Text>
            <Switch
              value={useSymbols}
              onValueChange={setUseSymbols}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
        
        {/* Butonlar */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.generateButton, { backgroundColor: theme.primary }]}
            onPress={generatePassword}
          >
            <Ionicons name="refresh" size={24} color="#FFFFFF" />
            <Text style={styles.buttonText}>Şifre Oluştur</Text>
          </TouchableOpacity>
          
          {generatedPassword && (
            <TouchableOpacity
              style={[styles.button, styles.copyButton, { backgroundColor: theme.secondary }]}
              onPress={copyToClipboard}
            >
              <Ionicons name="copy" size={24} color="#FFFFFF" />
              <Text style={styles.buttonText}>Kopyala</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  header: {
    paddingVertical: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  passwordContainer: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 120,
    justifyContent: 'center',
  },
  passwordText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 16,
    textAlign: 'center',
  },
  strengthContainer: {
    gap: 8,
  },
  strengthBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 4,
  },
  strengthText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    padding: 20,
    borderRadius: 16,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  slider: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  optionText: {
    fontSize: 16,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  generateButton: {},
  copyButton: {},
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
