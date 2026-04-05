import { create } from 'zustand';
import { Password, AppSettings, Category } from '../types';
import { savePasswords, getPasswords, getMasterKey, saveSettings, getSettings } from '../services/storage';
import { DEFAULT_CATEGORIES } from '../constants/categories';

interface PasswordStore {
  passwords: Password[];
  categories: Category[];
  settings: AppSettings;
  isLoading: boolean;
  searchQuery: string;
  selectedCategory: string | null;
  
  // Actions
  loadPasswords: () => Promise<void>;
  addPassword: (password: Omit<Password, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePassword: (id: string, password: Partial<Password>) => Promise<void>;
  deletePassword: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (categoryId: string | null) => void;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  importPasswords: (passwords: Password[]) => Promise<void>;
  
  // Getters
  getFilteredPasswords: () => Password[];
  getPasswordById: (id: string) => Password | undefined;
}

export const usePasswordStore = create<PasswordStore>((set, get) => ({
  passwords: [],
  categories: DEFAULT_CATEGORIES,
  settings: {
    theme: 'dark',
    autoLockTimeout: 60,
    biometricEnabled: true,
  },
  isLoading: false,
  searchQuery: '',
  selectedCategory: null,
  
  loadPasswords: async () => {
    try {
      set({ isLoading: true });
      const masterKey = await getMasterKey();
      if (!masterKey) {
        throw new Error('No master key');
      }
      
      const passwords = await getPasswords(masterKey);
      const settings = await getSettings();
      
      set({
        passwords,
        settings: settings || get().settings,
        isLoading: false,
      });
    } catch (error) {
      console.error('Load passwords error:', error);
      set({ isLoading: false });
    }
  },
  
  addPassword: async (passwordData) => {
    try {
      const newPassword: Password = {
        ...passwordData,
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      const passwords = [...get().passwords, newPassword];
      const masterKey = await getMasterKey();
      if (!masterKey) throw new Error('No master key');
      
      await savePasswords(passwords, masterKey);
      set({ passwords });
    } catch (error) {
      console.error('Add password error:', error);
      throw error;
    }
  },
  
  updatePassword: async (id, updates) => {
    try {
      const passwords = get().passwords.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
      );
      
      const masterKey = await getMasterKey();
      if (!masterKey) throw new Error('No master key');
      
      await savePasswords(passwords, masterKey);
      set({ passwords });
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  },
  
  deletePassword: async (id) => {
    try {
      const passwords = get().passwords.filter((p) => p.id !== id);
      
      const masterKey = await getMasterKey();
      if (!masterKey) throw new Error('No master key');
      
      await savePasswords(passwords, masterKey);
      set({ passwords });
    } catch (error) {
      console.error('Delete password error:', error);
      throw error;
    }
  },
  
  toggleFavorite: async (id) => {
    try {
      const passwords = get().passwords.map((p) =>
        p.id === id ? { ...p, isFavorite: !p.isFavorite, updatedAt: Date.now() } : p
      );
      
      const masterKey = await getMasterKey();
      if (!masterKey) throw new Error('No master key');
      
      await savePasswords(passwords, masterKey);
      set({ passwords });
    } catch (error) {
      console.error('Toggle favorite error:', error);
      throw error;
    }
  },
  
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },
  
  setSelectedCategory: (categoryId) => {
    set({ selectedCategory: categoryId });
  },
  
  updateSettings: async (newSettings) => {
    try {
      const settings = { ...get().settings, ...newSettings };
      await saveSettings(settings);
      set({ settings });
    } catch (error) {
      console.error('Update settings error:', error);
      throw error;
    }
  },
  
  importPasswords: async (importedPasswords) => {
    try {
      // Mevcut şifrelerle birleştir (ID çakışması olmaması için yeni ID'ler ver)
      const newPasswords = importedPasswords.map(p => ({
        ...p,
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      }));
      
      const passwords = [...get().passwords, ...newPasswords];
      
      const masterKey = await getMasterKey();
      if (!masterKey) throw new Error('No master key');
      
      await savePasswords(passwords, masterKey);
      set({ passwords });
    } catch (error) {
      console.error('Import passwords error:', error);
      throw error;
    }
  },
  
  getFilteredPasswords: () => {
    const { passwords, searchQuery, selectedCategory } = get();
    
    let filtered = passwords;
    
    // Kategori filtresi
    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }
    
    // Arama filtresi
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.username.toLowerCase().includes(query) ||
          (p.url && p.url.toLowerCase().includes(query)) ||
          (p.notes && p.notes.toLowerCase().includes(query))
      );
    }
    
    // Favoriler önce, sonra tarihe göre sırala
    return filtered.sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return b.updatedAt - a.updatedAt;
    });
  },
  
  getPasswordById: (id) => {
    return get().passwords.find((p) => p.id === id);
  },
}));
