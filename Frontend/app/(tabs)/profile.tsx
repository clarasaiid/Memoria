import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, FlatList, Modal, TextInput, useWindowDimensions, ImageBackground, ActivityIndicator, Alert } from 'react-native';
import { Settings, Grid, List, Heart, MessageCircle, Send, Bookmark as BookmarkSimple, MoveHorizontal as MoreHorizontal } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiService } from '../services/api';
import { router, useRouter } from 'expo-router';
import { useTheme } from '../../components/ThemeProvider';
import { useFocusEffect } from '@react-navigation/native';
import React from 'react';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const COVER_HEIGHT = 220;
const PROFILE_SIZE = 110;

const fallbackCover = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb';

export const options = { headerShown: false };

export default function ProfileScreen() {
  const { width } = useWindowDimensions();
  const [photoModal, setPhotoModal] = useState({ visible: false, uri: '' });
  const [listModal, setListModal] = useState<{ visible: boolean; type: string; data: any[] }>({ visible: false, type: '', data: [] });
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'feed'>('grid');
  const { colors, isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const router = useRouter();
  const [menuPostId, setMenuPostId] = useState<number | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const fetchProfileAndPosts = async () => {
    setLoading(true);
    try {
      const res = await apiService.get('/api/auth/me') as any;
      setProfile(res.profile);

      // Fetch posts for this user
      const postsRes: any[] = await apiService.get('/api/posts');
      const userPosts = postsRes.filter((p: any) => p.user?.id === res.profile.id && !p.isArchived);
      setPosts(userPosts);

      setFriends(res.friends || []);
      setFollowers(res.followers || []);
      setFollowing(res.following || []);
    } catch (e) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndPosts();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchProfileAndPosts();
    }, [])
  );

  const getListData = () => {
    let data: any[] = [];
    if (listModal.type === 'Friends') data = friends;
    if (listModal.type === 'Followers') data = followers;
    if (listModal.type === 'Following') data = following;
    if (search) data = data.filter((u: any) => u.name?.toLowerCase().startsWith(search.toLowerCase()) || u.username?.toLowerCase().startsWith(search.toLowerCase()));
    return data;
  };

  const styles = StyleSheet.create({
    postCard: {
      marginBottom: 32,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      borderRadius: 12,
      overflow: 'hidden',
      elevation: 1,
      maxWidth: 470,
      minWidth: 320,
      width: '100%',
      alignSelf: 'center',
    },
  });

  const handleDeletePost = async (postId: number) => {
    try {
      await apiService.delete(`/api/posts/${postId}`);
      setPosts(posts.filter((p) => p.id !== postId));
      setMenuVisible(false);
      setMenuPostId(null);
    } catch (e) {
      Alert.alert('Error', 'Failed to delete post.');
    }
  };

  const handleArchivePost = async (postId: number) => {
    try {
      await apiService.put(`/api/posts/archive/${postId}`);
      setPosts(posts.filter((p) => p.id !== postId));
      setMenuVisible(false);
      setMenuPostId(null);
      Alert.alert('Success', 'Post archived successfully');
    } catch (e) {
      Alert.alert('Error', 'Failed to archive post.');
    }
  };

  const visiblePosts = posts.filter((p) => !p.isArchived);

  if (loading || !profile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Cover Photo as background */}
        <ImageBackground source={{ uri: profile.coverPhotoUrl || fallbackCover }} style={{ width: '100%', minHeight: COVER_HEIGHT + 60, paddingBottom: 16, justifyContent: 'flex-end' }}>
          <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: isDark ? 'rgba(24,26,32,0.7)' : 'rgba(255,255,255,0.7)', zIndex: 1 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', zIndex: 2, marginTop: 10, marginLeft: 16 }}>
            {/* Profile Photo */}
            <TouchableOpacity onPress={() => setPhotoModal({ visible: true, uri: profile.profilePictureUrl })}>
              <Image source={{ uri: profile.profilePictureUrl }} style={{ width: PROFILE_SIZE, height: PROFILE_SIZE, borderRadius: PROFILE_SIZE / 2, borderWidth: 4, borderColor: colors.card, marginRight: 18 }} />
            </TouchableOpacity>
            {/* Info and Buttons */}
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
                <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 24, marginRight: 8 }}>{profile.name || profile.firstName || ''}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 16, marginRight: 8, opacity: 0.8 }}>@{profile.username}</Text>
                <TouchableOpacity onPress={() => setListModal({ visible: true, type: 'Friends', data: [] })}>
                  <Text style={{ color: colors.primary, fontSize: 15, backgroundColor: isDark ? 'rgba(74,144,226,0.15)' : 'rgba(70,130,180,0.08)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginRight: 8 }}>{friends.length} friends</Text>
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>

                <TouchableOpacity style={{ backgroundColor: colors.button, borderRadius: 8, paddingVertical: 7, paddingHorizontal: 16, marginRight: 8 }} onPress={() => router.push('/edit-profile')}>

                  <Text style={{ color: colors.buttonText, fontWeight: 'bold', fontSize: 15 }}>Edit profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ backgroundColor: colors.primaryLight, borderRadius: 8, padding: 7, justifyContent: 'center', alignItems: 'center' }} onPress={() => router.push('/settings')}>
                  <Settings size={22} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          {/* Stats Row */}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginLeft: 16, marginTop: 10, zIndex: 2 }}>
            <TouchableOpacity style={{ alignItems: 'flex-start', marginRight: 24 }} onPress={() => setListModal({ visible: true, type: 'Following', data: following })}>
              <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>{following.length}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13, opacity: 0.7 }}>Following</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ alignItems: 'flex-start', marginRight: 24 }} onPress={() => setListModal({ visible: true, type: 'Followers', data: followers })}>
              <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>{followers.length}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13, opacity: 0.7 }}>Followers</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ alignItems: 'flex-start', marginRight: 24 }} onPress={() => setListModal({ visible: true, type: 'Friends', data: friends })}>
              <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>{friends.length}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13, opacity: 0.7 }}>Friends</Text>
            </TouchableOpacity>
          </View>
          {/* Bio */}
          <Text style={{ color: '#fff', fontSize: 15, marginLeft: 16, marginTop: 7, marginBottom: 14, zIndex: 2 }}>{profile.bio || 'No bio yet.'}</Text>
        </ImageBackground>

        {/* Posts Section */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 0, paddingHorizontal: 12 }}>
          <Text style={{ fontSize: 17, fontWeight: 'bold', color: colors.text, marginLeft: 12, marginBottom: 8 }}>Posts</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => setViewMode('grid')} style={[{ padding: 6, borderRadius: 6, marginLeft: 4 }, viewMode === 'grid' && { backgroundColor: colors.cardAlt }]}>
              <Grid size={22} color={viewMode === 'grid' ? colors.primary : colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setViewMode('feed')} style={[{ padding: 6, borderRadius: 6, marginLeft: 4 }, viewMode === 'feed' && { backgroundColor: colors.cardAlt }]}>
              <List size={22} color={viewMode === 'feed' ? colors.primary : colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ marginTop: 12 }} />
        {viewMode === 'grid' ? (
          <FlatList
            data={visiblePosts}
            horizontal
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <View style={{ position: 'relative', marginHorizontal: 8, marginVertical: 8 }}>
                <TouchableOpacity onPress={() => router.push({ pathname: '/post/[id]', params: { id: item.id.toString() } })}>
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={{
                      width: 180,
                      height: 180,
                      borderRadius: 18,
                      backgroundColor: colors.card,
                      shadowColor: '#000',
                      shadowOpacity: 0.12,
                      shadowRadius: 8,
                      shadowOffset: { width: 0, height: 2 },
                    }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    backgroundColor: colors.card,
                    borderRadius: 16,
                    padding: 10,
                    zIndex: 10,
                  }}
                  onPress={() => {
                    console.log('Grid dots pressed', item.id);
                    setMenuPostId(item.id);
                    setMenuVisible(true);
                  }}
                >
                  <MoreHorizontal size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            )}
            style={{ marginBottom: 20 }}
            showsHorizontalScrollIndicator={false}
          />
        ) : (
          <View style={{ marginTop: 8, alignItems: 'center', backgroundColor: colors.card }}>
            {visiblePosts.map(item => (
              <View key={item.id} style={styles.postCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image source={{ uri: profile.profilePictureUrl }} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }} />
                    <View>
                      <Text style={{ fontSize: 14, color: colors.text, fontWeight: 'bold' }}>{profile.username}</Text>
                      <Text style={{ fontSize: 12, color: colors.textSecondary }}>{profile.bio || ' '}</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => { console.log('Three dots clicked', item.id); setMenuPostId(item.id); setMenuVisible(true); }}>
                    <MoreHorizontal size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                <Image source={{ uri: item.imageUrl }} style={{ width: '100%', aspectRatio: 1, maxWidth: 470, maxHeight: 470, resizeMode: 'contain', backgroundColor: colors.card, borderRadius: 0, marginVertical: 0 }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 }}>
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity style={{ marginRight: 16 }}>
                      <Heart size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={{ marginRight: 16 }}>
                      <MessageCircle size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={{ marginRight: 16 }}>
                      <Send size={24} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity>
                    <BookmarkSimple size={24} color={colors.primary} />
                  </TouchableOpacity>
                </View>
                <View style={{ paddingHorizontal: 16 }}>
                  <Text style={{ fontSize: 14, color: colors.text, fontWeight: 'bold', marginBottom: 4 }}>{0} likes</Text>
                  <Text style={{ fontSize: 14, color: colors.text, lineHeight: 20, marginBottom: 2 }}>
                    <Text style={{ fontWeight: 'bold', color: colors.text }}>{profile.username}</Text> {item.content || ''}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 0, marginBottom: 7 }}>Just now</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Photo Modal */}
        <Modal visible={photoModal.visible} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: isDark ? 'rgba(24,26,32,0.95)' : 'rgba(255,255,255,0.95)', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity style={{ position: 'absolute', top: 40, right: 20, zIndex: 2 }} onPress={() => setPhotoModal({ visible: false, uri: '' })}>
              <Text style={{ color: colors.text, fontSize: 18 }}>Close</Text>
            </TouchableOpacity>
            <Image source={{ uri: photoModal.uri }} style={{ width: 300, height: 300, borderRadius: 10 }} />
          </View>
        </Modal>

        {/* List Modal */}
        <Modal visible={listModal.visible} animationType="slide">
          <View style={{ flex: 1, backgroundColor: colors.background, padding: 20 }}>
            <Text style={{ fontSize: 17, fontWeight: 'bold', color: colors.text, marginLeft: 12, marginBottom: 8 }}>{listModal.type}</Text>
            <TextInput
              placeholder="Search by name..."
              value={search}
              onChangeText={setSearch}
              style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 8, marginBottom: 10, color: colors.text, backgroundColor: colors.card }}
              placeholderTextColor={colors.textSecondary}
            />
            <FlatList
              data={listModal.data.filter((u: any) => u.name?.toLowerCase().startsWith(search.toLowerCase()) || u.username?.toLowerCase().startsWith(search.toLowerCase()))}
              keyExtractor={item => (item.id !== undefined && item.id !== null ? item.id.toString() : Math.random().toString())}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setListModal({ visible: false, type: '', data: [] });
                    setSearch('');
                    router.push(`/profile/${item.username}`);
                  }}
                  style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}
                >
                  <Image source={{ uri: item.profilePictureUrl }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }} />
                  <Text style={{ fontSize: 16, color: colors.text }}>{item.name || item.username}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={{ backgroundColor: colors.primary, padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 10 }} onPress={() => { setListModal({ visible: false, type: '', data: [] }); setSearch(''); }}>
              <Text style={{ color: colors.buttonText }}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Modal for post menu */}
        <Modal
          visible={menuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}
            onPress={() => setMenuVisible(false)}
            activeOpacity={1}
          >
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 12,
                padding: 24,
                minWidth: 220,
                alignItems: 'center',
              }}
            >
              <TouchableOpacity onPress={() => handleDeletePost(menuPostId!)} style={{ marginBottom: 18 }}>
                <Text style={{ color: 'red', fontWeight: 'bold', fontSize: 16 }}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleArchivePost(menuPostId!)} >
                <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>Archive</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}