import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { Camera, Image as ImageIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { storyService, Story } from '../app/services/storyService';

interface StoryCreatorProps {
  onStoryCreated: (story: Story) => void;
  onClose: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

export default function StoryCreator({ onStoryCreated, onClose }: StoryCreatorProps) {
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [9, 16],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleCreateStory = async () => {
    if (!image) return;

    setIsLoading(true);
    try {
      const story = await storyService.createStory(image, caption.trim() || undefined);
      onStoryCreated(story);
      onClose();
    } catch (error) {
      console.error('Error creating story:', error);
      alert('Failed to create story. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, isWeb && styles.webContainer]}>
      <View style={[styles.header, isWeb && styles.webHeader]}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Story</Text>
        <TouchableOpacity
          onPress={handleCreateStory}
          disabled={!image || isLoading}
        >
          <Text style={[styles.shareButton, (!image || isLoading) && styles.disabled]}>
            Share
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.content, isWeb && styles.webContent]}>
        {image ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: image }} style={styles.preview} />
            <TextInput
              style={styles.captionInput}
              placeholder="Add a caption..."
              value={caption}
              onChangeText={setCaption}
              multiline
              maxLength={100}
            />
          </View>
        ) : (
          <View style={[styles.uploadOptions, isWeb && styles.webUploadOptions]}>
            {!isWeb && (
              <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
                <Camera size={32} color="#4682B4" />
                <Text style={styles.uploadText}>Take Photo</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <ImageIcon size={32} color="#4682B4" />
              <Text style={styles.uploadText}>
                {isWeb ? 'Choose Image' : 'Choose from Library'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4682B4" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  webContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -SCREEN_WIDTH * 0.4 }, { translateY: -300 }],
    width: SCREEN_WIDTH * 0.8,
    maxWidth: 500,
    height: 600,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  webHeader: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  cancelButton: {
    fontSize: 16,
    color: '#64748B',
  },
  shareButton: {
    fontSize: 16,
    color: '#4682B4',
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  webContent: {
    padding: 24,
  },
  uploadOptions: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  webUploadOptions: {
    gap: 16,
  },
  uploadButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    width: '100%',
    maxWidth: 300,
  },
  uploadText: {
    marginTop: 8,
    fontSize: 16,
    color: '#0F172A',
  },
  previewContainer: {
    flex: 1,
    alignItems: 'center',
  },
  preview: {
    width: '100%',
    maxWidth: 300,
    aspectRatio: 9/16,
    borderRadius: 12,
  },
  captionInput: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    fontSize: 16,
    color: '#0F172A',
    minHeight: 100,
    textAlignVertical: 'top',
    width: '100%',
    maxWidth: 300,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 