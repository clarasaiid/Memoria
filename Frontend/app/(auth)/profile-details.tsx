import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiService } from '../services/api';
import { useTheme } from '../../components/ThemeProvider';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileDetailsScreen() {
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const { colors } = useTheme();
  const params = useLocalSearchParams();
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const pickImage = async (type: 'profile' | 'cover') => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'profile' ? [1, 1] : [3, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      if (type === 'profile') setProfileImage(uri);
      else setCoverImage(uri);
    }
  };

  // Placeholder upload function (replace with real upload logic)
  const uploadImage = async (uri: string) => {
    // TODO: Implement real upload logic
    // For now, just return the local uri as a fake URL
    return uri;
  };

  const handleProfileDetails = async () => {
    let profilePictureUrl = undefined;
    let coverPhotoUrl = undefined;
    if (profileImage) profilePictureUrl = await uploadImage(profileImage);
    if (coverImage) coverPhotoUrl = await uploadImage(coverImage);
    try {
      await apiService.post('/auth/profile-setup', {
        username: params.username,
        email: params.email,
        bio: bio || undefined,
        profilePictureUrl,
        coverPhotoUrl,
      });
      // Fetch the current user info to get the username
      const me = await apiService.get('/auth/me');
      setMessage('Profile details saved! Redirecting...');
      setMessageType('success');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
        router.replace('/(tabs)/profile');
      }, 2000);
    } catch (error) {
      setMessage('Failed to save profile details. Please try again.');
      setMessageType('error');
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1 },
    scrollContent: { flexGrow: 1, padding: 24 },
    header: { marginBottom: 40 },
    title: { fontFamily: 'Inter-Bold', fontSize: 32, color: colors.primary, marginBottom: 8 },
    subtitle: { fontFamily: 'Inter-Regular', fontSize: 16, color: colors.textSecondary },
    formContainer: { marginBottom: 40 },
    inputContainer: { marginBottom: 20 },
    inputLabel: { fontFamily: 'Inter-Medium', fontSize: 16, color: colors.primary, marginBottom: 8 },
    input: { fontFamily: 'Inter-Regular', fontSize: 16, color: colors.text, backgroundColor: colors.cardAlt, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12 },
    bioInput: { height: 120, paddingTop: 12 },
    continueButton: { backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 16, alignItems: 'center', marginBottom: 16 },
    continueButtonText: { fontFamily: 'Inter-Bold', fontSize: 16, color: colors.buttonText },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Optional Profile Details</Text>
            <Text style={styles.subtitle}>You can add more info now or skip and do it later.</Text>
          </View>
          {message && (
            <View style={{ backgroundColor: messageType === 'success' ? '#d1fae5' : '#fee2e2', padding: 12, borderRadius: 8, marginBottom: 16 }}>
              <Text style={{ color: messageType === 'success' ? '#065f46' : '#b91c1c', fontWeight: 'bold', textAlign: 'center' }}>{message}</Text>
            </View>
          )}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Profile Photo</Text>
              <TouchableOpacity onPress={() => pickImage('profile')} style={{ marginBottom: 8 }}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={{ width: 80, height: 80, borderRadius: 40 }} />
                ) : (
                  <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.cardAlt, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: colors.textSecondary }}>Add Photo</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Cover Photo</Text>
              <TouchableOpacity onPress={() => pickImage('cover')} style={{ marginBottom: 8 }}>
                {coverImage ? (
                  <Image source={{ uri: coverImage }} style={{ width: 180, height: 60, borderRadius: 8 }} />
                ) : (
                  <View style={{ width: 180, height: 60, borderRadius: 8, backgroundColor: colors.cardAlt, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: colors.textSecondary }}>Add Photo</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Bio</Text>
              <TextInput
                style={[styles.input, styles.bioInput]}
                placeholder="Tell us about yourself (optional)"
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={bio}
                onChangeText={setBio}
              />
            </View>
            <TouchableOpacity style={styles.continueButton} onPress={handleProfileDetails}>
              <Text style={styles.continueButtonText}>Save and Continue</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.continueButton} onPress={() => router.replace('/login')}>
              <Text style={styles.continueButtonText}>Skip</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 