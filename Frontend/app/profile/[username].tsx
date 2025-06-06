import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, FlatList, Modal, TextInput, useWindowDimensions, ImageBackground, ActivityIndicator } from 'react-native';
import { Heart, MessageCircle, Send, Bookmark as BookmarkSimple, MoveHorizontal as MoreHorizontal } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiService } from '../services/api';
import { useTheme } from '../../components/ThemeProvider';

const COVER_HEIGHT = 220;
const PROFILE_SIZE = 110;
const fallbackCover = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb';

export default function PublicProfileScreen() {
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

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiService.get(`/users/username/${username}`);
        setProfile(res);
        // Optionally fetch posts, friends, followers, following if you have endpoints
      } catch (e: any) {
        setError('User not found');
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    if (username) fetchProfile();
  }, [username]);

  const getListData = () => {
    let data: any[] = [];
    if (listModal.type === 'Friends') data = friends;
    if (listModal.type === 'Followers') data = followers;
    if (listModal.type === 'Following') data = following;
    if (search) data = data.filter((u: any) => u.name?.toLowerCase().startsWith(search.toLowerCase()) || u.username?.toLowerCase().startsWith(search.toLowerCase()));
    return data;
  };

  if (loading || !profile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }
  if (error) return <View style={styles.center}><Text>{error}</Text></View>;

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
                {/* Show follow/add friend button here for public profile */}
                <TouchableOpacity style={{ backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 7, paddingHorizontal: 16, marginRight: 8 }}>
                  <Text style={{ color: colors.buttonText, fontWeight: 'bold', fontSize: 15 }}>Follow</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ backgroundColor: colors.primaryLight, borderRadius: 8, padding: 7, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: colors.text }}>Add Friend</Text>
                </TouchableOpacity>
              </View>
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
        {/* You can add posts display here if you fetch posts for the user */}

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
              keyExtractor={item => item.id?.toString() || Math.random().toString()}
              renderItem={({ item }) => (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <Image source={{ uri: item.profilePictureUrl }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }} />
                  <Text style={{ fontSize: 16, color: colors.text }}>{item.name || item.username}</Text>
                </View>
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
}); 