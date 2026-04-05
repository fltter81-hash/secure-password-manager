import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import { usePasswordStore } from '../../store/passwordStore';
import { darkTheme, lightTheme } from '../../constants/theme';

export default function PasswordDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getPasswordById, updatePassword, deletePassword, toggleFavorite, categories, settings } =
    usePasswordStore();
  const theme = settings.theme === 'dark' ? darkTheme : lightTheme;
  
  const passwordData = getPasswordById(id!);
  
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(passwordData?.title || '');
  const [username, setUsername] = useState(passwordData?.username || '');
  const [password, setPassword] = useState(passwordData?.password || '');
  const [url, setUrl] = useState(passwordData?.url || '');
  const [notes, setNotes] = useState(passwordData?.notes || '');
  const [category, setCategory] = useState(passwordData?.category || 'other');
  const [image, setImage] = useState<string | undefined>(passwordData?.image);
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (!passwordData) {
      Alert.alert('Hata', 'Şifre bulunamadı!', [{ text: 'Tamam', onPress: () => router.back() }]);
    }
  }, [passwordData]);
  
  if (!passwordData) return null;
  
  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri erişim izni gereklidir.');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    
    if (!result.canceled && result.assets[0].base64) {
      setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };
  
  const handleCopy = async (text: string, label: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Kopyalandı', `${label} panoya kopyalandı!`);
  };
  
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Hata', 'Lütfen bir başlık girin.');
      return;
    }
    
    if (!password.trim()) {
      Alert.alert('Hata', 'Lütfen bir şifre girin.');
      return;
    }
    
    try {
      setIsSaving(true);
      
      await updatePassword(id!, {
        title: title.trim(),
        username: username.trim(),
        password: password.trim(),
        url: url.trim(),
        notes: notes.trim(),
        category,
        image,
      });
      
      setIsEditing(false);
      Alert.alert('Başarılı', 'Şifre güncellendi!');
    } catch (error) {
      Alert.alert('Hata', 'Şifre güncellenemedi.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDelete = () => {
    Alert.alert('Silme Onayı', 'Bu şifreyi silmek istediğinizden emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePassword(id!);
            router.back();
          } catch (error) {
            Alert.alert('Hata', 'Şifre silinemedi.');
          }
        },
      },
    ]);
  };
  
  const handleToggleFavorite = async () => {
    try {
      await toggleFavorite(id!);
    } catch (error) {
      Alert.alert('Hata', 'Favori durumu değiştirilemedi.');
    }
  };
  
  const selectedCategory = categories.find((c) => c.id === category);
  
  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Şifre Detayı</Text>
        {isEditing ? (
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.headerButton, { opacity: isSaving ? 0.5 : 1 }]}
            disabled={isSaving}
          >
            <Text style={[styles.saveText, { color: theme.primary }]}>Kaydet</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.headerButton}>
            <Ionicons name="create" size={24} color={theme.primary} />
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* İkon/Resim */}
        <View style={styles.imageSection}>
          <TouchableOpacity
            style={[
              styles.imageContainer,
              { backgroundColor: selectedCategory?.color || theme.primary },
            ]}
            onPress={isEditing ? handlePickImage : undefined}
            disabled={!isEditing}
          >
            {image ? (
              <Image source={{ uri: image }} style={styles.image} />
            ) : (
              <Ionicons
                name={selectedCategory?.icon as any || 'key'}
                size={40}
                color="#FFFFFF"
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteButton}>
            <Ionicons
              name={passwordData.isFavorite ? 'star' : 'star-outline'}
              size={28}
              color={theme.warning}
            />
          </TouchableOpacity>
        </View>
        
        {/* Form */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.inputGroup}>
            <Ionicons name="text" size={20} color={theme.textSecondary} />
            {isEditing ? (
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Başlık"
                placeholderTextColor={theme.textSecondary}
                value={title}
                onChangeText={setTitle}
              />
            ) : (
              <Text style={[styles.valueText, { color: theme.text }]}>{title}</Text>
            )}
          </View>
          
          <View style={[styles.separator, { backgroundColor: theme.border }]} />
          
          <View style={styles.inputGroup}>
            <Ionicons name="person" size={20} color={theme.textSecondary} />
            {isEditing ? (
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Kullanıcı Adı"
                placeholderTextColor={theme.textSecondary}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            ) : (
              <Text style={[styles.valueText, { color: theme.text }]}>{username}</Text>
            )}
            {!isEditing && username && (
              <TouchableOpacity onPress={() => handleCopy(username, 'Kullanıcı adı')}>
                <Ionicons name="copy" size={20} color={theme.primary} />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={[styles.separator, { backgroundColor: theme.border }]} />
          
          <View style={styles.inputGroup}>
            <Ionicons name="key" size={20} color={theme.textSecondary} />
            {isEditing ? (
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Şifre"
                placeholderTextColor={theme.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
            ) : (
              <Text style={[styles.valueText, { color: theme.text }]}>
                {showPassword ? password : '••••••••'}
              </Text>
            )}
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
            {!isEditing && (
              <TouchableOpacity onPress={() => handleCopy(password, 'Şifre')}>
                <Ionicons name="copy" size={20} color={theme.primary} />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={[styles.separator, { backgroundColor: theme.border }]} />
          
          <View style={styles.inputGroup}>
            <Ionicons name="globe" size={20} color={theme.textSecondary} />
            {isEditing ? (
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="URL"
                placeholderTextColor={theme.textSecondary}
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
                keyboardType="url"
              />
            ) : (
              <Text style={[styles.valueText, { color: theme.text }]}>{url || '-'}</Text>
            )}
            {!isEditing && url && (
              <TouchableOpacity onPress={() => handleCopy(url, 'URL')}>
                <Ionicons name="copy" size={20} color={theme.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {/* Notlar */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Notlar</Text>
          {isEditing ? (
            <TextInput
              style={[styles.notesInput, { color: theme.text, borderColor: theme.border }]}
              placeholder="Ek notlar..."
              placeholderTextColor={theme.textSecondary}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          ) : (
            <Text style={[styles.notesText, { color: theme.textSecondary }]}>
              {notes || 'Not yok'}
            </Text>
          )}
        </View>
        
        {/* Kategori */}
        {isEditing && (
          <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Kategori</Text>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: category === cat.id ? cat.color : theme.background,
                      borderColor: cat.color,
                    },
                  ]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={20}
                    color={category === cat.id ? '#FFFFFF' : cat.color}
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      { color: category === cat.id ? '#FFFFFF' : theme.text },
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        
        {/* Sil Butonu */}
        {isEditing && (
          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: theme.error }]}
            onPress={handleDelete}
          >
            <Ionicons name="trash" size={20} color="#FFFFFF" />
            <Text style={styles.deleteButtonText}>Şifreyi Sil</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  imageSection: {
    alignItems: 'center',
    marginVertical: 16,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  favoriteButton: {
    position: 'absolute',
    top: 0,
    right: '35%',
  },
  section: {
    borderRadius: 16,
    padding: 16,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  valueText: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  separator: {
    height: 1,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  notesInput: {
    fontSize: 16,
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 100,
  },
  notesText: {
    fontSize: 15,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    gap: 6,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
