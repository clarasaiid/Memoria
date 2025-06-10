import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  Platform,
  Animated,
  PanResponder,
} from 'react-native';
import { X, MoreVertical } from 'lucide-react-native';

interface Story {
  id: string;
  imageUrl: string;
  username: string;
  userId: string;
  timestamp: number;
  archiveAt: number; // time when story will be archived
  isViewed?: boolean;
}

interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
  onStoryViewed?: (storyId: string) => void;
  currentUserId?: string;
  onDeleteStory?: (storyId: string) => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const STORY_DURATION = 5000; // 5 seconds per story
const TAB_BAR_HEIGHT = 60; // Adjust if your tab bar is a different height

export default function StoryViewer({
  stories,
  initialIndex,
  onClose,
  onStoryViewed,
  currentUserId,
  onDeleteStory,
}: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (Math.abs(gestureState.dx) > 50) {
          if (gestureState.dx > 0 && currentIndex > 0) {
            // Swipe right - go to previous story
            setCurrentIndex(currentIndex - 1);
          } else if (gestureState.dx < 0 && currentIndex < stories.length - 1) {
            // Swipe left - go to next story
            setCurrentIndex(currentIndex + 1);
          }
        }
      },
    })
  ).current;

  useEffect(() => {
    // Reset progress when story changes
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: STORY_DURATION,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && currentIndex < stories.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else if (finished) {
        onClose();
      }
    });

    // Mark story as viewed
    if (onStoryViewed) {
      onStoryViewed(stories[currentIndex].id);
    }
  }, [currentIndex]);

  const handleTap = (event: any) => {
    const { locationX } = event.nativeEvent;
    const screenMiddle = SCREEN_WIDTH / 2;

    if (locationX < screenMiddle) {
      // Tap left side - go to previous story
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    } else {
      // Tap right side - go to next story
      if (currentIndex < stories.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        onClose();
      }
    }
  };

  const story = stories[currentIndex];
  const prevStory = currentIndex > 0 ? stories[currentIndex - 1] : null;
  const nextStory = currentIndex < stories.length - 1 ? stories[currentIndex + 1] : null;
  const isOwnStory = currentUserId && story.userId === currentUserId;
  const now = Date.now();
  const msLeft = Math.max(story.archiveAt - now, 0);
  const hours = Math.floor(msLeft / 3600000);
  const minutes = Math.floor((msLeft % 3600000) / 60000);
  const timeLeft = `${hours}h ${minutes}m left`;

  return (
    <View style={[styles.container, isWeb && styles.webContainer]}>
      {/* Progress bars */}
      <View style={styles.progressContainer}>
        {stories.map((_, index) => (
          <View key={index} style={styles.progressBarBackground}>
            <Animated.View
              style={[
                styles.progressBar,
                index === currentIndex && {
                  width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                },
                index < currentIndex && { width: '100%' },
                index > currentIndex && { width: '0%' },
                index === currentIndex ? styles.activeProgressBar : styles.inactiveProgressBar,
              ]}
            />
          </View>
        ))}
      </View>

      {/* Previous Preview */}
      {prevStory && (
        <TouchableOpacity style={styles.leftPreview} onPress={() => setCurrentIndex(currentIndex - 1)}>
          <Image source={{ uri: prevStory.imageUrl }} style={styles.previewImage} blurRadius={5} />
        </TouchableOpacity>
      )}

      {/* Main Story Image */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleTap}
        {...panResponder.panHandlers}
        style={styles.storyContent}
      >
        <View style={styles.centerImageContainer}>
          <Image
            source={{ uri: story.imageUrl }}
            style={styles.centerImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.username}>{story.username}</Text>
            <Text style={styles.timeLeft}>{timeLeft}</Text>
          </View>
          {isOwnStory && (
            <TouchableOpacity onPress={() => onDeleteStory && onDeleteStory(story.id)} style={styles.menuButton}>
              <MoreVertical size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Next Preview */}
      {nextStory && (
        <TouchableOpacity style={styles.rightPreview} onPress={() => setCurrentIndex(currentIndex + 1)}>
          <Image source={{ uri: nextStory.imageUrl }} style={styles.previewImage} blurRadius={5} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: TAB_BAR_HEIGHT,
    backgroundColor: '#000000',
    zIndex: 9999,
  },
  webContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: TAB_BAR_HEIGHT,
    zIndex: 1000,
  },
  progressContainer: {
    flexDirection: 'row',
    padding: 8,
    gap: 4,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  progressBarBackground: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  activeProgressBar: {
    backgroundColor: '#FFFFFF',
  },
  inactiveProgressBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  storyContent: {
    flex: 1,
  },
  centerImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  centerImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.8,
  },
  header: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  username: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  leftPreview: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.2,
    justifyContent: 'center',
    alignItems: 'flex-start',
    zIndex: 5,
  },
  rightPreview: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.2,
    justifyContent: 'center',
    alignItems: 'flex-end',
    zIndex: 5,
  },
  previewImage: {
    width: SCREEN_WIDTH * 0.18,
    height: SCREEN_HEIGHT * 0.3,
    borderRadius: 12,
    opacity: 0.7,
  },
  timeLeft: {
    color: '#fff',
    fontSize: 14,
    marginTop: 2,
  },
  menuButton: {
    marginRight: 12,
  },
}); 