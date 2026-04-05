import * as LocalAuthentication from 'expo-local-authentication';
import * as Crypto from 'expo-crypto';
import {
  getPinHash,
  savePinHash,
  getPinSalt,
  savePinSalt,
  getMasterKey,
  saveMasterKey,
  clearMasterKey,
  getBiometricEnabled,
} from './storage';
import { deriveMasterKey, generateSalt } from './encryption';

// Cihazda biyometrik özellik var mı kontrol et
export async function checkBiometricAvailability(): Promise<boolean> {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return compatible && enrolled;
}

// Biyometrik desteklenen türleri al
export async function getBiometricTypes(): Promise<string[]> {
  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  return types.map((type) => {
    switch (type) {
      case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
        return 'Face ID';
      case LocalAuthentication.AuthenticationType.FINGERPRINT:
        return 'Touch ID';
      case LocalAuthentication.AuthenticationType.IRIS:
        return 'Iris';
      default:
        return 'Biyometrik';
    }
  });
}

// PIN'i hash'le
export async function hashPin(pin: string, salt: string): Promise<string> {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    pin + salt,
    { encoding: Crypto.CryptoEncoding.HEX }
  );
}

// PIN kurulumu yap
export async function setupPin(pin: string): Promise<void> {
  const salt = generateSalt();
  const hash = await hashPin(pin, salt);
  
  await savePinSalt(salt);
  await savePinHash(hash);
  
  // Master key oluştur ve kaydet
  const masterKey = await deriveMasterKey(pin, salt);
  await saveMasterKey(masterKey);
}

// PIN doğrula
export async function verifyPin(pin: string): Promise<boolean> {
  const salt = await getPinSalt();
  const savedHash = await getPinHash();
  
  if (!salt || !savedHash) {
    return false;
  }
  
  const hash = await hashPin(pin, salt);
  
  if (hash === savedHash) {
    // PIN doğruysa master key'i oluştur ve kaydet
    const masterKey = await deriveMasterKey(pin, salt);
    await saveMasterKey(masterKey);
    return true;
  }
  
  return false;
}

// PIN kurulmuş mu kontrol et
export async function isPinSetup(): Promise<boolean> {
  const hash = await getPinHash();
  return hash !== null;
}

// Biyometrik doğrulama yap
export async function authenticateWithBiometric(): Promise<boolean> {
  const biometricEnabled = await getBiometricEnabled();
  if (!biometricEnabled) {
    return false;
  }
  
  const available = await checkBiometricAvailability();
  if (!available) {
    return false;
  }
  
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Şifrelerinize erişmek için doğrulayın',
      fallbackLabel: 'PIN kullan',
      disableDeviceFallback: false,
    });
    
    return result.success;
  } catch (error) {
    console.error('Biyometrik doğrulama hatası:', error);
    return false;
  }
}

// Oturum açık mı kontrol et
export async function isSessionActive(): Promise<boolean> {
  const masterKey = await getMasterKey();
  return masterKey !== null;
}

// Çıkış yap
export async function logout(): Promise<void> {
  await clearMasterKey();
}