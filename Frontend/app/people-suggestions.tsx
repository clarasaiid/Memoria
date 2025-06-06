import { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../components/ThemeProvider';
import { ArrowLeft, RotateCcw } from 'lucide-react-native';
import { router } from 'expo-router';

const initialSuggestions = [
  { id: 1, username: 'dave', avatarUrl: 'https://ui-avatars.com/api/?name=Dave&background=F3E8FF&color=A78BFA' },
  { id: 2, username: 'eve', avatarUrl: 'https://ui-avatars.com/api/?name=Eve&background=F3E8FF&color=A78BFA' },
  { id: 3, username: 'frank', avatarUrl: 'https://ui-avatars.com/api/?name=Frank&background=F3E8FF&color=A78BFA' },
  { id: 4, username: 'grace', avatarUrl: 'https://ui-avatars.com/api/?name=Grace&background=F3E8FF&color=A78BFA' },
  { id: 5, username: 'heidi', avatarUrl: 'https://ui-avatars.com/api/?name=Heidi&background=F3E8FF&color=A78BFA' },
];

function getRandomSuggestions() {
  // Shuffle and return 3 random suggestions
  const shuffled = [...initialSuggestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
}

export default function PeopleSuggestionsPage() {
  const { colors } = useTheme();
  const [suggestions, setSuggestions] = useState(getRandomSuggestions());

  const handleFollow = (id: number) => {
    setSuggestions(prev => {
      const remaining = prev.filter(p => p.id !== id);
      if (remaining.length < 3) {
        // Add a new random suggestion not already in the list
        const unused = initialSuggestions.filter(p => !remaining.some(r => r.id === p.id));
        if (unused.length > 0) {
          const next = unused[Math.floor(Math.random() * unused.length)];
          return [...remaining, next];
        }
      }
      return remaining;
    });
  };

  const handleRefresh = () => {
    setSuggestions(getRandomSuggestions());
  };

  const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    backBtn: { padding: 8, marginRight: 8 },
    title: { fontFamily: 'Inter-Bold', fontSize: 24, color: colors.primary, flex: 1 },
    refreshBtn: { padding: 8 },
    list: { padding: 16 },
    card: { backgroundColor: colors.card, borderRadius: 12, marginBottom: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, padding: 12 },
    avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 16 },
    username: { fontFamily: 'Inter-Bold', fontSize: 16, color: colors.text, flex: 1 },
    followBtn: { backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 18 },
    followBtnText: { color: colors.buttonText, fontFamily: 'Inter-Bold', fontSize: 15 },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>People You May Know</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshBtn}>
          <RotateCcw size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={suggestions}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
            <Text style={styles.username}>{item.username}</Text>
            <TouchableOpacity style={styles.followBtn} onPress={() => handleFollow(item.id)}>
              <Text style={styles.followBtnText}>Add Friend</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>No more suggestions. Try refreshing!</Text>}
      />
    </SafeAreaView>
  );
} 