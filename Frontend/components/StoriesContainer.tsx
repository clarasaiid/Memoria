import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { Plus } from 'lucide-react-native';
import StoryCircle from './StoryCircle';
import StoryViewer from './StoryViewer';
import { useTheme } from './ThemeProvider';
import { storyService, Story } from '../app/services/storyService';
import { apiService } from '../app/services/api';

interface StoriesContainerProps {
  onStoryCreated?: (story: Story) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const STORY_CIRCLE_SIZE = isWeb ? 80 : 70;
const STORY_CIRCLE_SPACING = isWeb ? 16 : 12;

export default function StoriesContainer({ onStoryCreated }: StoriesContainerProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number>(0);
  const { colors } = useTheme();
  // TODO: Replace with your actual user ID source
  const currentUserId = typeof window !== 'undefined' ? sessionStorage.getItem('userId') || '' : '';

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const fetchedStories = await storyService.getStories();
      setStories(fetchedStories);
    } catch (error) {
      console.error('Error loading stories:', error);
    }
  };

  // Group stories by userId
  const userStoriesMap: Record<string, Story[]> = {};
  stories.forEach(story => {
    if (!userStoriesMap[story.userId]) userStoriesMap[story.userId] = [];
    userStoriesMap[story.userId].push(story);
  });
  const users = Object.values(userStoriesMap).map(storiesArr => storiesArr[0]); // One per user

  const handleStoryPress = (userId: string, index: number) => {
    setSelectedUserId(userId);
    setSelectedStoryIndex(index);
  };

  const handleCloseStory = () => {
    setSelectedUserId(null);
    setSelectedStoryIndex(0);
  };

  const handleStoryViewed = (storyId: string) => {
    console.log('Story viewed:', storyId);
  };

  const handleDeleteStory = async (storyId: string) => {
    try {
      await apiService.delete(`/api/posts/${storyId}`);
      // Refresh stories after deletion
      await loadStories();
      handleCloseStory();
    } catch (error) {
      alert('Failed to delete story. Please try again.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Add Story Button */}
        <TouchableOpacity
          style={[styles.addStoryButton, { backgroundColor: colors.card }]}
          onPress={() => onStoryCreated?.({} as Story)}
        >
          <Plus size={24} color={colors.primary} />
        </TouchableOpacity>

        {/* Story Circles, one per user */}
        {users.map((user, idx) => (
          <StoryCircle
            key={user.userId}
            imageUrl={user.avatarUrl}
            username={user.username}
            isViewed={user.isViewed}
            onPress={() => handleStoryPress(user.userId, 0)}
            size={STORY_CIRCLE_SIZE}
          />
        ))}
      </ScrollView>

      {/* Story Viewer */}
      {selectedUserId !== null && (
        <StoryViewer
          stories={userStoriesMap[selectedUserId]}
          initialIndex={selectedStoryIndex}
          onClose={handleCloseStory}
          onStoryViewed={handleStoryViewed}
          currentUserId={currentUserId}
          onDeleteStory={handleDeleteStory}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  scrollContent: {
    paddingHorizontal: isWeb ? 24 : 16,
    gap: STORY_CIRCLE_SPACING,
  },
  addStoryButton: {
    width: STORY_CIRCLE_SIZE,
    height: STORY_CIRCLE_SIZE,
    borderRadius: STORY_CIRCLE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
}); 