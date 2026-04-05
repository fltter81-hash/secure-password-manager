import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePasswordStore } from '../../store/passwordStore';
import { darkTheme, lightTheme } from '../../constants/theme';
import PasswordCard from '../../components/PasswordCard';

export default function PasswordsPage() {
  const router = useRouter();
  const {
    getFilteredPasswords,
    setSearchQuery,
    searchQuery,
    selectedCategory,
    setSelectedCategory,
    loadPasswords,
    isLoading,
    settings,
  } = usePasswordStore();
  
  const theme = settings.theme === 'dark' ? darkTheme : lightTheme;
  const [localSearch, setLocalSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    loadPasswords();
  }, []);
  
  const passwords = getFilteredPasswords();
  
  const handleSearch = (text: string) => {
    setLocalSearch(text);
    setSearchQuery(text);
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPasswords();
    setRefreshing(false);
  };
  
  const handlePasswordPress = (id: string) => {
    router.push(`/password/${id}`);
  };
  
  const handleAddPassword = () => {
    router.push('/password/add');
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Şifrelerim</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={handleAddPassword}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {/* Arama Çubuğu */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Ionicons name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Ara..."
            placeholderTextColor={theme.textSecondary}
            value={localSearch}
            onChangeText={handleSearch}
          />
          {localSearch.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* Kategori Filtresi */}
      {selectedCategory && (
        <View style={styles.filterContainer}>
          <View style={[styles.filterBadge, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.filterText, { color: theme.text }]}>Filtreleniyor</Text>
            <TouchableOpacity onPress={() => setSelectedCategory(null)}>
              <Ionicons name="close" size={16} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* Şifre Listesi */}
      {passwords.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="key-outline" size={80} color={theme.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            {searchQuery || selectedCategory ? 'Hiçbir sonuç bulunamadı' : 'Henüz şifre eklenmemiş'}
          </Text>
          {!searchQuery && !selectedCategory && (
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: theme.primary }]}
              onPress={handleAddPassword}
            >
              <Text style={styles.emptyButtonText}>İlk Şifrenizi Ekleyin</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={passwords}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PasswordCard password={item} onPress={() => handlePasswordPress(item.id)} />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.primary} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
