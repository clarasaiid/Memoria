import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Image,
  SafeAreaView,
  Pressable,
  TouchableWithoutFeedback,
  findNodeHandle,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { User as UserIcon, Search as SearchIcon, Calendar, Plus, Bell, Heart, MessageCircle, X, Users, MoreHorizontal, Trash2, Archive } from 'lucide-react-native';
import { useTheme } from '../../components/ThemeProvider';
import { searchService, SearchResult, UserResult, HashtagResult, GroupResult } from '../services/searchService';
import { FeedRecommendationService } from '../services/feedRecommendationService';
import { FeedPost, FeedMetadata } from '../types/feed';
import { apiService } from '../services/api';

const AVATAR_PLACEHOLDER = 'https://ui-avatars.com/api/?name=User&background=F3E8FF&color=A78BFA';
const CAPSULE_PLACEHOLDER = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80';

interface Capsule {
  id: number;
  title: string;
  openDate: string;
  coverUrl: string;
}

interface Person {
  id: number;
  username: string;
  avatarUrl: string;
}

const mockPublicCapsules = [
  { id: 1, title: 'Spring Break 2024', openDate: new Date(Date.now() + 86400000 * 7).toISOString(), coverUrl: CAPSULE_PLACEHOLDER },
  { id: 2, title: 'High School Memories', openDate: new Date(Date.now() + 86400000 * 30).toISOString(), coverUrl: CAPSULE_PLACEHOLDER },
  { id: 3, title: 'Family Reunion', openDate: new Date(Date.now() + 86400000 * 14).toISOString(), coverUrl: CAPSULE_PLACEHOLDER },
];

const mockComments = {
  101: [
    { id: 1, username: 'bob', text: 'Looks amazing!' },
    { id: 2, username: 'eve', text: 'Wish I was there!' },
  ],
  102: [
    { id: 1, username: 'alice', text: 'So many memories!' },
  ],
  201: [
    { id: 1, username: 'dave', text: 'Congrats!' },
  ],
};

export default function HomePage() {
  const router = useRouter();
  const [publicCapsules, setPublicCapsules] = useState<Capsule[]>([]);
  const [feedTab, setFeedTab] = useState<'for-you' | 'following'>('for-you');
  const [feed, setFeed] = useState<FeedPost[]>([]);
  const [followingFeed, setFollowingFeed] = useState<FeedPost[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [search, setSearch] = useState('');
  const { colors } = useTheme();
  const [lockedCapsuleId, setLockedCapsuleId] = useState<number | null>(null);
  const [likedPosts, setLikedPosts] = useState<{ [id: number]: boolean }>({});
  const [likeCounts, setLikeCounts] = useState<{ [id: number]: number }>({});
  const [expandedComments, setExpandedComments] = useState<{ [id: number]: boolean }>({});
  const [commentInputs, setCommentInputs] = useState<{ [id: number]: string }>({});
  const [comments, setComments] = useState<{ [id: number]: { id: number; username: string; text: string }[] }>(mockComments);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchBarRef = useRef(null);
  const searchBarContainerRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 300 });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [searchBarFocused, setSearchBarFocused] = useState(false);
  const [recommendedFeed, setRecommendedFeed] = useState<FeedPost[]>([]);
  const recommendationService = FeedRecommendationService.getInstance();
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  useEffect(() => {
    setPublicCapsules(mockPublicCapsules);
    setFeed([]);
    setFollowingFeed([]);
    setPeople([]);

    recommendationService.updateUserPreferences({
      interests: [],
      following: [],
      likedPosts: [],
      commentedPosts: [],
    });

    const recommended = recommendationService.getRecommendedFeed([]);
    setRecommendedFeed(recommended);
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await apiService.get('/posts');
        const posts = response.map((post: any) => ({
          id: post.id,
          content: post.content,
          imageUrl: post.imageUrl.startsWith('http') ? post.imageUrl : `http://localhost:7000${post.imageUrl}`,
          username: post.user?.userName || post.user?.username || 'Unknown User',
          avatarUrl: post.user?.profilePictureUrl || `https://ui-avatars.com/api/?name=${post.user?.userName || post.user?.username || 'Unknown'}`,
          timeAgo: 'Just now',
          likeCount: post.reactions?.length || 0,
          commentCount: post.comments?.length || 0
        }));
        setFeed(posts);
        setFollowingFeed(posts); // For now, show same posts in both feeds
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (!search.trim()) {
        setSearchResults(null);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchService.search(search);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [search]);

  useEffect(() => {
    if (showSearchBar && searchBarRef.current) {
      setTimeout(() => {
        searchBarRef.current.measure((x, y, width, height, pageX, pageY) => {
          setDropdownPos({ top: pageY + height, left: pageX, width });
        });
      }, 100);
    }
  }, [showSearchBar, searchBarRef.current, search]);

  useEffect(() => {
    if (!showSearchBar) return;
    function handleClick(event) {
      if (
        (searchBarContainerRef.current && searchBarContainerRef.current.contains(event.target)) ||
        (dropdownRef.current && dropdownRef.current.contains(event.target))
      ) {
        return;
      }
      setShowSearchBar(false);
      setSearch('');
      setSearchResults(null);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showSearchBar]);

  const isWide = Dimensions.get('window').width > 900;

  const styles = StyleSheet.create({
    pageWrapper: { flex: 1, backgroundColor: colors.background },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: colors.cardAlt, borderBottomWidth: 1, borderBottomColor: colors.border },
    logoText: {
      fontFamily: 'Kapsalon',
      fontSize: 48,
      color: colors.primary,
      letterSpacing: 2,
      fontWeight: 'normal',
      alignSelf: 'center',
      
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 40,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 12,
      width: 300,
      alignSelf: 'flex-end',
    },
    searchInput: { marginLeft: 8, fontSize: 15, color: colors.text, flex: 1 },
    grid: { flex: 1 },
    gridWide: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
    sidebar: { width: 300, paddingHorizontal: 12 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.primary, marginBottom: 12 },
    horizontalScroll: {
      flexGrow: 0,
    },
    horizontalScrollContent: {
      paddingRight: 16,
    },
    capsuleCard: {
      width: 280,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 12,
      marginRight: 12,
      shadowColor: '#000',
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.border,
    },
    capsuleImage: { width: 48, height: 48, borderRadius: 10, marginRight: 10 },
    capsuleTitle: { fontWeight: '600', fontSize: 14, color: colors.text },
    capsuleDate: { fontSize: 12, color: colors.textSecondary },
    feedBox: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      backgroundColor: colors.cardAlt,
      padding: 24,
      marginHorizontal: 12,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
    },
    tabBar: { 
      flexDirection: 'row', 
      marginBottom: 16,
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.cardAlt,
      borderBottomColor: colors.border,
    },
    tabItems: {
      flexDirection: 'row',
      backgroundColor: colors.cardAlt,
    },
    tabItem: { 
      marginRight: 24, 
      paddingBottom: 6 
    },
    tabItemActive: { 
      borderBottomWidth: 3, 
      borderBottomColor: colors.primary 
    },
    tabText: { 
      color: colors.textSecondary, 
      fontSize: 16, 
      fontWeight: '600' 
    },
    tabTextActive: { 
      color: colors.primary, 
      fontSize: 16, 
      fontWeight: '700',
      backgroundColor: colors.cardAlt,
    },
    notificationButton: {
      padding: 8,
      borderRadius: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    postCard: { backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 3, borderWidth: 1, borderColor: colors.border },
    postHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: colors.cardAlt,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
    },
    avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 12 },
    avatarLarge: { width: 42, height: 42, borderRadius: 21, marginRight: 10 },
    username: { fontSize: 15, fontWeight: '600', color: colors.text },
    time: { fontSize: 12, color: colors.textSecondary },
    postImage: { width: '100%', height: 200, borderRadius: 10, marginVertical: 10 },
    postText: { fontSize: 15, color: colors.text },
    userCard: {
      width: 160,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 12,
      marginRight: 12,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.03,
      shadowRadius: 4,
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.border,
    },
    followBtn: { marginLeft: 'auto', backgroundColor: colors.primary, padding: 8, borderRadius: 8 },
    sidebarBox: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      backgroundColor: colors.cardAlt,
      padding: 16,
      marginBottom: 24,
    },
    safeArea: { flex: 1 },
    addFriendBtn: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 6,
      paddingHorizontal: 18,
      marginTop: 8,
      alignItems: 'center',
    },
    addFriendBtnText: {
      color: colors.buttonText,
      fontFamily: 'Inter-Bold',
      fontSize: 15,
    },
    sidebarContent: { marginTop: 32 },
    searchResults: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      maxHeight: 500,
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      zIndex: 1001,
      padding: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
    },
    searchSection: {
      marginBottom: 16,
    },
    searchSectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
      color: colors.primary,
    },
    searchItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: colors.cardAlt,
      marginBottom: 4,
      transitionProperty: 'background-color',
      transitionDuration: '0.15s',
    },
    searchItemAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
    },
    searchItemInfo: {
      flex: 1,
    },
    searchItemName: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.text,
    },
    searchItemSubtext: {
      fontSize: 13,
      marginTop: 2,
      color: colors.textSecondary,
    },
    hashtagIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.cardAlt,
    },
    hashtagText: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.primary,
    },
    groupIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.cardAlt,
    },
    noResults: {
      textAlign: 'center',
      padding: 20,
      fontSize: 15,
      color: colors.textSecondary,
    },
    menuButton: {
      padding: 8,
      marginLeft: 'auto',
      zIndex: 1,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    menuContent: {
      width: 200,
      borderRadius: 12,
      padding: 8,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 8,
    },
    menuItemText: {
      marginLeft: 12,
      fontSize: 16,
      fontWeight: '500',
    },
  });

  const renderSearchResults = () => {
    if (!searchResults) return null;

    return (
      <View style={[styles.searchResults, { backgroundColor: colors.card }]}>
        {/* Users */}
        {searchResults.users.length > 0 && (
          <View style={styles.searchSection}>
            <Text style={[styles.searchSectionTitle, { color: colors.primary }]}>Users</Text>
            {searchResults.users.map((user, i) => (
              <TouchableOpacity
                key={user.id}
                style={[styles.searchItem, { backgroundColor: hoveredIndex === i ? colors.card : colors.cardAlt }]}
                onPress={() => {
                  setShowSearchBar(false);
                  setSearch('');
                  router.push(`/profile/${user.userName}`);
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <Image
                  source={{ uri: user.profilePictureUrl || `https://ui-avatars.com/api/?name=${user.userName}` }}
                  style={styles.searchItemAvatar}
                />
                <View style={styles.searchItemInfo}>
                  <Text style={[styles.searchItemName, { color: colors.text }]}>{user.userName}</Text>
                  <Text style={[styles.searchItemSubtext, { color: colors.textSecondary }]}>
                    {user.firstName} {user.lastName}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Hashtags */}
        {searchResults.hashtags.length > 0 && (
          <View style={styles.searchSection}>
            <Text style={[styles.searchSectionTitle, { color: colors.primary }]}>Hashtags</Text>
            {searchResults.hashtags.map((hashtag, i) => (
              <TouchableOpacity
                key={hashtag.tag}
                style={[styles.searchItem, { backgroundColor: hoveredIndex === i ? colors.card : colors.cardAlt }]}
                onPress={() => {
                  setShowSearchBar(false);
                  setSearch('');
                  router.push(`/hashtag/${hashtag.tag}`);
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <View style={[styles.hashtagIcon, { backgroundColor: hoveredIndex === i ? colors.primary : colors.cardAlt }]}>
                  <Text style={[styles.hashtagText, { color: hoveredIndex === i ? colors.buttonText : colors.primary }]}>#</Text>
                </View>
                <View style={styles.searchItemInfo}>
                  <Text style={[styles.searchItemName, { color: colors.text }]}>{hashtag.tag}</Text>
                  <Text style={[styles.searchItemSubtext, { color: colors.textSecondary }]}>
                    {hashtag.count} posts
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Groups */}
        {searchResults.groups.length > 0 && (
          <View style={styles.searchSection}>
            <Text style={[styles.searchSectionTitle, { color: colors.primary }]}>Groups</Text>
            {searchResults.groups.map((group, i) => (
              <TouchableOpacity
                key={group.id}
                style={[styles.searchItem, { backgroundColor: hoveredIndex === i ? colors.card : colors.cardAlt }]}
                onPress={() => {
                  setShowSearchBar(false);
                  setSearch('');
                  router.push(`/groups/${group.id}`);
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <View style={[styles.groupIcon, { backgroundColor: hoveredIndex === i ? colors.primary : colors.cardAlt }]}>
                  <Users size={20} color={hoveredIndex === i ? colors.buttonText : colors.primary} />
                </View>
                <View style={styles.searchItemInfo}>
                  <Text style={[styles.searchItemName, { color: colors.text }]}>{group.name}</Text>
                  <Text style={[styles.searchItemSubtext, { color: colors.textSecondary }]}>
                    {group.memberCount} members
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* No Results */}
        {searchResults.users.length === 0 && 
         searchResults.hashtags.length === 0 && 
         searchResults.groups.length === 0 && (
          <Text style={[styles.noResults, { color: colors.textSecondary }]}>
            No results found
          </Text>
        )}
      </View>
    );
  };

  const extractHashtags = (content: string): string[] => {
    const hashtagRegex = /#[\w-]+/g;
    return content.match(hashtagRegex) || [];
  };

  const determineCategory = (content: string): string => {
    const categories = {
      travel: ['travel', 'trip', 'vacation', 'beach', 'mountain'],
      photography: ['photo', 'picture', 'camera', 'shot'],
      memories: ['memory', 'remember', 'throwback', 'nostalgia'],
    };

    const contentLower = content.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => contentLower.includes(keyword))) {
        return category;
      }
    }
    return 'general';
  };

  const calculateEngagement = (post: FeedPost): number => {
    const likes = post.likeCount || 0;
    const comments = post.commentCount || 0;
    return (likes + comments * 2) / 100;
  };

  const calculateRecency = (timeAgo: string): number => {
    const hours = parseInt(timeAgo);
    if (isNaN(hours)) return 0.5;
    return Math.max(0, 1 - hours / 24);
  };

  const renderFeed = () => {
    const currentFeed = feedTab === 'for-you' ? recommendedFeed : followingFeed;
    return currentFeed.map(post => (
      <View key={post.id} style={styles.postCard}>
        <View style={styles.postHeader}>
          <Image source={{ uri: post.avatarUrl }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.username}>{post.username}</Text>
            <Text style={styles.time}>{post.timeAgo}</Text>
          </View>
          <TouchableOpacity 
            style={styles.menuButton} 
            onPress={() => handleMenuPress(post.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MoreHorizontal size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
        {post.imageUrl && <Image source={{ uri: post.imageUrl }} style={styles.postImage} />}
        <Text style={styles.postText}>{post.content}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <TouchableOpacity onPress={() => {
            setLikedPosts(prev => ({ ...prev, [post.id]: !prev[post.id] }));
            setLikeCounts(prev => {
              const current = prev[post.id] ?? post.likeCount ?? 0;
              return { ...prev, [post.id]: likedPosts[post.id] ? current - 1 : current + 1 };
            });
          }} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
            <Heart size={20} color={likedPosts[post.id] ? '#EC4899' : colors.primary} fill={likedPosts[post.id] ? '#EC4899' : 'none'} style={{ marginRight: 6 }} />
            <Text style={{ color: colors.text }}>{likeCounts[post.id] ?? post.likeCount ?? 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MessageCircle size={20} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={{ color: colors.text }}>{comments[post.id]?.length ?? post.commentCount ?? 0}</Text>
          </TouchableOpacity>
        </View>
        {expandedComments[post.id] && (
          <View style={{ marginTop: 10, backgroundColor: colors.cardAlt, borderRadius: 10, padding: 12 }}>
            {comments[post.id]?.map(c => (
              <Text key={c.id} style={{ color: colors.text, marginBottom: 6 }}><Text style={{ fontWeight: 'bold' }}>{c.username}:</Text> {c.text}</Text>
            ))}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              <TextInput
                style={{ flex: 1, backgroundColor: colors.card, borderRadius: 8, padding: 8, color: colors.text, borderWidth: 1, borderColor: colors.border }}
                placeholder="Add a comment..."
                placeholderTextColor={colors.textSecondary}
                value={commentInputs[post.id] ?? ''}
                onChangeText={text => setCommentInputs(prev => ({ ...prev, [post.id]: text }))}
              />
              <TouchableOpacity
                onPress={() => {
                  if ((commentInputs[post.id] ?? '').trim()) {
                    setComments(prev => ({
                      ...prev,
                      [post.id]: [
                        ...(prev[post.id] ?? []),
                        { id: Date.now(), username: 'you', text: commentInputs[post.id] }
                      ]
                    }));
                    setCommentInputs(prev => ({ ...prev, [post.id]: '' }));
                  }
                }}
                style={{ marginLeft: 8, backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 }}
              >
                <Text style={{ color: colors.buttonText, fontWeight: 'bold' }}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    ));
  };

  const handleMenuPress = (postId: number) => {
    setSelectedPostId(postId);
    setMenuVisible(true);
  };

  const handleArchivePost = async () => {
    if (!selectedPostId) return;
    try {
      await apiService.put(`/posts/archive/${selectedPostId}`, {});
      // Update all feeds
      setFeed(prev => prev.filter(post => post.id !== selectedPostId));
      setFollowingFeed(prev => prev.filter(post => post.id !== selectedPostId));
      setRecommendedFeed(prev => prev.filter(post => post.id !== selectedPostId));
      Alert.alert('Success', 'Post archived successfully');
    } catch (error) {
      console.error('Error archiving post:', error);
      Alert.alert('Error', 'Failed to archive post');
    } finally {
      setMenuVisible(false);
      setSelectedPostId(null);
    }
  };

  const handleDeletePost = async () => {
    if (!selectedPostId) return;
    try {
      await apiService.delete(`/posts/${selectedPostId}`);
      // Update all feeds
      setFeed(prev => prev.filter(post => post.id !== selectedPostId));
      setFollowingFeed(prev => prev.filter(post => post.id !== selectedPostId));
      setRecommendedFeed(prev => prev.filter(post => post.id !== selectedPostId));
      Alert.alert('Success', 'Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      Alert.alert('Error', 'Failed to delete post');
    } finally {
      setMenuVisible(false);
      setSelectedPostId(null);
    }
  };

  return (
    <>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }] }>
        <View style={styles.pageWrapper}>
          <View style={[styles.grid, isWide && styles.gridWide]}>
            {isWide && (
              <View style={styles.sidebar}>
                <Text style={styles.logoText}>MEMORIA</Text>
                <View style={styles.sidebarContent}>
                  <View style={[styles.sidebarBox, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
                    <TouchableOpacity onPress={() => router.navigate('/time-capsules')}>
                      <Text style={[styles.sectionTitle, {color: colors.primary }]}>Time Capsules</Text>
                    </TouchableOpacity>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false} 
                      style={styles.horizontalScroll}
                      contentContainerStyle={styles.horizontalScrollContent}
                    >
                      {publicCapsules.map(c => (
                        <TouchableOpacity key={c.id} style={styles.capsuleCard} onPress={() => {
                          if (new Date(c.openDate) <= new Date()) {
                            router.push({ pathname: '/(capsule)/view', params: { id: c.id } });
                          } else {
                            setLockedCapsuleId(c.id);
                            setTimeout(() => setLockedCapsuleId(null), 2500);
                          }
                        }}>
                          <Image source={{ uri: c.coverUrl }} style={styles.capsuleImage} />
                          <View>
                            <Text style={styles.capsuleTitle}>{c.title}</Text>
                            <Text style={styles.capsuleDate}>Opens: {new Date(c.openDate).toLocaleDateString()}</Text>
                          </View>
                          {lockedCapsuleId === c.id && (
                            <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>This time capsule is still locked</Text>
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  <View style={[styles.sidebarBox, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
                    <TouchableOpacity onPress={() => router.navigate('/people-suggestions')}>
                      <Text style={[styles.sectionTitle, {color: colors.primary }]}>People You May Know</Text>
                    </TouchableOpacity>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false} 
                      style={styles.horizontalScroll}
                      contentContainerStyle={styles.horizontalScrollContent}
                    >
                      {people.map(p => (
                        <View key={p.id} style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                          <Image source={{ uri: p.avatarUrl }} style={styles.avatarLarge} />
                          <Text style={styles.username}>{p.username}</Text>
                          <TouchableOpacity style={[styles.addFriendBtn]}>
                            <Text style={styles.addFriendBtnText}>Add Friend</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.feedBox}>
              <View style={[styles.tabBar, { position: 'relative' }]}>
                <View style={styles.tabItems}>
                  {(['for-you', 'following'] as const).map(tab => (
                    <TouchableOpacity
                      key={tab}
                      style={[styles.tabItem, feedTab === tab && styles.tabItemActive]}
                      onPress={() => setFeedTab(tab)}
                    >
                      <Text style={feedTab === tab ? styles.tabTextActive : styles.tabText}>
                        {tab === 'for-you' ? 'For You' : 'Following'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={{ position: 'absolute', right: 0, top: 0, height: '100%', flexDirection: 'row', alignItems: 'center', zIndex: 10 }}>
                  <View ref={searchBarContainerRef} style={{ flexDirection: 'row', alignItems: 'center', position: 'relative' }}>
                    {showSearchBar && (
                      <View
                        ref={searchBarRef}
                        style={[
                          styles.searchBar,
                          {
                            position: 'relative',
                            width: 256,
                            height: 40,
                            minHeight: 40,
                            maxHeight: 40,
                            marginBottom: 0,
                            backgroundColor: colors.card,
                            borderTopLeftRadius: 12,
                            borderBottomLeftRadius: 12,
                            borderTopRightRadius: 0,
                            borderBottomRightRadius: 0,
                            shadowOpacity: 0,
                            borderBottomWidth: 0,
                            borderWidth: 1,
                            borderColor: colors.border,
                            transitionProperty: 'width',
                            transitionDuration: '0.2s',
                            transitionTimingFunction: 'ease',
                            zIndex: 11,
                            flexDirection: 'row',
                            alignItems: 'center',
                          },
                        ]}
                      >
                        <TextInput
                          style={[
                            styles.searchInput,
                            {
                              height: 40,
                              minHeight: 40,
                              maxHeight: 40,
                              paddingVertical: 0,
                              lineHeight: 40,
                              flex: 1,
                            },
                          ]}
                          placeholder="Search Memoria..."
                          placeholderTextColor={colors.textSecondary}
                          value={search}
                          onChangeText={setSearch}
                          autoFocus
                          onFocus={() => setSearchBarFocused(true)}
                          onBlur={() => setSearchBarFocused(false)}
                        />
                        <TouchableOpacity onPress={() => {
                          setShowSearchBar(false);
                          setSearch('');
                          setSearchResults(null);
                        }}>
                          <X size={22} color={colors.text} />
                        </TouchableOpacity>
                      </View>
                    )}
                    <TouchableOpacity
                      onPress={() => setShowSearchBar(true)}
                      style={[
                        styles.notificationButton,
                        {
                          borderTopRightRadius: 12,
                          borderBottomRightRadius: 12,
                          borderTopLeftRadius: showSearchBar ? 0 : 12,
                          borderBottomLeftRadius: showSearchBar ? 0 : 12,
                          backgroundColor: colors.card,
                          zIndex: 12,
                          marginLeft: showSearchBar ? 0 : 8,
                          borderLeftWidth: showSearchBar ? 0 : 1,
                          borderColor: colors.border,
                          height: 40,
                          width: 40,
                          justifyContent: 'center',
                          alignItems: 'center',
                        },
                      ]}
                    >
                      <SearchIcon size={20} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.notificationButton, { marginLeft: 8 }]}
                      onPress={() => router.push('/notifications')}
                    >
                      <Bell size={20} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {renderFeed()}
              </ScrollView>
            </View>
          </View>
          {showSearchBar && searchResults && (
            <View
              ref={dropdownRef}
              style={{
                position: 'absolute',
                top: dropdownPos.top,
                left: dropdownPos.left,
                width: dropdownPos.width,
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderWidth: 1,
                borderTopWidth: 0,
                zIndex: 2000,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.18,
                shadowRadius: 24,
                elevation: 10,
                borderRadius: 12,
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                maxHeight: 500,
                padding: 12,
                paddingTop: 0,
                marginTop: -4,
                overflow: 'visible',
              }}
            >
              <View style={{ height: 1, backgroundColor: colors.border, opacity: 0.5, marginHorizontal: -12, marginBottom: 8 }} />
              {renderSearchResults()}
            </View>
          )}
        </View>
      </SafeAreaView>

      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.menuContent, { backgroundColor: colors.card }]}>
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={handleArchivePost}
            >
              <Archive size={20} color={colors.text} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Archive</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={handleDeletePost}
            >
              <Trash2 size={20} color="#EF4444" />
              <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}
