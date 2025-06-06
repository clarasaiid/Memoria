import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../components/ThemeProvider';
import { ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState } from 'react';

const mockCapsules = [
  { id: 1, title: 'Spring Break 2024', openDate: '2025-06-13', coverUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80' },
  { id: 2, title: 'High School Memories', openDate: '2025-07-01', coverUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80' },
  { id: 3, title: 'Family Reunion', openDate: '2022-06-20', coverUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80' },
];

export default function TimeCapsulesPage() {
  const { colors } = useTheme();
  const [lockedCapsuleId, setLockedCapsuleId] = useState<number | null>(null);
  const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    backBtn: { padding: 8, marginRight: 8 },
    title: { fontFamily: 'Inter-Bold', fontSize: 24, color: colors.primary },
    list: { padding: 16 },
    card: { backgroundColor: colors.card, borderRadius: 12, marginBottom: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, padding: 12 },
    cover: { width: 60, height: 60, borderRadius: 10, marginRight: 16 },
    capsuleInfo: { flex: 1 },
    capsuleTitle: { fontFamily: 'Inter-Bold', fontSize: 16, color: colors.text, marginBottom: 4 },
    capsuleDate: { fontFamily: 'Inter-Regular', fontSize: 14, color: colors.textSecondary },
    warning: { color: 'red', fontSize: 12, marginTop: 4 },
  });
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>All Time Capsules</Text>
      </View>
      <FlatList
        data={mockCapsules}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => {
              if (new Date(item.openDate) <= new Date()) {
                router.push({ pathname: '/(capsule)/view', params: { id: item.id } });
              } else {
                setLockedCapsuleId(item.id);
                setTimeout(() => setLockedCapsuleId(null), 2500);
              }
            }}
          >
            <Image source={{ uri: item.coverUrl }} style={styles.cover} />
            <View style={styles.capsuleInfo}>
              <Text style={styles.capsuleTitle}>{item.title}</Text>
              <Text style={styles.capsuleDate}>Opens: {new Date(item.openDate).toLocaleDateString()}</Text>
              {lockedCapsuleId === item.id && (
                <Text style={styles.warning}>This time capsule is still locked</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
} 