import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../../components/ThemeProvider';
import { apiService } from '../services/api';

export default function HashtagScreen() {
  const { tag } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await apiService.get(`/api/posts/hashtag/${tag}`);
        setPosts(response);
      } catch (e: any) {
        setError('Failed to load posts');
      } finally {
        setLoading(false);
      }
    };

    if (tag) {
      fetchPosts();
    }
  }, [tag]);

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
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.primary,
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
        <Text style={styles.title}>#{tag}</Text>
      </View>

      {posts.length === 0 ? (
        <Text style={styles.noPosts}>No posts found with this hashtag</Text>
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
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
} 