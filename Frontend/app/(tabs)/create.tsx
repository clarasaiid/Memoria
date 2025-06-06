import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput, Switch, Platform, Modal, FlatList } from 'react-native';
import { ArrowLeft, Camera, Upload, Clock, Users, Lock, Globe, Scissors, SlidersHorizontal, Trash2, Check, Crop, RefreshCw, Edit3, Type } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@/components/DateTimePicker';
import { router } from 'expo-router';
import Tooltip from '@/components/Tooltip';
import * as ImagePicker from 'expo-image-picker';
// @ts-ignore
import Webcam from 'react-webcam';
import { useTheme } from '../../components/ThemeProvider';

// Mock friends data
const mockFriends = [
  { id: 1, name: 'Alex Johnson', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
  { id: 2, name: 'Emma Lee', avatar: 'https://randomuser.me/api/portraits/women/2.jpg' },
  { id: 3, name: 'David Wu', avatar: 'https://randomuser.me/api/portraits/men/3.jpg' },
  { id: 4, name: 'Sophia Martinez', avatar: 'https://randomuser.me/api/portraits/women/4.jpg' },
  { id: 5, name: 'James Taylor', avatar: 'https://randomuser.me/api/portraits/men/5.jpg' },
];

type Friend = { id: number; name: string; avatar: string };

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

export default function CreateScreen() {
  const [isTimeCapsule, setIsTimeCapsule] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // One week from now
  const [mediaType, setMediaType] = useState('photo');
  const [caption, setCaption] = useState('');
  const [tagModalVisible, setTagModalVisible] = useState(false);
  const [friendSearch, setFriendSearch] = useState('');
  const [taggedFriends, setTaggedFriends] = useState<Friend[]>([]);
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<'none' | 'grayscale' | 'sepia' | 'brightness'>('none');
  const [editMode, setEditMode] = useState<'main' | 'filters' | 'crop' | 'draw'>('main');
  const [mirror, setMirror] = useState(false);
  
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
    },
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
      borderBottomColor: colors.border,
      backgroundColor: colors.cardAlt,
    },
    headerTitle: {
      fontFamily: 'Inter-Bold',
      fontSize: 18,
      color: colors.text,
    },
    postButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    postButtonText: {
      fontFamily: 'Inter-Medium',
      fontSize: 14,
      color: colors.buttonText,
    },
    formContainer: {
      padding: 16,
    },
    captionInput: {
      fontFamily: 'Inter-Regular',
      fontSize: 16,
      color: colors.text,
      minHeight: 100,
      textAlignVertical: 'top',
      padding: 12,
      backgroundColor: colors.cardAlt,
      borderRadius: 8,
      marginBottom: 16,
    },
    actionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      marginBottom: 12,
    },
    actionIcon: {
      marginRight: 16,
      backgroundColor: colors.cardAlt,
      borderRadius: 8,
      padding: 8,
    },
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      padding: 12,
      backgroundColor: colors.cardAlt,
      borderRadius: 8,
    },
    switchLabelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    switchLabel: {
      fontFamily: 'Inter-Medium',
      fontSize: 16,
      color: colors.text,
      marginLeft: 8,
    },
    timeContainer: {
      marginBottom: 16,
      padding: 16,
      backgroundColor: colors.cardAlt,
      borderRadius: 8,
    },
    timeLabelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    timeLabel: {
      fontFamily: 'Inter-Medium',
      fontSize: 16,
      color: colors.text,
      marginLeft: 8,
    },
    recipientsContainer: {
      marginBottom: 16,
      padding: 16,
      backgroundColor: colors.cardAlt,
      borderRadius: 8,
    },
    recipientsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    recipientLabelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    recipientLabel: {
      fontFamily: 'Inter-Medium',
      fontSize: 16,
      color: colors.text,
      marginLeft: 8,
    },
    addText: {
      fontFamily: 'Inter-Medium',
      fontSize: 14,
      color: colors.primary,
    },
    recipientsList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    recipientChip: {
      backgroundColor: colors.cardAlt,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginRight: 8,
      marginBottom: 8,
    },
    recipientChipText: {
      fontFamily: 'Inter-Medium',
      fontSize: 14,
      color: colors.primary,
    },
    privacyContainer: {
      padding: 16,
      backgroundColor: colors.cardAlt,
      borderRadius: 8,
    },
    privacyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    privacyLabelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    privacyLabel: {
      fontFamily: 'Inter-Medium',
      fontSize: 16,
      color: colors.text,
      marginLeft: 8,
    },
    privacyDescription: {
      fontFamily: 'Inter-Regular',
      fontSize: 14,
      color: colors.textSecondary,
    },
    taggedFriendsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 16,
    },
    taggedFriendChip: {
      backgroundColor: colors.cardAlt,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginRight: 8,
      marginBottom: 8,
    },
    taggedFriendText: {
      fontFamily: 'Inter-Medium',
      fontSize: 14,
      color: colors.primary,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: colors.card,
      padding: 20,
      borderRadius: 20,
      width: '80%',
      alignItems: 'center',
    },
    modalTitle: {
      fontFamily: 'Inter-Bold',
      fontSize: 18,
      color: colors.text,
      marginBottom: 20,
    },
    modalSearch: {
      width: '100%',
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      marginBottom: 20,
      color: colors.text,
      backgroundColor: colors.cardAlt,
    },
    friendItem: {
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      marginBottom: 8,
      backgroundColor: colors.cardAlt,
    },
    friendName: {
      fontFamily: 'Inter-Medium',
      fontSize: 16,
      color: colors.text,
    },
    noFriends: {
      fontFamily: 'Inter-Regular',
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 20,
    },
    closeModalButton: {
      backgroundColor: colors.primary,
      padding: 12,
      borderRadius: 8,
    },
    closeModalText: {
      fontFamily: 'Inter-Medium',
      fontSize: 14,
      color: colors.buttonText,
    },
    imagesRow: {
      flexDirection: 'row',
      marginBottom: 16,
      marginTop: 8,
      minHeight: 100,
    },
    imagesRowContent: {
      alignItems: 'center',
    },
    imageSquareWrapper: {
      position: 'relative',
      marginRight: 12,
    },
    imageSquare: {
      width: 100,
      height: 100,
      borderRadius: 12,
      backgroundColor: colors.cardAlt,
    },
    deleteImageButton: {
      position: 'absolute',
      top: 2,
      right: 2,
      backgroundColor: colors.card,
      borderRadius: 10,
      width: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 2,
      shadowOffset: { width: 0, height: 1 },
    },
    deleteImageText: {
      color: '#EF4444',
      fontSize: 16,
      fontWeight: 'bold',
      lineHeight: 20,
    },
    addImageButton: {
      width: 100,
      height: 100,
      borderRadius: 12,
      backgroundColor: colors.cardAlt,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.primary,
    },
    addImageText: {
      color: colors.primary,
      fontSize: 36,
      fontWeight: 'bold',
      lineHeight: 40,
    },
    editModalContentLarge: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 8,
      alignItems: 'center',
      width: 'auto',
      alignSelf: 'center',
      marginTop: 20,
    },
    editImageHuge: {
      width: 90 * (window.innerWidth / 100),
      height: 90 * (window.innerWidth / 100),
      maxWidth: 500,
      maxHeight: 500,
      borderRadius: 20,
      marginBottom: 16,
      backgroundColor: colors.cardAlt,
    },
    editControlsRowIcons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      marginTop: 16,
      marginBottom: 0,
    },
    editControlButton: {
      alignItems: 'center',
      marginHorizontal: 16,
      padding: 8,
      borderRadius: 12,
    },
    contextControlsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      marginBottom: 8,
    },
    filtersRow: {
      marginBottom: 8,
      marginTop: 8,
      width: '100%',
    },
    filtersRowContent: {
      alignItems: 'center',
      paddingHorizontal: 8,
    },
    filterButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: colors.cardAlt,
      marginRight: 8,
    },
    filterButtonText: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    backToMainButton: {
      marginTop: 12,
      alignSelf: 'center',
      padding: 8,
    },
    backToMainText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  // Camera
  const handleCamera = async () => {
    if (Platform.OS === 'web') {
      setCameraModalVisible(true);
    } else {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alert('Camera permission is required!');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
      if (!result.canceled) {
        setImages(prev => [...prev, result.assets[0].uri]);
      }
    }
  };

  // Web: Capture from webcam
  const webcamRef = React.useRef<any>(null);
  const handleWebcamCapture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      unflipImage(imageSrc, (unflipped) => {
        setImages(prev => [...prev, unflipped]);
        setCameraModalVisible(false);
      });
    }
  };

  // Upload
  const handleUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsMultipleSelection: true,
    });
    if (!result.canceled) {
      setImages(prev => [...prev, ...result.assets.map(a => a.uri)]);
    }
  };

  // Remove image
  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Tag People
  const filteredFriends = mockFriends.filter(f => f.name.toLowerCase().includes(friendSearch.toLowerCase()));
  const handleTag = (friend: Friend) => {
    if (!taggedFriends.some(f => f.id === friend.id)) {
      setTaggedFriends([...taggedFriends, friend]);
    }
    setTagModalVisible(false);
    setFriendSearch('');
  };

  // Image editing modal handlers
  const handleEditImage = (idx: number) => {
    setEditingIndex(idx);
    setActiveFilter('none');
    setEditMode('main');
    setMirror(false);
  };
  const handleApplyEdit = () => {
    setEditingIndex(null);
  };
  const handleDeleteEdit = () => {
    if (editingIndex !== null) handleRemoveImage(editingIndex);
    setEditingIndex(null);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }] }>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create</Text>
          <TouchableOpacity style={styles.postButton}>
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.formContainer}>
          <TextInput
            style={styles.captionInput}
            placeholder="What's on your mind, Clara?"
            placeholderTextColor={colors.textSecondary}
            multiline
            value={caption}
            onChangeText={setCaption}
          />

          {/* Show tagged friends */}
          {taggedFriends.length > 0 && (
            <View style={styles.taggedFriendsRow}>
              {taggedFriends.map(f => (
                <View key={f.id} style={styles.taggedFriendChip}>
                  <Text style={styles.taggedFriendText}>{f.name}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Multi-image preview row */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesRow} contentContainerStyle={styles.imagesRowContent}>
            {images.map((img, idx) => (
              <View key={img + idx} style={styles.imageSquareWrapper}>
                <TouchableOpacity onPress={() => handleEditImage(idx)}>
                  <Image source={{ uri: img }} style={styles.imageSquare} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteImageButton} onPress={() => handleRemoveImage(idx)}>
                  <Text style={styles.deleteImageText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
            {/* Add image button */}
            <TouchableOpacity style={styles.addImageButton} onPress={handleUpload}>
              <Text style={styles.addImageText}>+</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.actionsRow}>
            <Tooltip label="Add Photo (Camera)">
              <TouchableOpacity style={styles.actionIcon} onPress={handleCamera}>
                <Camera size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </Tooltip>
            <Tooltip label="Upload Photo or Video">
              <TouchableOpacity style={styles.actionIcon} onPress={handleUpload}>
                <Upload size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </Tooltip>
            <Tooltip label="Tag People">
              <TouchableOpacity style={styles.actionIcon} onPress={() => setTagModalVisible(true)}>
                <Users size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </Tooltip>
          </View>
          
          <View style={styles.switchRow}>
            <View style={styles.switchLabelContainer}>
              <Text style={styles.switchLabel}>Create as Time Capsule</Text>
            </View>
            <Switch
              value={isTimeCapsule}
              onValueChange={setIsTimeCapsule}
              trackColor={{ false: '#CBD5E1', true: '#A78BFA' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          {isTimeCapsule && (
            <>
              <View style={styles.timeContainer}>
                <View style={styles.timeLabelContainer}>
                  <Clock size={20} color={colors.textSecondary} />
                  <Text style={styles.timeLabel}>Open date</Text>
                </View>
                <DateTimePicker 
                  value={selectedDate}
                  onChange={setSelectedDate}
                  minimumDate={new Date(Date.now() + 24 * 60 * 60 * 1000)} // At least one day in future
                />
              </View>
              
              <View style={styles.recipientsContainer}>
                <View style={styles.recipientsHeader}>
                  <View style={styles.recipientLabelContainer}>
                    <Users size={20} color={colors.textSecondary} />
                    <Text style={styles.recipientLabel}>Recipients</Text>
                  </View>
                  <TouchableOpacity>
                    <Text style={styles.addText}>Add</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.recipientsList}>
                  <View style={styles.recipientChip}>
                    <Text style={styles.recipientChipText}>Future Me</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.privacyContainer}>
                <View style={styles.privacyHeader}>
                  <View style={styles.privacyLabelContainer}>
                    {isPrivate ? 
                      <Lock size={20} color={colors.textSecondary} /> : 
                      <Globe size={20} color={colors.textSecondary} />
                    }
                    <Text style={styles.privacyLabel}>Privacy</Text>
                  </View>
                  <Switch
                    value={isPrivate}
                    onValueChange={setIsPrivate}
                    trackColor={{ false: '#CBD5E1', true: '#A78BFA' }}
                    thumbColor="#FFFFFF"
                  />
                </View>
                <Text style={styles.privacyDescription}>
                  {isPrivate 
                    ? "Only you and selected recipients can see this time capsule" 
                    : "Anyone on Memoria can discover this time capsule"
                  }
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Tag People Modal */}
        <Modal
          visible={tagModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setTagModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Tag Friends</Text>
              <TextInput
                style={styles.modalSearch}
                placeholder="Search friends..."
                value={friendSearch}
                onChangeText={setFriendSearch}
              />
              <FlatList
                data={filteredFriends}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.friendItem} onPress={() => handleTag(item)}>
                    <Text style={styles.friendName}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.noFriends}>No friends found.</Text>}
              />
              <TouchableOpacity style={styles.closeModalButton} onPress={() => setTagModalVisible(false)}>
                <Text style={styles.closeModalText}>Close</Text>
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
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Take a Photo</Text>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  mirrored={false}
                  videoConstraints={{ facingMode: 'user' }}
                  style={{ width: 320, height: 240, borderRadius: 12, marginBottom: 16, transform: 'none' }}
                />
                <TouchableOpacity style={styles.postButton} onPress={handleWebcamCapture}>
                  <Text style={styles.postButtonText}>Capture</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeModalButton} onPress={() => setCameraModalVisible(false)}>
                  <Text style={styles.closeModalText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

        {/* Image Editing Modal */}
        <Modal
          visible={editingIndex !== null}
          animationType="slide"
          transparent
          onRequestClose={() => setEditingIndex(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.editModalContentLarge}>
              {editingIndex !== null && (
                Platform.OS === 'web' ? (
                  <div style={{
                    width: '90vw',
                    height: '90vw',
                    maxWidth: 500,
                    maxHeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#F3F4F6',
                    borderRadius: 20,
                    marginBottom: 16,
                    overflow: 'hidden',
                  }}>
                    <img
                      src={images[editingIndex]}
                      alt="preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: 20,
                        filter:
                          activeFilter === 'grayscale' ? 'grayscale(1)' :
                          activeFilter === 'sepia' ? 'sepia(1)' :
                          activeFilter === 'brightness' ? 'brightness(1.5)' :
                          'none',
                        transform: mirror ? 'scaleX(-1)' : 'none',
                      }}
                    />
                  </div>
                ) : (
                  <Image
                    source={{ uri: images[editingIndex] }}
                    style={[
                      styles.editImageHuge,
                      mirror && { transform: [{ scaleX: -1 }] },
                    ]}
                    resizeMode="cover"
                  />
                )
              )}
              {/* Contextual Controls */}
              {editMode === 'filters' && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow} contentContainerStyle={styles.filtersRowContent}>
                  {[
                    { key: 'none', label: 'None' },
                    { key: 'grayscale', label: 'Grayscale' },
                    { key: 'sepia', label: 'Sepia' },
                    { key: 'brightness', label: 'Bright' },
                    { key: 'contrast', label: 'Contrast' },
                    { key: 'invert', label: 'Invert' },
                    { key: 'blur', label: 'Blur' },
                    { key: 'hue', label: 'Hue' },
                  ].map(f => (
                    <TouchableOpacity key={f.key} style={styles.filterButton} onPress={() => setActiveFilter(f.key as any)}>
                      <Text style={[styles.filterButtonText, activeFilter === f.key && { color: '#A78BFA', fontWeight: 'bold' }]}>{f.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
              {editMode === 'crop' && (
                <View style={styles.contextControlsRow}>
                  <TouchableOpacity style={styles.editControlButton} onPress={() => setMirror(m => !m)}>
                    <RefreshCw size={28} color={mirror ? '#A78BFA' : '#64748B'} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.editControlButton}>
                    <Crop size={28} color="#64748B" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.editControlButton}>
                    <RefreshCw size={28} color="#64748B" style={{ transform: [{ rotate: '90deg' }] }} />
                  </TouchableOpacity>
                </View>
              )}
              {editMode === 'draw' && (
                <View style={styles.contextControlsRow}>
                  <TouchableOpacity style={styles.editControlButton}>
                    <Edit3 size={28} color="#64748B" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.editControlButton}>
                    <Type size={28} color="#64748B" />
                  </TouchableOpacity>
                </View>
              )}
              {/* Main Toolbar */}
              {editMode === 'main' && (
                <View style={styles.editControlsRowIcons}>
                  <TouchableOpacity style={styles.editControlButton} onPress={() => setEditMode('filters')}>
                    <SlidersHorizontal size={32} color="#A78BFA" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.editControlButton} onPress={() => setEditMode('crop')}>
                    <Crop size={32} color="#A78BFA" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.editControlButton} onPress={() => setEditMode('draw')}>
                    <Edit3 size={32} color="#A78BFA" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.editControlButton} onPress={handleDeleteEdit}>
                    <Trash2 size={32} color="#EF4444" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.editControlButton} onPress={handleApplyEdit}>
                    <Check size={32} color="#10B981" />
                  </TouchableOpacity>
                </View>
              )}
              {/* Back button for contextual controls */}
              {editMode !== 'main' && (
                <TouchableOpacity style={styles.backToMainButton} onPress={() => setEditMode('main')}>
                  <Text style={styles.backToMainText}>Back</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}