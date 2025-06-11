import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, FlatList, Modal, TextInput, useWindowDimensions, ImageBackground, ActivityIndicator, Platform } from 'react-native';
import { Heart, MessageCircle, Send, Bookmark as BookmarkSimple, MoreVertical, ArrowLeft, UserPlus, UserCheck, UserMinus } from 'lucide-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiService } from '../services/api';
import { useTheme } from '../../components/ThemeProvider';
import FriendRequestButton from '../components/FriendRequestButton';
import MessageButton from '../components/MessageButton';
import * as signalR from '@microsoft/signalr';

const COVER_HEIGHT = 220;
const PROFILE_SIZE = 110;
const fallbackCover = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb';

export default function PublicProfileScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { username } = useLocalSearchParams();
  const { colors, isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'feed'>('grid');
  const [photoModal, setPhotoModal] = useState({ visible: false, uri: '' });
  const [listModal, setListModal] = useState({ visible: false, type: '', data: [] });
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followRequestPending, setFollowRequestPending] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [friendshipId, setFriendshipId] = useState<string | null>(null);
  const [pendingFriend, setPendingFriend] = useState(false);
  const [incomingRequest, setIncomingRequest] = useState(false);
  const [uiReady, setUiReady] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [hasBlocked, setHasBlocked] = useState(false);
  const insets = useSafeAreaInsets();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [moreModal, setMoreModal] = useState(false);

  // Fetch profile and relationship
  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    let res: any = null;
    try {
      console.log('Fetching profile for', username);
      res = await apiService.get(`/api/users/username/${username}`) as any;
      console.log('Profile response:', res);
      setProfile(res);
      const followersRes = await apiService.get(`/api/users/${res.id}/followers`) as any[];
      setFollowers(followersRes);
      const followingRes = await apiService.get(`/api/users/${res.id}/following`) as any[];
      setFollowing(followingRes);
      const friendsRes = await apiService.get(`/api/users/${res.id}/friends`) as any[];
      setFriends(friendsRes);
      // Fetch posts for this user
      const postsRes = await apiService.get('/api/posts') as any[];
      const userPosts = postsRes.filter((p: any) => p.user?.id === res.id && !p.isArchived);
      setPosts(userPosts);
      // Relationship
      const relationshipRes = await apiService.get(`/api/users/${res.id}/relationship`) as any;
      setIsFollowing(relationshipRes.isFollowing);
      setIsFriend(relationshipRes.isFriend);
      setIsBlocked(relationshipRes.isBlocked);
      setHasBlocked(relationshipRes.hasBlocked);
    } catch (e: any) {
      console.error('Error fetching profile:', e);
      setError('User not found');
      setProfile(null);
      setLoading(false);
      setUiReady(true);
      return;
    }
    // Friend requests fetch (optional)
    try {
      if (res && currentUser) {
        const requests = await apiService.get(`/api/friendships/incoming`) as any[];
        // Outgoing pending request: current user sent a request to this profile
        const outgoingPending = requests.some((req: any) => req.UserId === currentUser?.id && req.FriendId === res.id && !req.Accepted);
        setPendingFriend(outgoingPending);
        // Incoming pending request: this profile sent a request to current user
        const incomingPending = requests.some((req: any) => req.UserId === res.id && req.FriendId === currentUser?.id && !req.Accepted);
        setIncomingRequest(incomingPending);
        // FriendshipId for removal
        const friendship = requests.find((f: any) =>
          ((f.UserId === res.id && f.FriendId === currentUser?.id) || (f.UserId === currentUser?.id && f.FriendId === res.id)) && f.Accepted
        );
        setFriendshipId(friendship ? friendship.id : null);
      }
    } catch (e) {
      console.error('Error fetching friend requests:', e);
    } finally {
      setLoading(false);
      setUiReady(true);
      console.log('Done loading');
    }
  };

  useEffect(() => {
    apiService.get('/api/auth/me').then((me: any) => {
      setCurrentUser(me.profile);
      console.log('Current user:', me.profile);
    });
  }, []);

  useEffect(() => {
    if (username && currentUser) fetchProfile();
    // eslint-disable-next-line
  }, [username, currentUser]);

  // SignalR connection for real-time follow/follow_request notifications
  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:7000/chatHub', { withCredentials: true })
      .withAutomaticReconnect()
      .build();
    connection.start()
      .then(() => {
        connection.on('ReceiveNotification', (notification) => {
          if (notification.type === 'follow' && notification.senderId === profile?.id) {
            setIsFollowing(true);
            setFollowRequestPending(false);
          }
          if (notification.type === 'follow_request' && notification.senderId === profile?.id) {
            setFollowRequestPending(true);
          }
        });
      })
      .catch(console.error);
    return () => {
      connection.stop();
    };
  }, [profile?.id]);

  // Unified button handlers
  const handleFollow = async () => {
    if (!profile || isLoadingAction) return;
    setIsLoadingAction(true);
    try {
      if (isFollowing) {
        await apiService.delete(`/api/users/${profile.id}/follow`);
        setIsFollowing(false);
        setFollowRequestPending(false);
      } else {
        const res: any = await apiService.post(`/api/users/${profile.id}/follow`, {});
        if (res.status === 'pending') {
          setFollowRequestPending(true);
        } else {
          setIsFollowing(true);
        }
      }
      // No fetchProfile() here to avoid full reload
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setIsLoadingAction(false);
    }
  };
  const handleFriend = async () => {
    if (!profile || isLoadingAction) return;
    setIsLoadingAction(true);
    try {
      if (isFriend && friendshipId) {
        await apiService.delete(`/api/friendships/${friendshipId}`);
        setIsFriend(false);
        setFriendshipId(null);
      } else if (!isFriend && !pendingFriend && !incomingRequest) {
        const me = await apiService.get('/api/auth/me') as any;
        await apiService.post('/api/friendships', {
          UserId: me.profile.id,
          FriendId: profile.id,
          Accepted: false
        });
        setPendingFriend(true);
        setIncomingRequest(false);
      }
      await fetchProfile();
    } catch (error) {
      console.error('Error toggling friend:', error);
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleBlock = async () => {
    if (!profile) return;
    setIsLoadingAction(true);
    try {
      if (hasBlocked) {
        await apiService.delete(`/api/users/${profile.id}/block`);
        setHasBlocked(false);
      } else {
        await apiService.post(`/api/users/${profile.id}/block`, {});
        setHasBlocked(true);
      }
      setMoreModal(false);
      await fetchProfile();
    } catch (error) {
      console.error('Error blocking/unblocking user:', error);
    } finally {
      setIsLoadingAction(false);
    }
  };

  const isOwnProfile = currentUser && profile && currentUser.id === profile.id;

  const getListData = () => {
    let data: any[] = [];
    if (listModal.type === 'Friends') data = friends;
    if (listModal.type === 'Followers') data = followers;
    if (listModal.type === 'Following') data = following;
    if (search) data = data.filter((u: any) => u.name?.toLowerCase().startsWith(search.toLowerCase()) || u.username?.toLowerCase().startsWith(search.toLowerCase()));
    return data;
  };

  // NEW: Accept/Decline handlers
  const handleAcceptFriend = async () => {
    if (!profile || isLoadingAction) return;
    setIsLoadingAction(true);
    try {
      // Find the incoming request id
      const requests = await apiService.get('/api/friendships/incoming') as any[];
      const incoming = requests.find((req: any) => req.UserId === profile.id && req.FriendId === currentUser?.id && !req.Accepted);
      if (incoming) {
        await apiService.post(`/api/friendships/${incoming.id}/accept`, {});
        setIsFriend(true);
        setIncomingRequest(false);
        setPendingFriend(false);
      }
      await fetchProfile();
    } catch (error) {
      console.error('Error accepting friend:', error);
    } finally {
      setIsLoadingAction(false);
    }
  };
  const handleDeclineFriend = async () => {
    if (!profile || isLoadingAction) return;
    setIsLoadingAction(true);
    try {
      // Find the incoming request id
      const requests = await apiService.get('/api/friendships/incoming') as any[];
      const incoming = requests.find((req: any) => req.UserId === profile.id && req.FriendId === currentUser?.id && !req.Accepted);
      if (incoming) {
        await apiService.post(`/api/friendships/${incoming.id}/decline`, {});
        setIncomingRequest(false);
      }
      await fetchProfile();
    } catch (error) {
      console.error('Error declining friend:', error);
    } finally {
      setIsLoadingAction(false);
    }
  };

  if (loading || !uiReady || !profile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }
  
  if (error) return <View style={styles.center}><Text>{error}</Text></View>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Back Button */}
      <TouchableOpacity 
        onPress={() => router.back()}
        style={[styles.backButton, { backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)' }]}
      >
        <ArrowLeft size={24} color={colors.text} />
      </TouchableOpacity>
      {/* More (3 dots) Button */}
      {!isOwnProfile && (
        <TouchableOpacity
          onPress={() => setMoreModal(true)}
          style={{ position: 'absolute', top: 20, right: 20, zIndex: 1001, padding: 10, backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)', borderRadius: 20 }}
        >
          <MoreVertical size={24} color={colors.text} />
        </TouchableOpacity>
      )}
      {/* More Modal */}
      <Modal visible={moreModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 24 }}>
            <TouchableOpacity onPress={handleBlock} style={{ paddingVertical: 12 }}>
              <Text style={{ color: hasBlocked ? colors.primary : colors.error, fontWeight: 'bold', fontSize: 16 }}>{hasBlocked ? 'Unblock User' : 'Block User'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setMoreModal(false); router.push({ pathname: '/conversation/[id]', params: { id: profile.id, username: profile.username } }); }} style={{ paddingVertical: 12 }}>
              <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMoreModal(false)} style={{ paddingVertical: 12 }}>
              <Text style={{ color: colors.text, fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 120 : insets.bottom + 80 }}>
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
              {/* Unified action buttons */}
              {!isOwnProfile && !isBlocked && !hasBlocked && (
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
                  {/* Follow/Unfollow */}
              <TouchableOpacity
                style={[styles.button,  { backgroundColor: isFollowing ? colors.primaryLight : followRequestPending ? colors.warning : colors.primary }
                ]}
                onPress={handleFollow}
                disabled={isLoadingAction}
              >
                {isFollowing ? <UserCheck color={colors.buttonText} size={20} /> : followRequestPending ? <UserMinus color={colors.buttonText} size={20} /> : <UserPlus color={colors.buttonText} size={20} />}

                <Text
                  style={{
                    color: isFollowing ? colors.text : colors.buttonText,
                    fontWeight: 'bold',
                    fontSize: 14,
                    marginLeft: 6,
                  }}
                >
                  {isFollowing ? 'Unfollow' : followRequestPending ? 'Requested' : 'Follow'}

                </Text>
              </TouchableOpacity>

                  {/* Add Friend/Remove Friend/Pending/Friends/Accept/Decline */}
                  {!isOwnProfile && (
                  <FriendRequestButton targetUserId={profile.id} currentUser={currentUser} />
                  )}

                  {/* Accept/Decline buttons for incoming requests */}
                  {incomingRequest && (
                    <View style={{ flexDirection: 'row', gap: 8, marginLeft: 8 }}>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.success }]}
                        onPress={handleAcceptFriend}
                        disabled={isLoadingAction}
                      >
                        <Text style={{ color: colors.buttonText, fontWeight: 'bold', fontSize: 15 }}>Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.error }]}
                        onPress={handleDeclineFriend}
                        disabled={isLoadingAction}
                      >
                        <Text style={{ color: colors.buttonText, fontWeight: 'bold', fontSize: 15 }}>Decline</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {/* Message button only if friends */}
                  {isFriend && (
                    <MessageButton targetUserId={profile.id} targetUsername={profile.username} />
                  )}
                </View>
              )}
              {/* Blocked message */}
              {!isOwnProfile && (isBlocked || hasBlocked) && (
                <View style={{ marginTop: 16 }}>
                  <Text style={{ color: colors.error, fontWeight: 'bold' }}>
                    {hasBlocked ? 'You have blocked this user.' : 'You are blocked by this user.'}
                  </Text>
                </View>
              )}
            </View>
          </View>
          {/* Stats Row */}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginLeft: 16, marginTop: 10, zIndex: 2 }}>
            <TouchableOpacity style={{ alignItems: 'flex-start', marginRight: 24 }} onPress={() => setListModal({ visible: true, type: 'Following', data: [] })}>
              <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>{following.length}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13, opacity: 0.7 }}>Following</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ alignItems: 'flex-start', marginRight: 24 }} onPress={() => setListModal({ visible: true, type: 'Followers', data: [] })}>
              <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>{followers.length}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13, opacity: 0.7 }}>Followers</Text>
            </TouchableOpacity>
            <View style={{ alignItems: 'flex-start', marginRight: 24 }}>
              <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>{posts.length}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13, opacity: 0.7 }}>Posts</Text>
            </View>
          </View>
          {/* Bio */}
          <Text style={{ color: '#fff', fontSize: 15, marginLeft: 16, marginTop: 7, marginBottom: 14, zIndex: 2 }}>{profile.bio || 'No bio yet.'}</Text>
        </ImageBackground>

        {/* Posts Section */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 0, paddingHorizontal: 12 }}>
          <Text style={{ fontSize: 17, fontWeight: 'bold', color: colors.text, marginLeft: 12, marginBottom: 8 }}>Posts</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => setViewMode('grid')} style={[{ padding: 6, borderRadius: 6, marginLeft: 4 }, viewMode === 'grid' && { backgroundColor: colors.cardAlt }]}> <Text>Grid</Text> </TouchableOpacity>
            <TouchableOpacity onPress={() => setViewMode('feed')} style={[{ padding: 6, borderRadius: 6, marginLeft: 4 }, viewMode === 'feed' && { backgroundColor: colors.cardAlt }]}> <Text>Feed</Text> </TouchableOpacity>
          </View>
        </View>
        <View style={{ marginTop: 12 }} />
        
        {viewMode === 'grid' ? (
          <FlatList
            data={posts}
            numColumns={3}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity 
                onPress={() => router.push({ pathname: '/post/[id]', params: { id: item.id.toString() } })}
                style={{ flex: 1/3, aspectRatio: 1, padding: 1 }}
              >
                <Image
                  source={{ uri: item.imageUrl }}
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: colors.card,
                  }}
                />
              </TouchableOpacity>
            )}
            style={{ marginBottom: 20 }}
          />
        ) : (
          <FlatList
            data={posts}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <View style={[styles.postCard, { backgroundColor: colors.card }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image source={{ uri: profile.profilePictureUrl }} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }} />
                    <View>
                      <Text style={{ fontSize: 14, color: colors.text, fontWeight: 'bold' }}>{profile.username}</Text>
                      <Text style={{ fontSize: 12, color: colors.textSecondary }}>{profile.bio || ' '}</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity onPress={() => router.push({ pathname: '/post/[id]', params: { id: item.id.toString() } })}>
                  <Image 
                    source={{ uri: item.imageUrl }} 
                    style={{ 
                      width: '100%', 
                      aspectRatio: 1, 
                      maxWidth: 470, 
                      maxHeight: 470, 
                      resizeMode: 'contain', 
                      backgroundColor: colors.card 
                    }} 
                  />
                </TouchableOpacity>
                <View style={{ padding: 12 }}>
                  <Text style={{ color: colors.text, fontSize: 14 }}>{item.content}</Text>
                  <View style={{ flexDirection: 'row', marginTop: 8 }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{item.reactions?.length || 0} likes</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 12, marginLeft: 12 }}>{item.comments?.length || 0} comments</Text>
                  </View>
                </View>
              </View>
            )}
            style={{ marginBottom: 20 }}
          />
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
              data={getListData()}
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  backButton: {
    position: Platform.OS === 'web' ? 'fixed' : 'absolute',
    top: 20,
    left: 20,
    padding: 12,
    borderRadius: 12,
    zIndex: 1000,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  actionButton: {
    padding: 7,
    borderRadius: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  postCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
});

export const options = { headerShown: false }; 