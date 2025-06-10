import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../components/ThemeProvider';
import { apiService } from './services/api';
import { FeedPost } from './types/feed';

export default function ArchivePage() {
  const router = useRouter();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<'posts' | 'stories'>('posts');
  const [archivedPosts, setArchivedPosts] = useState<FeedPost[]>([]);
  const [archivedStories, setArchivedStories] = useState<FeedPost[]>([]);

  useEffect(() => {
    fetchArchivedContent();
  }, []);

  const fetchArchivedContent = async () => {
    try {
      // Fetch archived posts
      const postsResponse = await apiService.get('/posts/archive');
      const posts = postsResponse.map((post: any) => ({
        id: post.id,
        content: post.content,
        imageUrl: post.imageUrl.startsWith('http') ? post.imageUrl : `http://localhost:7000${post.imageUrl}`,
        username: post.user?.userName || post.user?.username || 'Unknown User',
        avatarUrl: post.user?.profilePictureUrl || `https://ui-avatars.com/api/?name=${post.user?.userName || post.user?.username || 'Unknown'}`,
        timeAgo: 'Just now',
        likeCount: post.reactions?.length || 0,
        commentCount: post.comments?.length || 0,
        isStory: post.isStory
      }));
      
      // Separate posts and stories
      setArchivedPosts(posts.filter(post => !post.isStory));
      setArchivedStories(posts.filter(post => post.isStory));
    } catch (error) {
      console.error('Error fetching archived content:', error);
    }
  };

  const handleUnarchive = async (postId: number) => {
    try {
      await apiService.put(`/posts/unarchive/${postId}`, {});
      // Remove from archived lists
      setArchivedPosts(prev => prev.filter(post => post.id !== postId));
      setArchivedStories(prev => prev.filter(post => post.id !== postId));
      Alert.alert('Success', 'Post unarchived successfully');
    } catch (error) {
      console.error('Error unarchiving post:', error);
      Alert.alert('Error', 'Failed to unarchive post');
    }
  };

  const renderContent = () => {
    const content = activeTab === 'posts' ? archivedPosts : archivedStories;
    
    if (content.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
            No {activeTab} in archive
          </Text>
        </View>
      );
    }

    return content.map(post => (
      <View key={post.id} style={styles.postCard}>
        <View style={styles.postHeader}>
          <Image source={{ uri: post.avatarUrl }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.username}>{post.username}</Text>
            <Text style={styles.time}>{post.timeAgo}</Text>
          </View>
          <TouchableOpacity 
            style={styles.unarchiveButton}
            onPress={() => handleUnarchive(post.id)}
          >
            <Text style={[styles.unarchiveButtonText, { color: colors.primary }]}>
              Unarchive
            </Text>
          </TouchableOpacity>
        </View>
        {post.imageUrl && <Image source={{ uri: post.imageUrl }} style={styles.postImage} />}
        <Text style={styles.postText}>{post.content}</Text>
      </View>
    ));
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.pageWrapper}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={[styles.backButtonText, { color: colors.primary }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Archive</Text>
        </View>

        <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'posts' && styles.tabItemActive]}
            onPress={() => setActiveTab('posts')}
          >
            <Text style={[styles.tabText, activeTab === 'posts' && styles.tabTextActive]}>
              Posts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'stories' && styles.tabItemActive]}
            onPress={() => setActiveTab('stories')}
          >
            <Text style={[styles.tabText, activeTab === 'stories' && styles.tabTextActive]}>
              Stories
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {renderContent()}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  pageWrapper: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#8B5CF6',
  },
  tabText: {
    fontSize: 16,
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#8B5CF6',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  time: {
    fontSize: 14,
    color: '#6B7280',
  },
  postImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  postText: {
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  unarchiveButton: {
    padding: 8,
  },
  unarchiveButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
  },
}); 