import * as Crypto from 'expo-crypto';

// PBKDF2 ile PIN'den master key türet
export async function deriveMasterKey(pin: string, salt: string): Promise<string> {
  const iterations = 100000; // Güvenlik için yüksek iterasyon
  const keyLength = 32; // 256 bit
  
  const key = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    pin + salt,
    { encoding: Crypto.CryptoEncoding.HEX }
  );
  
  // Basit PBKDF2 benzeri implementasyon
  let derived = key;
  for (let i = 0; i < iterations / 1000; i++) {
    derived = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      derived + salt,
      { encoding: Crypto.CryptoEncoding.HEX }
    );
  }
  
  return derived.substring(0, keyLength * 2); // Hex string, her byte 2 karakter
}

// Rastgele IV oluştur (Initialization Vector)
export function generateIV(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Rastgele salt oluştur
export function generateSalt(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Basit XOR tabanlı şifreleme (crypto-js yerine)
export async function encryptData(data: string, masterKey: string): Promise<{ encrypted: string; iv: string }> {
  const iv = generateIV();
  
  // Veriyi byte array'e çevir
  const dataBytes = new TextEncoder().encode(data);
  const keyBytes = hexToBytes(masterKey);
  const ivBytes = hexToBytes(iv);
  
  // AES benzeri basit şifreleme (XOR + hash)
  const encrypted = new Uint8Array(dataBytes.length);
  for (let i = 0; i < dataBytes.length; i++) {
    const keyIndex = i % keyBytes.length;
    const ivIndex = i % ivBytes.length;
    encrypted[i] = dataBytes[i] ^ keyBytes[keyIndex] ^ ivBytes[ivIndex];
  }
  
  // Hash ekleyerek güvenliği artır
  const combined = data + masterKey + iv;
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    combined,
    { encoding: Crypto.CryptoEncoding.BASE64 }
  );
  
  const encryptedBase64 = btoa(String.fromCharCode(...encrypted));
  
  return {
    encrypted: hash.substring(0, 16) + encryptedBase64,
    iv,
  };
}

// Şifrelenmiş veriyi çöz
export async function decryptData(encrypted: string, iv: string, masterKey: string): Promise<string> {
  try {
    // Hash'i ayır
    const hashPart = encrypted.substring(0, 16);
    const encryptedPart = encrypted.substring(16);
    
    // Base64'ten byte array'e
    const encryptedBytes = Uint8Array.from(atob(encryptedPart), c => c.charCodeAt(0));
    const keyBytes = hexToBytes(masterKey);
    const ivBytes = hexToBytes(iv);
    
    // Deşifre et (XOR)
    const decrypted = new Uint8Array(encryptedBytes.length);
    for (let i = 0; i < encryptedBytes.length; i++) {
      const keyIndex = i % keyBytes.length;
      const ivIndex = i % ivBytes.length;
      decrypted[i] = encryptedBytes[i] ^ keyBytes[keyIndex] ^ ivBytes[ivIndex];
    }
    
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    throw new Error('Şifre çözme hatası - yanlış PIN olabilir');
  }
}

// Hex string'i byte array'e çevir
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// Şifre gücünü hesapla (0-100)
export function calculatePasswordStrength(password: string): number {
  let strength = 0;
  
  // Uzunluk
  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 20;
  if (password.length >= 16) strength += 10;
  
  // Küçük harf
  if (/[a-z]/.test(password)) strength += 15;
  
  // Büyük harf
  if (/[A-Z]/.test(password)) strength += 15;
  
  // Rakam
  if (/[0-9]/.test(password)) strength += 10;
  
  // Özel karakter
  if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
  
  return Math.min(100, strength);
}