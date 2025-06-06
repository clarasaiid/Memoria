import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../../components/ThemeProvider';
import { router } from 'expo-router';
import { useState } from 'react';

const mockGroups = {
  '1': {
    name: 'Nature Lovers',
    description: 'A community for sharing beautiful nature moments.',
    members: 124,
    posts: [
      { id: 'a', content: 'Check out this amazing sunset!' },
      { id: 'b', content: 'Hiking trip this weekend?' },
    ],
  },
  '2': {
    name: 'Bookworms',
    description: 'Discuss and share your favorite books.',
    members: 87,
    posts: [
      { id: 'a', content: 'What are you reading this month?' },
    ],
  },
  '3': {
    name: 'Travelers',
    description: 'Share your travel stories and tips.',
    members: 203,
    posts: [
      { id: 'a', content: 'Best places to visit in 2024?' },
    ],
  },
};

const mockMembers = [
  { id: '1', name: 'Alice', avatarUrl: 'https://randomuser.me/api/portraits/women/1.jpg' },
  { id: '2', name: 'Bob', avatarUrl: 'https://randomuser.me/api/portraits/men/2.jpg' },
  { id: '3', name: 'Charlie', avatarUrl: 'https://randomuser.me/api/portraits/men/3.jpg' },
  { id: '4', name: 'Diana', avatarUrl: 'https://randomuser.me/api/portraits/women/4.jpg' },
  { id: '5', name: 'Eve', avatarUrl: 'https://randomuser.me/api/portraits/women/5.jpg' },
  { id: '6', name: 'Frank', avatarUrl: 'https://randomuser.me/api/portraits/men/6.jpg' },
];

export default function GroupProfileScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const group = mockGroups[id as keyof typeof mockGroups];
  const [membersModalVisible, setMembersModalVisible] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const filteredMembers = mockMembers.filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase()));

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      padding: 20,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 18,
      marginTop: 8,
    },
    iconWrap: {
      backgroundColor: colors.cardAlt,
      borderRadius: 14,
      padding: 16,
      marginRight: 18,
    },
    infoWrap: {
      flex: 1,
    },
    groupName: {
      fontFamily: 'Inter-Bold',
      fontSize: 24,
      color: colors.primary,
      marginBottom: 2,
    },
    groupDesc: {
      fontFamily: 'Inter-Regular',
      fontSize: 15,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    groupMembers: {
      fontFamily: 'Inter-Medium',
      fontSize: 14,
      color: colors.primary,
    },
    sectionTitle: {
      fontFamily: 'Inter-Bold',
      fontSize: 18,
      color: colors.primary,
      marginTop: 18,
      marginBottom: 8,
    },
    postCard: {
      backgroundColor: colors.card,
      borderRadius: 10,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 3,
      elevation: 1,
    },
    postContent: {
      fontFamily: 'Inter-Regular',
      fontSize: 15,
      color: colors.text,
    },
    noPosts: {
      fontFamily: 'Inter-Regular',
      fontSize: 15,
      color: colors.primary,
      textAlign: 'center',
      marginTop: 20,
    },
    notFound: {
      fontFamily: 'Inter-Bold',
      fontSize: 20,
      color: colors.primary,
      textAlign: 'center',
      marginTop: 40,
    },
    input: {
      fontFamily: 'Inter-Regular',
      fontSize: 15,
      color: colors.text,
      backgroundColor: colors.cardAlt,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
  });

  if (!group) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.notFound}>Group not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 4, paddingLeft: 12, marginBottom: 0 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginRight: 4 }}>
          <ArrowLeft size={28} color={colors.text} />
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.iconWrap}>
            <Users size={40} color={colors.primary} />
          </View>
          <View style={styles.infoWrap}>
            <Text style={styles.groupName}>{group.name}</Text>
            <Text style={styles.groupDesc}>{group.description}</Text>
            <TouchableOpacity onPress={() => setMembersModalVisible(true)}>
              <Text style={styles.groupMembers}>{group.members} members</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.sectionTitle}>Posts</Text>
        <FlatList
          data={group.posts}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.postCard}>
              <Text style={styles.postContent}>{item.content}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.noPosts}>No posts yet.</Text>}
        />
      </View>
      {/* Members Modal */}
      <Modal visible={membersModalVisible} animationType="slide">
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }] }>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 4, paddingLeft: 12, marginBottom: 0 }}>
            <TouchableOpacity onPress={() => setMembersModalVisible(false)} style={{ padding: 8, marginRight: 4 }}>
              <ArrowLeft size={28} color={colors.text} />
            </TouchableOpacity>
          </View>
          <View style={{ paddingHorizontal: 20, marginBottom: 8 }}>
            <Text style={styles.sectionTitle}>Group Members</Text>
          </View>
          <View style={{ paddingHorizontal: 20 }}>
            <TextInput
              style={[styles.input, { marginBottom: 12 }]}
              placeholder="Search members..."
              placeholderTextColor={colors.textSecondary}
              value={memberSearch}
              onChangeText={setMemberSearch}
            />
            <FlatList
              data={filteredMembers}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Image source={{ uri: item.avatarUrl }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }} />
                  <Text style={{ fontSize: 16, color: colors.text }}>{item.name}</Text>
                </View>
              )}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
} 