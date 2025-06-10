import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Camera, Image as ImageIcon, Trash2 } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '../components/ThemeProvider';
import { apiService } from './services/api';
import * as ImagePicker from 'expo-image-picker';
import Webcam from 'react-webcam';
import React from 'react';
import { Platform } from 'react-native';

interface ProfileResponse {
  profile: {
    username: string;
    name: string;
    bio: string | null;
    email: string;
    profilePictureUrl: string | null;
    coverPhotoUrl: string | null;
    gender: string;
    birthday: string;
    posts: any[];
    comments: any[];
    reactions: any[];
    ownedGroups: any[];
    timeCapsules: any[];
    groupMessages: any[];
    groupMemberships: any[];
    timeCapsuleViewers: any[];
  };
}

interface UsernameCheckResponse {
  available: boolean;
}

// Helper to unflip a base64 image horizontally using a canvas (web only)
function unflipImage(imageSrc: string, callback: (unflipped: string) => void) {
  const img = new window.Image();
  img.onload = function () {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.translate(img.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(img, 0, 0);
    callback(canvas.toDataURL('image/jpeg'));
  };
  img.src = imageSrc;
}

export default function EditProfileScreen() {
  console.log('EditProfileScreen re-rendered');
  const { colors } = useTheme();
  const [originalData, setOriginalData] = useState({
    username: '',
    email: '',
  });
  const [profileData, setProfileData] = useState<{
    username: string;
    fullName: string;
    bio: string;
    email: string;
    profilePictureUrl: string | null;
    coverPhotoUrl: string | null;
    gender: string;
    birthday: string;
    posts: any[];
    comments: any[];
    reactions: any[];
    ownedGroups: any[];
    timeCapsules: any[];
    groupMessages: any[];
    groupMemberships: any[];
    timeCapsuleViewers: any[];
  }>({
    username: '',
    fullName: '',
    bio: '',
    email: '',
    profilePictureUrl: null,
    coverPhotoUrl: null,
    gender: '',
    birthday: '',
    posts: [],
    comments: [],
    reactions: [],
    ownedGroups: [],
    timeCapsules: [],
    groupMessages: [],
    groupMemberships: [],
    timeCapsuleViewers: [],
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(null);
  const [showImageSourceOptions, setShowImageSourceOptions] = useState(false);
  const [currentImagePickerType, setCurrentImagePickerType] = useState<'profile' | 'cover' | null>(null);
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const webcamRef = React.useRef<any>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await apiService.get<ProfileResponse>('/auth/me');
      console.log("Email from API response in fetchProfile:", response.profile.email);
      setOriginalData({
        username: response.profile.username,
        email: response.profile.email,
      });
      setProfileData({
        username: response.profile.username,
        fullName: response.profile.name,
        bio: response.profile.bio || '',
        email: response.profile.email,
        profilePictureUrl: response.profile.profilePictureUrl || null,
        coverPhotoUrl: response.profile.coverPhotoUrl || null,
        gender: response.profile.gender || '',
        birthday: response.profile.birthday || '',
        posts: response.profile.posts || [],
        comments: response.profile.comments || [],
        reactions: response.profile.reactions || [],
        ownedGroups: response.profile.ownedGroups || [],
        timeCapsules: response.profile.timeCapsules || [],
        groupMessages: response.profile.groupMessages || [],
        groupMemberships: response.profile.groupMemberships || [],
        timeCapsuleViewers: response.profile.timeCapsuleViewers || [],
      });
      console.log("Email in profileData state after setProfileData:", response.profile.email);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Check username availability
  useEffect(() => {
    if (!profileData.username) {
      setIsUsernameAvailable(null);
      return;
    }
    // Only check if username is different from original
    if (profileData.username === originalData.username) {
      setIsUsernameAvailable(true);
      return;
    }
    setIsCheckingUsername(true);
    const handler = setTimeout(async () => {
      try {
        const res = await apiService.get<UsernameCheckResponse>(`/auth/check-username?username=${encodeURIComponent(profileData.username)}`);
        setIsUsernameAvailable(res.available);
      } catch {
        setIsUsernameAvailable(null);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [profileData.username, originalData.username]);

  // Check email availability
  useEffect(() => {
    if (!profileData.email) {
      setIsEmailAvailable(null);
      return;
    }
    // Only check if email is different from original
    if (profileData.email === originalData.email) {
      setIsEmailAvailable(true);
      return;
    }
    setIsCheckingEmail(true);
    const handler = setTimeout(async () => {
      try {
        const res = await apiService.get<UsernameCheckResponse>(`/auth/check-email?email=${encodeURIComponent(profileData.email)}`);
        setIsEmailAvailable(res.available);
      } catch {
        setIsEmailAvailable(null);
      } finally {
        setIsCheckingEmail(false);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [profileData.email, originalData.email]);

  const pickImage = async (source: 'camera' | 'library') => {
    let result;
    if (source === 'camera') {
      if (Platform.OS === 'web') {
        setShowImageSourceOptions(false);
        setCameraModalVisible(true);
        return;
      }
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
        alert('Sorry, we need camera and media library permissions to make this work!');
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: currentImagePickerType === 'profile' ? [1, 1] : [3, 1],
        quality: 0.7,
      });
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need media library permissions to make this work!');
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: currentImagePickerType === 'profile' ? [1, 1] : [3, 1],
        quality: 0.7,
      });
    }

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      if (currentImagePickerType === 'profile') {
        setProfileData(prev => ({ ...prev, profilePictureUrl: uri }));
      } else if (currentImagePickerType === 'cover') {
        setProfileData(prev => ({ ...prev, coverPhotoUrl: uri }));
      }
    }
    setShowImageSourceOptions(false);
  };

  // Web: Capture from webcam
  const handleWebcamCapture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      unflipImage(imageSrc, (unflipped) => {
        if (currentImagePickerType === 'profile') {
          setProfileData(prev => ({ ...prev, profilePictureUrl: unflipped }));
        } else if (currentImagePickerType === 'cover') {
          setProfileData(prev => ({ ...prev, coverPhotoUrl: unflipped }));
        }
        setCameraModalVisible(false);
      });
    }
  };

  const handleDeleteImage = (type: 'profile' | 'cover') => {
    if (type === 'profile') {
      setProfileData(prev => ({ ...prev, profilePictureUrl: "" }));
    } else {
      setProfileData(prev => ({ ...prev, coverPhotoUrl: "" }));
    }
  };

  const renderImageOptions = (type: 'profile' | 'cover') => {
    const hasImage = type === 'profile' ? profileData.profilePictureUrl : profileData.coverPhotoUrl;
    
    return (
      <View style={styles.imageOptionsContainer}>
        <TouchableOpacity
          style={[styles.imageOptionButton, { backgroundColor: colors.cardAlt }]}
          onPress={() => {
            setCurrentImagePickerType(type);
            setShowImageSourceOptions(true);
          }}
        >
          <Camera size={20} color={colors.text} />
          <Text style={[styles.imageOptionText, { color: colors.text }]}>
            {hasImage ? 'Change Photo' : 'Add Photo'}
          </Text>
        </TouchableOpacity>
        
        {hasImage && (
          <TouchableOpacity
            style={[styles.imageOptionButton, { backgroundColor: colors.error }]}
            onPress={() => handleDeleteImage(type)}
          >
            <Trash2 size={20} color="#FFFFFF" />
            <Text style={[styles.imageOptionText, { color: '#FFFFFF' }]}>
              Delete Photo
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const handleSave = async () => {
    // Only check availability if the values are different from original
    if (profileData.username !== originalData.username && isUsernameAvailable === false) {
      setMessage('Username is already taken.');
      setMessageType('error');
      return;
    }
    if (profileData.email !== originalData.email && isEmailAvailable === false) {
      setMessage('Email is already taken.');
      setMessageType('error');
      return;
    }

    try {
      const [firstName, ...lastNameParts] = profileData.fullName.split(' ');
      const lastName = lastNameParts.join(' ');

      const updateData: any = {
        Username: profileData.username,
        FirstName: firstName || '',
        LastName: lastName || '',
        Birthday: profileData.birthday,
        Gender: profileData.gender,
        Bio: profileData.bio,
        Email: profileData.email,
        ProfilePictureUrl: profileData.profilePictureUrl ?? '',
        CoverPhotoUrl: profileData.coverPhotoUrl ?? '',
      };

      console.log("Sending update data:", updateData); // Debug log

      await apiService.put('/users/me', updateData);
      setMessage('Profile updated successfully!');
      setMessageType('success');
      await fetchProfile();
      setTimeout(() => {
        setMessage('');
        setMessageType('');
        router.back();
      }, 2000);
    } catch (error: any) {
      console.error("API error details:", error.response?.data);
      let errorMessage = 'Failed to update profile. Please try again.';
      if (error.response?.data?.errors) {
          const errorMessages = [];
          for (const key in error.response.data.errors) {
              if (Array.isArray(error.response.data.errors[key])) {
                  errorMessages.push(...error.response.data.errors[key]);
              }
          }
          if (errorMessages.length > 0) {
              errorMessage = errorMessages.join('\n');
          } else if (error.response.data.title) {
              errorMessage = error.response.data.title;
          }
      } else if (error.response?.data) {
          errorMessage = error.response.data;
      }
      else if (error.message) {
          errorMessage = error.message;
      }
      setMessage(errorMessage);
      setMessageType('error');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 4000);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              console.log('No screen to go back to, navigating to profile tab.');
              router.replace('/(tabs)/profile'); // Fallback to main profile tab
            }
          }} style={styles.backBtn}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={[styles.saveButton, { color: colors.primary }]}>Save</Text>
          </TouchableOpacity>
        </View>

        {message ? (
          <View style={[styles.messageContainer, { backgroundColor: messageType === 'success' ? colors.success : colors.error }]}>
            <Text style={[styles.messageText, { color: colors.buttonText }]}>{message}</Text>
          </View>
        ) : null}

        {/* Profile Picture and Cover Photo Section */}
        <View style={styles.photoSection}>
          <View style={styles.photoContainer}>
            <View style={[styles.profileImage, { backgroundColor: colors.cardAlt }]}>
              {profileData.profilePictureUrl ? (
                <Image source={{ uri: profileData.profilePictureUrl }} style={styles.profileImage} />
              ) : (
                <ImageIcon size={40} color={colors.textSecondary} />
              )}
            </View>
            {renderImageOptions('profile')}
          </View>

          <View style={styles.photoContainer}>
            <View style={[styles.coverPhoto, { backgroundColor: colors.cardAlt }]}>
              {profileData.coverPhotoUrl ? (
                <Image source={{ uri: profileData.coverPhotoUrl }} style={styles.coverPhoto} />
              ) : (
                <ImageIcon size={40} color={colors.textSecondary} />
              )}
            </View>
            {renderImageOptions('cover')}
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Username</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.cardAlt,
                color: colors.text,
                borderColor: colors.border
              }]}
              value={profileData.username}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, username: text }))}
              placeholder="Enter username"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {isCheckingUsername && <Text style={{ color: colors.text, fontSize: 12 }}>Checking username...</Text>}
            {isUsernameAvailable !== null && !isCheckingUsername && (
              <Text style={{ color: isUsernameAvailable ? 'green' : 'red', fontSize: 12 }}>
                {isUsernameAvailable ? 'Username available' : 'Username already taken'}
              </Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.cardAlt,
                color: colors.text,
                borderColor: colors.border
              }]}
              value={profileData.fullName}
              onChangeText={(text) => setProfileData({ ...profileData, fullName: text })}
              placeholder="Enter full name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput, { 
                backgroundColor: colors.cardAlt,
                color: colors.text,
                borderColor: colors.border
              }]}
              value={profileData.bio}
              onChangeText={(text) => setProfileData((prevData) => ({ ...prevData, bio: text }))}
              placeholder="Write something about yourself"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              value={profileData.email}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, email: text }))}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {isCheckingEmail && <Text style={{ color: colors.text, fontSize: 12 }}>Checking email...</Text>}

            {isEmailAvailable !== null && !isCheckingEmail && (
              <Text style={{ color: isEmailAvailable ? 'green' : 'red', fontSize: 12 }}>
                {isEmailAvailable ? 'Email available' : 'Email already taken'}
              </Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Gender</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.cardAlt, color: colors.text, borderColor: colors.border, opacity: 0.6 }
              ]}
              value={profileData.gender}
              editable={false}
              selectTextOnFocus={false}
              placeholder="Gender"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Birthday</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.cardAlt, color: colors.text, borderColor: colors.border, opacity: 0.6 }
              ]}
              value={profileData.birthday}
              editable={false}
              selectTextOnFocus={false}
              placeholder="Birthday"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>
      </ScrollView>

      {/* Modals for Image Picking */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showImageSourceOptions}
        onRequestClose={() => setShowImageSourceOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <TouchableOpacity 
              style={[styles.modalOption, { borderBottomColor: colors.border }]} 
              onPress={() => pickImage('camera')}
            >
              <Text style={[styles.modalOptionText, { color: colors.text }]}>Take a picture</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalOption, { borderBottomColor: colors.border }]} 
              onPress={() => pickImage('library')}
            >
              <Text style={[styles.modalOptionText, { color: colors.text }]}>Upload a picture</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalCancel, { backgroundColor: colors.cardAlt }]} 
              onPress={() => setShowImageSourceOptions(false)}
            >
              <Text style={[styles.modalCancelText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Camera Modal for Web */}
      {Platform.OS === 'web' && (
        <Modal
          visible={cameraModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setCameraModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Take a Photo</Text>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                mirrored={false}
                videoConstraints={{ facingMode: 'user' }}
                style={{ width: '100%', height: 300, borderRadius: 12, marginBottom: 16 }}
              />
              <TouchableOpacity style={[styles.modalOption, { borderBottomColor: colors.border }]} onPress={handleWebcamCapture}>
                <Text style={[styles.modalOptionText, { color: colors.primary }]}>Capture Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalCancel, { backgroundColor: colors.cardAlt }]} 
                onPress={() => setCameraModalVisible(false)}
              >
                <Text style={[styles.modalCancelText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  messageContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  messageText: {
    fontSize: 14,
    textAlign: 'center',
  },
  photoSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    gap: 40,
  },
  photoContainer: {
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  coverPhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    fontSize: 16,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  modalOption: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalOptionText: {
    fontSize: 18,
  },
  modalCancel: {
    marginTop: 8,
    padding: 16,
    alignItems: 'center',
    borderRadius: 16,
  },
  modalCancelText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverPhotoContainer: {
    width: 300,
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
  },
  coverPhotoPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
  },
  imageOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  imageOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});