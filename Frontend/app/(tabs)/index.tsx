import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { User as UserIcon, Search as SearchIcon, Calendar, Plus, Bell, Heart, MessageCircle, X } from 'lucide-react-native';
import { useTheme } from '../../components/ThemeProvider';

const AVATAR_PLACEHOLDER = 'https://ui-avatars.com/api/?name=User&background=F3E8FF&color=A78BFA';
const CAPSULE_PLACEHOLDER = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80';

interface Capsule {
  id: number;
  title: string;
  openDate: string;
  coverUrl: string;
}

interface FeedPost {
  id: number;
  username: string;
  avatarUrl: string;
  timeAgo: string;
  imageUrl: string | null;
  content: string;
  likeCount?: number;
  commentCount?: number;
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

const mockFeed = [
  { id: 101, username: 'alice', avatarUrl: AVATAR_PLACEHOLDER, timeAgo: '2h ago', imageUrl: CAPSULE_PLACEHOLDER, content: 'Had an amazing time at the beach! 🌊', likeCount: 10, commentCount: 5 },
  { id: 102, username: 'bob', avatarUrl: AVATAR_PLACEHOLDER, timeAgo: '5h ago', imageUrl: null, content: 'Just opened my time capsule from 2019. So many memories!', likeCount: 5, commentCount: 2 },
];

const mockFollowingFeed = [
  { id: 201, username: 'carol', avatarUrl: AVATAR_PLACEHOLDER, timeAgo: '1d ago', imageUrl: CAPSULE_PLACEHOLDER, content: 'Throwback to our graduation day! 🎓', likeCount: 15, commentCount: 8 },
];

const mockPeople = [
  { id: 301, username: 'dave', avatarUrl: AVATAR_PLACEHOLDER },
  { id: 302, username: 'eve', avatarUrl: AVATAR_PLACEHOLDER },
  { id: 303, username: 'frank', avatarUrl: AVATAR_PLACEHOLDER },
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

  useEffect(() => {
    setPublicCapsules(mockPublicCapsules);
    setFeed(mockFeed);
    setFollowingFeed(mockFollowingFeed);
    setPeople(mockPeople);
  }, []);

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
      borderRadius: 8,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    postCard: { backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 3, borderWidth: 1, borderColor: colors.border },
    postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
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
  });

  return (
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
            <View style={styles.tabBar}>
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
              {showSearchBar ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginLeft: 16 }}>
                  <TextInput
                    style={{ flex: 1, backgroundColor: colors.card, borderRadius: 8, paddingHorizontal: 12, height: 40, color: colors.text, borderWidth: 1, borderColor: colors.border }}
                    placeholder="Search Memoria..."
                    placeholderTextColor={colors.textSecondary}
                    value={search}
                    onChangeText={setSearch}
                    autoFocus
                  />
                  <TouchableOpacity onPress={() => setShowSearchBar(false)} style={{ marginLeft: 8 }}>
                    <X size={22} color={colors.text} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity onPress={() => setShowSearchBar(true)} style={styles.notificationButton}>
                    <SearchIcon size={20} color={colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.notificationButton, { marginLeft: 8 }]}
                    onPress={() => router.push('/notifications')}
                  >
                    <Bell size={20} color={colors.text} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {(feedTab === 'for-you' ? feed : followingFeed).map(post => (
                <View key={post.id} style={styles.postCard}>
                  <View style={styles.postHeader}>
                    <Image source={{ uri: post.avatarUrl }} style={styles.avatar} />
                    <View>
                      <Text style={styles.username}>{post.username}</Text>
                      <Text style={styles.time}>{post.timeAgo}</Text>
                    </View>
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
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
      {showSearchBar && (
        <Pressable
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'transparent',
            zIndex: 1000,
          }}
          onPress={() => setShowSearchBar(false)}
        >
          {/* Empty content to handle press */}
        </Pressable>
      )}
    </SafeAreaView>
  );
}
