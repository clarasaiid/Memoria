import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, ScrollView, Dimensions } from 'react-native';
import { Search, CreditCard as Edit, Clock } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '../../components/ThemeProvider';
import { apiService } from '../services/api';
import StoriesContainer from '../../components/StoriesContainer';

export default function MessagesScreen() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [timeCapsules, setTimeCapsules] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { colors } = useTheme();

  useEffect(() => {
    // Fetch current user and friends
    apiService.get('/auth/me').then((me: any) => {
      setCurrentUserId(me.profile.id);
      setFriends(me.friends || []);
    });

    // Fetch messages
    apiService.get('/messages').then((messages) => {
      const msgs = messages as any[];
      const grouped: any = {};
      msgs.forEach((msg: any) => {
        const otherUser = msg.SenderId === currentUserId ? msg.Receiver : msg.Sender;
        if (!otherUser) return;
        const key = otherUser.id;
        if (!grouped[key] || new Date(msg.SentAt) > new Date(grouped[key].SentAt)) {
          grouped[key] = { ...msg, otherUser };
        }
      });
      setConversations(Object.values(grouped));
    });

    // Fetch stories
    apiService.get('/posts/stories').then((posts) => {
      const formattedStories = (posts as any[]).map(post => ({
        id: post.id,
        imageUrl: post.imageUrl.startsWith('http') ? post.imageUrl : `http://localhost:7000${post.imageUrl}`,
        userId: post.user?.id,
        username: post.user?.userName || post.user?.username || 'Unknown User',
        avatarUrl: post.user?.avatarUrl || post.user?.profilePictureUrl || 'https://ui-avatars.com/api/?name=' + (post.user?.userName || post.user?.username || 'Unknown'),
        timestamp: new Date(post.createdAt).getTime(),
        isViewed: post.isViewed || false,
      }));
      setStories(formattedStories);
    });

    // Fetch time capsules
    apiService.get('/timecapsules').then((capsules) => {
      setTimeCapsules(capsules as any[]);
    });
  }, [currentUserId]);

  const handleStoryCreated = (story: { imageUrl: string; caption?: string }) => {
    // Here you would typically upload the story to your backend
    console.log('New story created:', story);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {/* Main Messages Section */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 24, color: colors.text }}>Messages</Text>
            <TouchableOpacity style={{ backgroundColor: colors.primary, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
              <Edit size={20} color={colors.buttonText} />
            </TouchableOpacity>
          </View>

          {/* Stories at the top */}
          <StoriesContainer onStoryCreated={handleStoryCreated} />

          {/* Messages List */}
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.messageItem}
                onPress={() => router.push({ pathname: '/conversation/[id]', params: { id: item.otherUser.id } })}
              >
                <Image
                  source={{ uri: item.otherUser.avatarUrl || 'https://ui-avatars.com/api/?name=' + item.otherUser.userName }}
                  style={styles.avatar}
                />
                <View style={styles.messageContent}>
                  <Text style={styles.username}>{item.otherUser.userName}</Text>
                  <Text style={styles.lastMessage} numberOfLines={1}>
                    {item.content}
                  </Text>
                </View>
                <Text style={styles.timestamp}>
                  {new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', marginTop: 32 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 16 }}>
                  Start chatting with someone now
                </Text>
              </View>
            }
          />
        </View>

        {/* Right Section: Friends' Time Capsules */}
        <View style={[styles.rightSection, { backgroundColor: colors.background }]}> 
          <Text style={styles.sectionTitle}>Friends' Time Capsules</Text>
          <ScrollView contentContainerStyle={styles.capsulesContainer}>
            {timeCapsules.length === 0 ? (
              <View style={{ alignItems: 'center', marginTop: 32 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 16 }}>
                  No time capsules to show
                </Text>
              </View>
            ) : (
              timeCapsules.map((capsule, idx) => {
                const isUnlocked = new Date(capsule.openDate) <= new Date();
                return (
                  <TouchableOpacity
                    key={capsule.id || idx}
                    style={styles.capsuleCard}
                    disabled={!isUnlocked}
                    onPress={() => isUnlocked && /* open capsule logic here */ null}
                  >
                    <Image
                      source={{ uri: capsule.imageUrl }}
                      style={[styles.capsuleImage, !isUnlocked && { opacity: 0.5 }]}
                      resizeMode="cover"
                    />
                    <Text style={styles.capsuleTitle}>{capsule.title}</Text>
                    <Text style={styles.capsuleDate}>
                      {new Date(capsule.openDate).toLocaleDateString()}
                    </Text>
                    {!isUnlocked && (
                      <View style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 16, alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>🔒 Locked</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  messageItem: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#64748B',
  },
  timestamp: {
    fontSize: 12,
    color: '#94A3B8',
  },
  rightSection: {
    width: 350,
    padding: 16,
    borderLeftWidth: 1,
    borderLeftColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#0F172A',
  },
  capsulesContainer: {
    gap: 16,
  },
  capsuleCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  capsuleImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F3F4F6',
  },
  capsuleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  capsuleDate: {
    fontSize: 12,
    color: '#64748B',
  },
});