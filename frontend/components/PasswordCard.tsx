import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Password } from '../types';
import { usePasswordStore } from '../store/passwordStore';
import { darkTheme, lightTheme } from '../constants/theme';

interface PasswordCardProps {
  password: Password;
  onPress: () => void;
}

export default function PasswordCard({ password, onPress }: PasswordCardProps) {
  const settings = usePasswordStore((state) => state.settings);
  const categories = usePasswordStore((state) => state.categories);
  const theme = settings.theme === 'dark' ? darkTheme : lightTheme;
  
  const category = categories.find((c) => c.id === password.category);
  
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        {/* Sol kısım: Resim veya ikon */}
        <View style={[styles.iconContainer, { backgroundColor: category?.color || theme.primary }]}>
          {password.image ? (
            <Image source={{ uri: password.image }} style={styles.image} />
          ) : (
            <Ionicons name={category?.icon as any || 'key'} size={24} color="#FFFFFF" />
          )}
        </View>
        
        {/* Orta kısım: Bilgiler */}
        <View style={styles.infoContainer}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
              {password.title}
            </Text>
            {password.isFavorite && (
              <Ionicons name="star" size={16} color={theme.warning} />
            )}
          </View>
          <Text style={[styles.username, { color: theme.textSecondary }]} numberOfLines={1}>
            {password.username}
          </Text>
          {password.url && (
            <Text style={[styles.url, { color: theme.textSecondary }]} numberOfLines={1}>
              {password.url}
            </Text>
          )}
        </View>
        
        {/* Sağ kısım: Ok ikonu */}
        <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
      </View>
      
      {/* Alt kısım: Kategori etiketi */}
      {category && (
        <View style={styles.footer}>
          <View style={[styles.categoryBadge, { backgroundColor: category.color + '20' }]}>
            <Text style={[styles.categoryText, { color: category.color }]}>
              {category.name}
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  infoContainer: {
    flex: 1,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  username: {
    fontSize: 14,
    marginTop: 4,
  },
  url: {
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    marginTop: 12,
    flexDirection: 'row',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
