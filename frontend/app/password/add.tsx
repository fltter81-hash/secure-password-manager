import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { usePasswordStore } from '../../store/passwordStore';
import { darkTheme, lightTheme } from '../../constants/theme';

export default function AddPasswordPage() {
  const router = useRouter();
  const { addPassword, categories, settings } = usePasswordStore();
  const theme = settings.theme === 'dark' ? darkTheme : lightTheme;
  
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState(categories[0]?.id || 'other');
  const [image, setImage] = useState<string | undefined>(undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
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
  
  const handleTakePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('İzin Gerekli', 'Fotoğraf çekmek için kamera erişim izni gereklidir.');
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    
    if (!result.canceled && result.assets[0].base64) {
      setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
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
      
      await addPassword({
        title: title.trim(),
        username: username.trim(),
        password: password.trim(),
        url: url.trim(),
        notes: notes.trim(),
        category,
        image,
        isFavorite: false,
      });
      
      Alert.alert('Başarılı', 'Şifre kaydedildi!', [
        {
          text: 'Tamam',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Hata', 'Şifre kaydedilemedi.');
    } finally {
      setIsSaving(false);
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
          <Ionicons name="close" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Yeni Şifre</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.headerButton, { opacity: isSaving ? 0.5 : 1 }]}
          disabled={isSaving}
        >
          <Text style={[styles.saveText, { color: theme.primary }]}>Kaydet</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* İkon/Resim */}
        <View style={styles.imageSection}>
          <TouchableOpacity
            style={[
              styles.imageContainer,
              { backgroundColor: selectedCategory?.color || theme.primary },
            ]}
            onPress={() =>
              Alert.alert('Resim Seç', 'Nasıl eklemek istersiniz?', [
                { text: 'İptal', style: 'cancel' },
                { text: 'Galeri', onPress: handlePickImage },
                { text: 'Fotoğraf Çek', onPress: handleTakePhoto },
              ])
            }
          >
            {image ? (
              <Image source={{ uri: image }} style={styles.image} />
            ) : (
              <Ionicons name="camera" size={32} color="#FFFFFF" />
            )}
          </TouchableOpacity>
          {image && (
            <TouchableOpacity onPress={() => setImage(undefined)} style={styles.removeImageButton}>
              <Ionicons name="close-circle" size={24} color={theme.error} />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Form */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.inputGroup}>
            <Ionicons name="text" size={20} color={theme.textSecondary} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Başlık *"
              placeholderTextColor={theme.textSecondary}
              value={title}
              onChangeText={setTitle}
            />
          </View>
          
          <View style={[styles.separator, { backgroundColor: theme.border }]} />
          
          <View style={styles.inputGroup}>
            <Ionicons name="person" size={20} color={theme.textSecondary} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Kullanıcı Adı / Email"
              placeholderTextColor={theme.textSecondary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>
          
          <View style={[styles.separator, { backgroundColor: theme.border }]} />
          
          <View style={styles.inputGroup}>
            <Ionicons name="key" size={20} color={theme.textSecondary} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Şifre *"
              placeholderTextColor={theme.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          </View>
          
          <View style={[styles.separator, { backgroundColor: theme.border }]} />
          
          <View style={styles.inputGroup}>
            <Ionicons name="globe" size={20} color={theme.textSecondary} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="URL / Website"
              placeholderTextColor={theme.textSecondary}
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>
        </View>
        
        {/* Notlar */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Notlar</Text>
          <TextInput
            style={[styles.notesInput, { color: theme.text, borderColor: theme.border }]}
            placeholder="Ek notlar ekleyin..."
            placeholderTextColor={theme.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
        
        {/* Kategori */}
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
  removeImageButton: {
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
});
