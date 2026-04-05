import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Password, AppSettings } from '../types';
import { encryptData, decryptData } from './encryption';

const KEYS = {
  PIN_HASH: 'pin_hash',
  PIN_SALT: 'pin_salt',
  MASTER_KEY: 'master_key',
  PASSWORDS: 'passwords_encrypted',
  SETTINGS: 'app_settings',
  BIOMETRIC_ENABLED: 'biometric_enabled',
};

// PIN hash'i kaydet
export async function savePinHash(hash: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.PIN_HASH, hash);
}

// PIN hash'i al
export async function getPinHash(): Promise<string | null> {
  return await SecureStore.getItemAsync(KEYS.PIN_HASH);
}

// PIN salt'ı kaydet
export async function savePinSalt(salt: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.PIN_SALT, salt);
}

// PIN salt'ı al
export async function getPinSalt(): Promise<string | null> {
  return await SecureStore.getItemAsync(KEYS.PIN_SALT);
}

// Master key'i geçici olarak kaydet (session için)
export async function saveMasterKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.MASTER_KEY, key);
}

// Master key'i al
export async function getMasterKey(): Promise<string | null> {
  return await SecureStore.getItemAsync(KEYS.MASTER_KEY);
}

// Master key'i sil (logout)
export async function clearMasterKey(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.MASTER_KEY);
}

// Şifreleri kaydet (şifreli)
export async function savePasswords(passwords: Password[], masterKey: string): Promise<void> {
  const json = JSON.stringify(passwords);
  const { encrypted, iv } = await encryptData(json, masterKey);
  const data = JSON.stringify({ encrypted, iv });
  await SecureStore.setItemAsync(KEYS.PASSWORDS, data);
}

// Şifreleri al (deşifreli)
export async function getPasswords(masterKey: string): Promise<Password[]> {
  try {
    const data = await SecureStore.getItemAsync(KEYS.PASSWORDS);
    if (!data) return [];
    
    const { encrypted, iv } = JSON.parse(data);
    const decrypted = await decryptData(encrypted, iv, masterKey);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Şifreleri okuma hatası:', error);
    return [];
  }
}

// Ayarları kaydet
export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

// Ayarları al
export async function getSettings(): Promise<AppSettings | null> {
  const data = await AsyncStorage.getItem(KEYS.SETTINGS);
  return data ? JSON.parse(data) : null;
}

// Biyometrik ayarını kaydet
export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.BIOMETRIC_ENABLED, JSON.stringify(enabled));
}

// Biyometrik ayarını al
export async function getBiometricEnabled(): Promise<boolean> {
  const data = await AsyncStorage.getItem(KEYS.BIOMETRIC_ENABLED);
  return data ? JSON.parse(data) : false;
}

// Tüm verileri sil (factory reset)
export async function clearAllData(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.PIN_HASH);
  await SecureStore.deleteItemAsync(KEYS.PIN_SALT);
  await SecureStore.deleteItemAsync(KEYS.MASTER_KEY);
  await SecureStore.deleteItemAsync(KEYS.PASSWORDS);
  await AsyncStorage.removeItem(KEYS.SETTINGS);
  await AsyncStorage.removeItem(KEYS.BIOMETRIC_ENABLED);
}