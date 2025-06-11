import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Users, MessageCircle, Heart } from 'lucide-react-native';
import { useTheme } from '../../components/ThemeProvider';
import { apiService } from '../services/api';

export default function GroupScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGroupData = async () => {
      setLoading(true);
      setError('');
      try {
        const [groupData, postsData] = await Promise.all([
          apiService.get(`/api/groups/${id}`),
          apiService.get(`/api/groups/${id}/api/posts`)
        ]);
        setGroup(groupData);
        setPosts(postsData);
      } catch (e: any) {
        setError('Failed to load group data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchGroupData();
    }
  }, [id]);

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      padding: 8,
      marginRight: 8,
    },
    groupInfo: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    groupName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 8,
    },
    groupDescription: {
      fontSize: 16,
      color: colors.text,
      marginBottom: 12,
    },
    memberCount: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    memberCountText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: 8,
    },
    joinButton: {
      backgroundColor: colors.primary,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    joinButtonText: {
      color: colors.buttonText,
      fontWeight: '600',
    },
    postCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      margin: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    postHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
    },
    username: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    content: {
      fontSize: 16,
      color: colors.text,
      marginBottom: 12,
    },
    image: {
      width: '100%',
      height: 300,
      borderRadius: 8,
      marginBottom: 12,
    },
    postActions: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 16,
    },
    actionText: {
      marginLeft: 4,
      color: colors.textSecondary,
    },
    noPosts: {
      textAlign: 'center',
      padding: 20,
      fontSize: 16,
      color: colors.textSecondary,
    },
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.text }}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.groupName}>{group?.name}</Text>
      </View>

      <View style={styles.groupInfo}>
        <Text style={styles.groupDescription}>{group?.description}</Text>
        <View style={styles.memberCount}>
          <Users size={20} color={colors.textSecondary} />
          <Text style={styles.memberCountText}>{group?.memberCount} members</Text>
        </View>
        <TouchableOpacity style={styles.joinButton}>
          <Text style={styles.joinButtonText}>Join Group</Text>
        </TouchableOpacity>
      </View>

      {posts.length === 0 ? (
        <Text style={styles.noPosts}>No posts in this group yet</Text>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.postCard}>
              <TouchableOpacity
                style={styles.postHeader}
                onPress={() => router.push(`/profile/${item.user.userName}`)}
              >
                <Image
                  source={{ uri: item.user.profilePictureUrl || `https://ui-avatars.com/api/?name=${item.user.userName}` }}
                  style={styles.avatar}
                />
                <Text style={styles.username}>{item.user.userName}</Text>
              </TouchableOpacity>
              <Text style={styles.content}>{item.content}</Text>
              {item.imageUrl && (
                <Image source={{ uri: item.imageUrl }} style={styles.image} />
              )}
              <View style={styles.postActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Heart size={20} color={colors.primary} />
                  <Text style={styles.actionText}>{item.likeCount}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <MessageCircle size={20} color={colors.primary} />
                  <Text style={styles.actionText}>{item.commentCount}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
} 