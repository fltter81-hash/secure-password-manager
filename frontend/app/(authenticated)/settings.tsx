import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePasswordStore } from '../../store/passwordStore';
import { darkTheme, lightTheme } from '../../constants/theme';
import { logout } from '../../services/auth';
import { exportEncryptedBackup } from '../../services/backup';
import * as DocumentPicker from 'expo-document-picker';
import { importEncryptedBackup } from '../../services/backup';
import { setBiometricEnabled, getBiometricEnabled } from '../../services/storage';
import { checkBiometricAvailability } from '../../services/auth';

export default function SettingsPage() {
  const router = useRouter();
  const { settings, updateSettings, passwords, importPasswords } = usePasswordStore();
  const theme = settings.theme === 'dark' ? darkTheme : lightTheme;
  const [biometricEnabled, setBiometricEnabledState] = useState(settings.biometricEnabled);
  
  React.useEffect(() => {
    loadBiometricSetting();
  }, []);
  
  const loadBiometricSetting = async () => {
    const enabled = await getBiometricEnabled();
    setBiometricEnabledState(enabled);
  };
  
  const handleToggleTheme = async () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    await updateSettings({ theme: newTheme });
  };
  
  const handleToggleBiometric = async (value: boolean) => {
    const available = await checkBiometricAvailability();
    if (!available && value) {
      Alert.alert('Uyarı', 'Biyometrik kimlik doğrulama bu cihazda kullanılamıyor.');
      return;
    }
    
    setBiometricEnabledState(value);
    await setBiometricEnabled(value);
    await updateSettings({ biometricEnabled: value });
  };
  
  const handleExportBackup = async () => {
    try {
      await exportEncryptedBackup(passwords);
      Alert.alert('Başarılı', 'Şifreli yedeğiniz oluşturuldu!');
    } catch (error) {
      Alert.alert('Hata', 'Yedek oluşturulamadı.');
    }
  };
  
  const handleImportBackup = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) return;
      
      const importedPasswords = await importEncryptedBackup(result.assets[0].uri);
      await importPasswords(importedPasswords);
      Alert.alert('Başarılı', `${importedPasswords.length} şifre içe aktarıldı!`);
    } catch (error) {
      Alert.alert('Hata', 'Yedek içe aktarılamadı. Dosya geçersiz veya yanlış PIN.');
    }
  };
  
  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Ayarlar</Text>
        </View>
        
        {/* Görünüm */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Görünüm</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons
                name={settings.theme === 'dark' ? 'moon' : 'sunny'}
                size={24}
                color={theme.primary}
              />
              <Text style={[styles.settingText, { color: theme.text }]}>
                {settings.theme === 'dark' ? 'Koyu Tema' : 'Açık Tema'}
              </Text>
            </View>
            <Switch
              value={settings.theme === 'dark'}
              onValueChange={handleToggleTheme}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
        
        {/* Güvenlik */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Güvenlik</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="finger-print" size={24} color={theme.primary} />
              <Text style={[styles.settingText, { color: theme.text }]}>
                Biyometrik Kimlik
              </Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleToggleBiometric}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
        
        {/* Yedekleme */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Yedekleme</Text>
          
          <TouchableOpacity style={styles.settingRow} onPress={handleExportBackup}>
            <View style={styles.settingInfo}>
              <Ionicons name="cloud-upload" size={24} color={theme.primary} />
              <Text style={[styles.settingText, { color: theme.text }]}>
                Şifreli Yedek Oluştur
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
          
          <View style={[styles.separator, { backgroundColor: theme.border }]} />
          
          <TouchableOpacity style={styles.settingRow} onPress={handleImportBackup}>
            <View style={styles.settingInfo}>
              <Ionicons name="cloud-download" size={24} color={theme.primary} />
              <Text style={[styles.settingText, { color: theme.text }]}>
                Yedeği İçe Aktar
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
        
        {/* Bilgi */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Bilgi</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="information-circle" size={24} color={theme.primary} />
              <Text style={[styles.settingText, { color: theme.text }]}>Versiyon</Text>
            </View>
            <Text style={[styles.versionText, { color: theme.textSecondary }]}>1.0.0</Text>
          </View>
          
          <View style={[styles.separator, { backgroundColor: theme.border }]} />
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="key" size={24} color={theme.primary} />
              <Text style={[styles.settingText, { color: theme.text }]}>Toplam Şifre</Text>
            </View>
            <Text style={[styles.versionText, { color: theme.textSecondary }]}>
              {passwords.length}
            </Text>
          </View>
        </View>
        
        {/* Çıkış */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.error }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out" size={24} color="#FFFFFF" />
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>
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
  section: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
  },
  separator: {
    height: 1,
    marginVertical: 4,
  },
  versionText: {
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
