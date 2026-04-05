import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePasswordStore } from '../../store/passwordStore';
import { darkTheme, lightTheme } from '../../constants/theme';

export default function CategoriesPage() {
  const { categories, passwords, setSelectedCategory, settings } = usePasswordStore();
  const theme = settings.theme === 'dark' ? darkTheme : lightTheme;
  
  // Her kategori için şifre sayısını hesapla
  const categoriesWithCount = categories.map((category) => ({
    ...category,
    count: passwords.filter((p) => p.category === category.id).length,
  }));
  
  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // Ana ekrana dön
    // router.back() yerine tab'a geçiş otomatik olacak
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Kategoriler</Text>
      </View>
      
      {/* Kategori Listesi */}
      <FlatList
        data={categoriesWithCount}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryCard,
              { backgroundColor: theme.cardBackground, borderColor: theme.border },
            ]}
            onPress={() => handleCategoryPress(item.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
              <Ionicons name={item.icon as any} size={32} color="#FFFFFF" />
            </View>
            
            <View style={styles.categoryInfo}>
              <Text style={[styles.categoryName, { color: theme.text }]}>{item.name}</Text>
              <Text style={[styles.categoryCount, { color: theme.textSecondary }]}>
                {item.count} şifre
              </Text>
            </View>
            
            <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
  },
  categoryCount: {
    fontSize: 14,
    marginTop: 4,
  },
});
