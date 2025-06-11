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
  ViewStyle,
  TextStyle,
  ImageStyle,
  GestureResponderEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { User as UserIcon, Search as SearchIcon, Calendar, Plus, Bell, Heart, MessageCircle, X, Users, MoreHorizontal, Trash2, Archive, Home } from 'lucide-react-native';
import { useTheme } from '../../components/ThemeProvider';
import { searchService, SearchResult, UserResult, HashtagResult, GroupResult } from '../services/searchService';
import { FeedRecommendationService } from '../services/feedRecommendationService';
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

interface User {
  id: number;
  userName: string;
  profilePictureUrl?: string;
}

interface LocalFeedPost {
  id: number;
  content: string;
  imageUrl: string;
  username: string;
  avatarUrl: string;
  timeAgo: string;
  likeCount: number;
  commentCount: number;
}

interface Post extends LocalFeedPost {
  viewCount: number;
  followerCount: number;
  postCount: number;
}

interface SearchBarMeasurements {
  x: number;
  y: number;
  width: number;
  height: number;
  pageX: number;
  pageY: number;
}

interface Styles {
  pageWrapper: ViewStyle;
  topBar: ViewStyle;
  logo: TextStyle;
  searchBar: ViewStyle;
  searchInput: TextStyle;
  searchIcon: ViewStyle;
  feedContainer: ViewStyle;
  feedTabs: ViewStyle;
  feedTab: ViewStyle;
  activeFeedTab: ViewStyle;
  feedTabText: TextStyle;
  activeFeedTabText: TextStyle;
  postCard: ViewStyle;
  postHeader: ViewStyle;
  userInfo: ViewStyle;
  avatar: ImageStyle;
  username: TextStyle;
  postImage: ImageStyle;
  postActions: ViewStyle;
  actionButton: ViewStyle;
  actionText: TextStyle;
  postContent: ViewStyle;
  caption: TextStyle;
  menuItem: ViewStyle;
  menuItemText: TextStyle;
  searchResults: ViewStyle;
  searchSection: ViewStyle;
  searchSectionTitle: TextStyle;
  searchItem: ViewStyle;
  safeArea: ViewStyle;
  grid: ViewStyle;
  gridWide: ViewStyle;
  sidebar: ViewStyle;
  sidebarContent: ViewStyle;
  sidebarBox: ViewStyle;
  sectionTitle: TextStyle;
  horizontalScroll: ViewStyle;
  horizontalScrollContent: ViewStyle;
  capsuleCard: ViewStyle;
  capsuleImage: ImageStyle;
  capsuleTitle: TextStyle;
  capsuleDate: TextStyle;
  userCard: ViewStyle;
  avatarLarge: ImageStyle;
  addFriendBtn: ViewStyle;
  addFriendBtnText: TextStyle;
  feedBox: ViewStyle;
  tabBar: ViewStyle;
  tabItems: ViewStyle;
  tabItem: ViewStyle;
  tabItemActive: ViewStyle;
  tabText: TextStyle;
  tabTextActive: TextStyle;
  notificationButton: ViewStyle;
  modalOverlay: ViewStyle;
  menuContent: ViewStyle;
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

// Add navigation items for sidebar
const NAV_ITEMS = [
  { label: 'Home', icon: 'Home', route: '/' },
  { label: 'Messages', icon: 'MessageCircle', route: '/messages' },
  { label: 'Profile', icon: 'User', route: '/profile' },
  { label: 'My Groups', icon: 'Users', route: '/my-groups' },
];

const SIDEBAR_WIDTH = 200;
const SIDEBAR_BG = '#23272f';
const SIDEBAR_TEXT = '#fff';
const SIDEBAR_ACTIVE = '#3b82f6';
const SIDEBAR_AVATAR_PLACEHOLDER = 'https://ui-avatars.com/api/?name=User&background=F3E8FF&color=A78BFA';

export const options = { headerShown: false };

export default function HomePage() {
  const router = useRouter();
  const [publicCapsules, setPublicCapsules] = useState<Capsule[]>([]);
  const [feedTab, setFeedTab] = useState<'for-you' | 'following'>('for-you');
  const [feed, setFeed] = useState<LocalFeedPost[]>([]);
  const [followingFeed, setFollowingFeed] = useState<LocalFeedPost[]>([]);
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
  const searchBarRef = useRef<View>(null);
  const searchBarContainerRef = useRef<View>(null);
  const dropdownRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [searchBarFocused, setSearchBarFocused] = useState(false);
  const [recommendedFeed, setRecommendedFeed] = useState<LocalFeedPost[]>([]);
  const recommendationService = FeedRecommendationService.getInstance();
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [searchBarMeasurements, setSearchBarMeasurements] = useState<SearchBarMeasurements>({ x: 0, y: 0, width: 0, height: 0, pageX: 0, pageY: 0 });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [sidebarUser, setSidebarUser] = useState<{ userName: string; profilePictureUrl?: string } | null>(null);

  const handleUserSelect = (username: string) => {
    console.log('Navigating to profile:', username);
    Alert.alert('Navigation', `Attempting to navigate to /profile/${username}`);
    router.push(`/profile/${username}`);
    setShowSearchBar(false);
    setSearch('');
  };

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

    // Use real data, not metadata, for the initial recommended feed
    setRecommendedFeed(
      (recommendationService.getRecommendedFeed(feed).map((post: any) => ({
        id: post.id,
        content: post.content,
        imageUrl: typeof post.imageUrl === 'string' ? post.imageUrl : '',
        username: post.username,
        avatarUrl: post.avatarUrl,
        timeAgo: post.timeAgo,
        likeCount: typeof post.likeCount === 'number' ? post.likeCount : 0,
        commentCount: typeof post.commentCount === 'number' ? post.commentCount : 0
      })) as LocalFeedPost[])
    );
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await apiService.get<any[]>('/api/posts');
        const postsRaw = response.filter((post: any) => !post.isArchived);
        const posts: LocalFeedPost[] = postsRaw.map((post: any) => ({
            id: post.id,
            content: post.content,
          imageUrl: post.imageUrl && typeof post.imageUrl === 'string' ? post.imageUrl : '',
            username: post.user?.userName || post.user?.username || 'Unknown User',
            avatarUrl: post.user?.profilePictureUrl || `https://ui-avatars.com/api/?name=${post.user?.userName || post.user?.username || 'Unknown'}`,
            timeAgo: 'Just now',
          likeCount: typeof post.reactions?.length === 'number' ? post.reactions.length : 0,
          commentCount: typeof post.comments?.length === 'number' ? post.comments.length : 0
        }));

        const currentUser = (await apiService.get<User>('/api/auth/me')) as any;
        // Handle both { id } and { profile: { id } }
        const userId = currentUser.id || currentUser.profile?.id;
        console.log('Current user:', currentUser, 'Extracted userId:', userId);
        if (!userId) {
          console.error('No current user or user id!');
          return;
        }

        const following = (await apiService.get<User[]>(`/api/users/${userId}/following`)) as User[];
        recommendationService.updateUserPreferences({
          following: following.map(f => f.userName)
        });

        setRecommendedFeed(
          (recommendationService.getRecommendedFeed(posts).map((post: any) => ({
            id: post.id,
            content: post.content,
            imageUrl: typeof post.imageUrl === 'string' ? post.imageUrl : '',
            username: post.username,
            avatarUrl: post.avatarUrl,
            timeAgo: post.timeAgo,
            likeCount: typeof post.likeCount === 'number' ? post.likeCount : 0,
            commentCount: typeof post.commentCount === 'number' ? post.commentCount : 0
          })) as LocalFeedPost[])
        );
        setFeed(posts);
        setFollowingFeed(posts.filter(post => following.some(f => f.userName === post.username)));
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
        searchBarRef.current?.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
          setDropdownPos({ top: pageY + height, left: pageX, width });
        });
      }, 100);
    }
  }, [showSearchBar, searchBarRef.current, search]);

  useEffect(() => {
    if (!showSearchBar) return;
    function handleClick(event: MouseEvent) {
      const target = event.target as Node;
      const container = searchBarContainerRef.current as null | { contains?: (node: Node) => boolean };
      const dropdown = dropdownRef.current as null | { contains?: (node: Node) => boolean };
      if (
        (container && typeof container.contains === 'function' && container.contains(target)) ||
        (dropdown && typeof dropdown.contains === 'function' && dropdown.contains(target))
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

  useEffect(() => {
    // Fetch real user data for sidebar
    apiService.get('/api/auth/me').then((user: any) => {
      setSidebarUser({
        userName: user.userName || 'User',
        profilePictureUrl: user.profilePictureUrl || '',
      });
    });
  }, []);

  const isWide = Dimensions.get('window').width > 900;

  const styles = StyleSheet.create<Styles>({
    pageWrapper: { flex: 1, backgroundColor: colors.background },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: colors.cardAlt },
    logo: { fontFamily: 'Kapsalon', fontSize: 48, color: colors.text },
    searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 8, paddingHorizontal: 12, marginHorizontal: 16 },
    searchInput: { flex: 1, height: 40, color: colors.text },
    searchIcon: { marginRight: 8 },
    feedContainer: { flex: 1 },
    feedTabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
    feedTab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
    activeFeedTab: { borderBottomWidth: 2, borderBottomColor: colors.primary },
    feedTabText: { color: colors.textSecondary },
    activeFeedTabText: { color: colors.primary, fontWeight: '600' },
    postCard: { backgroundColor: colors.card, marginBottom: 16, borderRadius: 8, overflow: 'hidden' },
    postHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
    userInfo: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8 },
    username: { color: colors.text, fontWeight: '600' },
    postImage: { width: '100%', aspectRatio: 1 },
    postActions: { flexDirection: 'row', padding: 12 },
    actionButton: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
    actionText: { color: colors.text, marginLeft: 4 },
    postContent: { padding: 12 },
    caption: { color: colors.text },
    menuItem: { padding: 12 },
    menuItemText: { color: colors.text },
    searchResults: { position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: colors.cardAlt, borderRadius: 8, marginTop: 4, padding: 8, zIndex: 1000 },
    searchSection: { marginBottom: 16 },
    searchSectionTitle: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 },
    searchItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: colors.card, marginBottom: 4 },
    safeArea: { flex: 1, backgroundColor: colors.background },
    grid: { flex: 1, padding: 16 },
    gridWide: { flex: 1, padding: 16, maxWidth: 600, alignSelf: 'center' },
    sidebar: { width: 300, borderRightWidth: 1, borderRightColor: colors.border, padding: 16 },
    sidebarContent: { flex: 1 },
    sidebarBox: { padding: 16, borderRadius: 8, borderWidth: 1, marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 16 },
    horizontalScroll: { marginBottom: 24 },
    horizontalScrollContent: { paddingHorizontal: 16 },
    capsuleCard: { width: 200, marginRight: 16, backgroundColor: colors.card, borderRadius: 8, overflow: 'hidden' },
    capsuleImage: { width: '100%', height: 120 },
    capsuleTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginTop: 8, marginHorizontal: 12 },
    capsuleDate: { fontSize: 12, color: colors.textSecondary, marginHorizontal: 12, marginBottom: 8 },
    userCard: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: colors.card, borderRadius: 8, marginBottom: 8 },
    avatarLarge: { width: 40, height: 40, borderRadius: 20, marginRight: 8 },
    addFriendBtn: { padding: 8, backgroundColor: colors.primary, borderRadius: 8 },
    addFriendBtnText: { color: colors.buttonText, fontWeight: 'bold' },
    feedBox: { flex: 1 },
    tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
    tabItems: { flexDirection: 'row', flex: 1 },
    tabItem: { flex: 1, paddingVertical: 12, alignItems: 'center' },
    tabItemActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
    tabText: { color: colors.textSecondary },
    tabTextActive: { color: colors.primary, fontWeight: '600' },
    notificationButton: { padding: 8, backgroundColor: colors.card, borderRadius: 8 },
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    menuContent: { padding: 16, borderRadius: 8, width: 200 },
  });

  const handlePostInteraction = (postId: number, type: 'view' | 'like' | 'comment') => {
    recommendationService.recordPostInteraction(postId, type);
  };

  const renderFeed = () => {
    const currentFeed = feedTab === 'for-you' ? recommendedFeed : followingFeed;
    return currentFeed.map(post => (
      <View key={post.id} style={styles.postCard}>
        <View style={styles.postHeader}>
          <TouchableOpacity 
            style={styles.userInfo}
            onPress={() => router.push(`/profile/${post.username}`)}
          >
            <Image
              source={{ uri: post.avatarUrl }}
              style={styles.avatar}
            />
            <Text style={styles.username}>{post.username}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleMenuPress(post.id)}>
            <MoreHorizontal size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={() => {
            handlePostInteraction(post.id, 'view');
            router.push({ pathname: '/post/[id]', params: { id: post.id.toString() } });
          }}
        >
          <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
          </TouchableOpacity>

        <View style={styles.postActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              handlePostInteraction(post.id, 'like');
              setFeed(prev => prev.map(p => 
                p.id === post.id ? { ...p, likeCount: (p.likeCount || 0) + 1 } : p
              ));
              setRecommendedFeed(prev => prev.map(p => 
                p.id === post.id ? { ...p, likeCount: (p.likeCount || 0) + 1 } : p
              ));
            }}
          >
            <Heart size={20} color={colors.primary} />
            <Text style={styles.actionText}>{post.likeCount || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              handlePostInteraction(post.id, 'comment');
              router.push({ pathname: '/post/[id]', params: { id: post.id.toString() } });
            }}
          >
            <MessageCircle size={20} color={colors.primary} />
            <Text style={styles.actionText}>{post.commentCount || 0}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.postContent}>
          <Text style={styles.caption}>
            <Text style={styles.username}>{post.username}</Text> {post.content}
          </Text>
        </View>

        {expandedComments[post.id] && (
          <View style={{ marginTop: 10, backgroundColor: colors.cardAlt, borderRadius: 10, padding: 12 }}>
            {comments[post.id]?.map(c => (
              <Text key={c.id} style={{ color: colors.text, marginBottom: 6 }}>
                <Text style={{ fontWeight: 'bold' }}>{c.username}:</Text> {c.text}
              </Text>
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
      await apiService.put(`/api/posts/archive/${selectedPostId}`, {});
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
      await apiService.delete(`/api/posts/${selectedPostId}`);
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

  // Restore dropdownPos measurement and handler
  const handleSearchBarFocus = () => {
    setShowSearchBar(true);
    if (searchBarContainerRef.current) {
      searchBarContainerRef.current.measure((x, y, width, height, pageX, pageY) => {
        setDropdownPos({ top: pageY + height, left: pageX, width });
      });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Custom Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.logo}>MEMORIA</Text>
        <View ref={searchBarContainerRef} style={styles.searchBar}>
          <SearchIcon size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor={colors.textSecondary}
            value={search}
            onFocus={handleSearchBarFocus}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => router.push('/notifications')}
        >
          <Bell size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Results Dropdown (floating above all content) */}
      {showSearchBar && searchResults && (
        <View style={{
          position: 'absolute',
          top: dropdownPos.top,
          left: dropdownPos.left,
          width: dropdownPos.width,
          backgroundColor: colors.card,
          zIndex: 9999,
          borderRadius: 8,
          padding: 8,
          maxHeight: 400,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          pointerEvents: 'auto',
        }}>
          {/* Users */}
          {searchResults.users.length > 0 && (
            <>
              <Text style={{ fontWeight: 'bold', marginBottom: 4, color: colors.primary }}>Users</Text>
              {searchResults.users.map(user => (
                <TouchableOpacity key={user.id} onPress={() => handleUserSelect(user.userName)} style={{ paddingVertical: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image source={{ uri: user.profilePictureUrl }} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }} />
                    <Text style={{ color: colors.text }}>{user.userName} ({user.firstName} {user.lastName})</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
          {/* Hashtags */}
          {searchResults.hashtags.length > 0 && (
            <>
              <Text style={{ fontWeight: 'bold', marginTop: 8, marginBottom: 4, color: colors.primary }}>Hashtags</Text>
              {searchResults.hashtags.map((hashtag, idx) => (
                <Text key={idx} style={{ color: colors.text }}>#{hashtag.tag} ({hashtag.count})</Text>
              ))}
            </>
          )}
          {/* Groups */}
          {searchResults.groups.length > 0 && (
            <>
              <Text style={{ fontWeight: 'bold', marginTop: 8, marginBottom: 4, color: colors.primary }}>Groups</Text>
              {searchResults.groups.map(group => (
                <TouchableOpacity key={group.id} onPress={() => router.push(`/groups/${group.id}`)} style={{ paddingVertical: 6 }}>
                  <Text style={{ color: colors.text }}>{group.name} ({group.memberCount} members)</Text>
                </TouchableOpacity>
              ))}
            </>
          )}
          {/* No results */}
          {searchResults.users.length === 0 && searchResults.hashtags.length === 0 && searchResults.groups.length === 0 && (
            <Text style={{ color: colors.textSecondary }}>No results found.</Text>
          )}
        </View>
      )}

      {/* Main Content Row: Feed + Sidebar */}
      <View style={{ flex: 1, flexDirection: 'row', backgroundColor: colors.background }}>
        {/* Center Feed (centered) */}
        <View style={{
          flex: 1,
          maxWidth: 700,
          marginLeft: 'auto',
          marginRight: 'auto',
          borderRightWidth: 1,
          borderRightColor: colors.border,
          borderLeftWidth: 1,
          borderLeftColor: colors.border,
          backgroundColor: colors.background,
          paddingHorizontal: 16,
          paddingVertical: 24,
        }}>
          {/* Feed Tabs */}
          <View style={styles.feedTabs}>
            <TouchableOpacity 
              style={[styles.feedTab, feedTab === 'for-you' && styles.activeFeedTab]}
              onPress={() => setFeedTab('for-you')}
            >
              <Text style={[styles.feedTabText, feedTab === 'for-you' && styles.activeFeedTabText]}>
                For You
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.feedTab, feedTab === 'following' && styles.activeFeedTab]}
              onPress={() => setFeedTab('following')}
            >
              <Text style={[styles.feedTabText, feedTab === 'following' && styles.activeFeedTabText]}>
                Following
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, marginTop: 16 }}>
            {renderFeed()}
          </ScrollView>
        </View>

        {/* Right Sidebar */}
        <View style={{ 
          width: 340, 
          padding: 24, 
          backgroundColor: colors.background, 
          borderLeftWidth: 1,
          borderLeftColor: colors.border,
        }}>
          <View style={[styles.sidebarBox, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}> 
            <Text style={[styles.sectionTitle, {color: colors.primary }]}>Time Capsules</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll} contentContainerStyle={styles.horizontalScrollContent}>
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
          <View style={[styles.sidebarBox, { backgroundColor: colors.cardAlt, borderColor: colors.border, marginTop: 32 }]}> 
            <Text style={[styles.sectionTitle, {color: colors.primary }]}>People You May Know</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll} contentContainerStyle={styles.horizontalScrollContent}>
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
    </View>
  );
}
