import { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '../../components/ThemeProvider';
import { storyService, Story } from '../services/storyService';

export default function StoryViewPage() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    storyService.getStory(id as string)
      .then(setStory)
      .catch(() => setError('Failed to load story.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}><ActivityIndicator color={colors.primary} size="large" /></SafeAreaView>;
  }
  if (error || !story) {
    return <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}><Text style={{ color: 'red' }}>{error || 'Story not found.'}</Text></SafeAreaView>;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <TouchableOpacity onPress={() => router.back()} style={{ padding: 16 }}>
        <Text style={{ color: colors.primary, fontSize: 16 }}>{'< Back'}</Text>
      </TouchableOpacity>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Image source={{ uri: story.imageUrl }} style={styles.image} />
        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 20, color: colors.text, marginTop: 16 }}>{story.username}</Text>
        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 16, color: colors.textSecondary, marginTop: 8 }}>{story.content}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 320,
    borderRadius: 16,
    resizeMode: 'cover',
  },
}); 