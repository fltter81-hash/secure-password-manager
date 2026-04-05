export interface Password {
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  category: string;
  image?: string; // base64
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  autoLockTimeout: number; // in seconds
  biometricEnabled: boolean;
}

export interface EncryptedData {
  encrypted: string;
  iv: string;
}

export type ThemeMode = 'light' | 'dark';