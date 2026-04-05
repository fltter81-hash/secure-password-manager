import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Password } from '../types';
import { encryptData, decryptData } from './encryption';
import { getMasterKey } from './storage';

// Şifreli yedek dosyası oluştur ve paylaş
export async function exportEncryptedBackup(passwords: Password[]): Promise<void> {
  try {
    const masterKey = await getMasterKey();
    if (!masterKey) {
      throw new Error('Oturum geçersiz');
    }
    
    // Verileri JSON'a çevir
    const data = JSON.stringify({
      version: '1.0',
      timestamp: Date.now(),
      passwords,
    });
    
    // Şifrele
    const { encrypted, iv } = await encryptData(data, masterKey);
    const backupData = JSON.stringify({ encrypted, iv });
    
    // Dosyayı kaydet
    const fileName = `password_backup_${new Date().toISOString().split('T')[0]}.pwdenc`;
    const fileUri = FileSystem.documentDirectory + fileName;
    
    await FileSystem.writeAsStringAsync(fileUri, backupData);
    
    // Paylaş (iCloud, dosyalar, vs.)
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/octet-stream',
        dialogTitle: 'Şifreli Yedeği Kaydet',
      });
    }
  } catch (error) {
    console.error('Yedek oluşturma hatası:', error);
    throw new Error('Yedek oluşturulamadı');
  }
}

// Şifreli yedeği içe aktar
export async function importEncryptedBackup(fileUri: string): Promise<Password[]> {
  try {
    const masterKey = await getMasterKey();
    if (!masterKey) {
      throw new Error('Oturum geçersiz');
    }
    
    // Dosyayı oku
    const backupData = await FileSystem.readAsStringAsync(fileUri);
    const { encrypted, iv } = JSON.parse(backupData);
    
    // Deşifre et
    const decrypted = await decryptData(encrypted, iv, masterKey);
    const data = JSON.parse(decrypted);
    
    // Versiyon kontrolü
    if (data.version !== '1.0') {
      throw new Error('Geçersiz yedek dosyası versiyonu');
    }
    
    return data.passwords || [];
  } catch (error) {
    console.error('Yedek içe aktarma hatası:', error);
    throw new Error('Yedek içe aktarılamadı - dosya bozuk veya yanlış PIN');
  }
}

// JSON olarak dışa aktar (şifresiz - test amaçlı)
export async function exportPlainJSON(passwords: Password[]): Promise<void> {
  try {
    const data = JSON.stringify(passwords, null, 2);
    const fileName = `passwords_${new Date().toISOString().split('T')[0]}.json`;
    const fileUri = FileSystem.documentDirectory + fileName;
    
    await FileSystem.writeAsStringAsync(fileUri, data);
    
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Şifreleri Kaydet',
      });
    }
  } catch (error) {
    console.error('Dışa aktarma hatası:', error);
    throw new Error('Dışa aktarılamadı');
  }
}