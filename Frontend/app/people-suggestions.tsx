import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../components/ThemeProvider';
import { ArrowLeft, RotateCcw } from 'lucide-react-native';
import { router } from 'expo-router';
import { api } from '../utils/api';

interface SuggestedUser {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  profilePictureUrl: string;
  mutualFriendsCount: number;
}

export default function PeopleSuggestionsPage() {
  const { colors } = useTheme();
  const [suggestions, setSuggestions] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/users/suggested-friends');
      setSuggestions(response.data);
    } catch (err) {
      setError('Failed to load suggestions. Please try again.');
      console.error('Error fetching suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleFollow = async (id: number) => {
    try {
      await api.post(`/users/${id}/follow`);
      setSuggestions(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error following user:', err);
    }
  };

  const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    backBtn: { padding: 8, marginRight: 8 },
    title: { fontFamily: 'Inter-Bold', fontSize: 24, color: colors.primary, flex: 1 },
    refreshBtn: { padding: 8 },
    list: { padding: 16 },
    card: { 
      backgroundColor: colors.card, 
      borderRadius: 12, 
      marginBottom: 16, 
      flexDirection: 'row', 
      alignItems: 'center', 
      borderWidth: 1, 
      borderColor: colors.border, 
      padding: 12 
    },
    avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 16 },
    userInfo: { flex: 1 },
    username: { fontFamily: 'Inter-Bold', fontSize: 16, color: colors.text },
    mutualFriends: { 
      fontFamily: 'Inter-Regular', 
      fontSize: 14, 
      color: colors.textSecondary,
      marginTop: 4
    },
    followBtn: { 
      backgroundColor: colors.primary, 
      borderRadius: 8, 
      paddingVertical: 8, 
      paddingHorizontal: 18 
    },
    followBtnText: { 
      color: colors.buttonText, 
      fontFamily: 'Inter-Bold', 
      fontSize: 15 
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    errorText: {
      color: colors.error,
      textAlign: 'center',
      marginTop: 40,
      padding: 16
    }
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>People You May Know</Text>
        <TouchableOpacity onPress={fetchSuggestions} style={styles.refreshBtn}>
          <RotateCcw size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={suggestions}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image 
                source={{ 
                  uri: item.profilePictureUrl || `https://ui-avatars.com/api/?name=${item.firstName}+${item.lastName}&background=F3E8FF&color=A78BFA` 
                }} 
                style={styles.avatar} 
              />
              <View style={styles.userInfo}>
                <Text style={styles.username}>{item.username}</Text>
                <Text style={styles.mutualFriends}>
                  {item.mutualFriendsCount} mutual {item.mutualFriendsCount === 1 ? 'friend' : 'friends'}
                </Text>
              </View>
              <TouchableOpacity style={styles.followBtn} onPress={() => handleFollow(item.id)}>
                <Text style={styles.followBtnText}>Add Friend</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>
              No suggestions available. Try refreshing!
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
} 