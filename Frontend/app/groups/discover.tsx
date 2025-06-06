import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../../components/ThemeProvider';
import { router } from 'expo-router';

const mockGroups = [
  {
    id: '1',
    name: 'Nature Lovers',
    description: 'A community for sharing beautiful nature moments.',
    members: 124,
  },
  {
    id: '2',
    name: 'Bookworms',
    description: 'Discuss and share your favorite books.',
    members: 87,
  },
  {
    id: '3',
    name: 'Travelers',
    description: 'Share your travel stories and tips.',
    members: 203,
  },
];

export default function DiscoverGroupsScreen() {
  const [search, setSearch] = useState('');
  const filteredGroups = mockGroups.filter(g => g.name.toLowerCase().includes(search.toLowerCase()));
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      padding: 20,
    },
    headerBar: {
      width: '100%',
      paddingTop: 16,
      paddingBottom: 8,
      paddingHorizontal: 20,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: 0,
    },
    header: {
      fontFamily: 'Inter-Bold',
      fontSize: 26,
      color: colors.primary,
      marginBottom: 8,
      marginTop: 10,
    },
    searchInput: {
      fontFamily: 'Inter-Regular',
      fontSize: 15,
      color: colors.text,
      backgroundColor: colors.cardAlt,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 14,
    },
    listContent: {
      paddingBottom: 20,
    },
    groupCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 18,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 1,
    },
    iconWrap: {
      backgroundColor: colors.cardAlt,
      borderRadius: 10,
      padding: 10,
      marginRight: 16,
    },
    infoWrap: {
      flex: 1,
    },
    groupName: {
      fontFamily: 'Inter-Bold',
      fontSize: 18,
      color: colors.primary,
      marginBottom: 2,
    },
    groupDesc: {
      fontFamily: 'Inter-Regular',
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    groupMembers: {
      fontFamily: 'Inter-Medium',
      fontSize: 13,
      color: colors.primary,
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 4, paddingLeft: 12, marginBottom: 0 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginRight: 4 }}>
          <ArrowLeft size={28} color={colors.text} />
        </TouchableOpacity>
      </View>
      <View style={{ paddingHorizontal: 20, marginBottom: 8 }}>
        <Text style={styles.header}>Discover Groups</Text>
      </View>
      <View style={styles.container}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search groups..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
        <FlatList
          data={filteredGroups}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.groupCard}>
              <View style={styles.iconWrap}>
                <Users size={28} color={colors.primary} />
              </View>
              <View style={styles.infoWrap}>
                <Text style={styles.groupName}>{item.name}</Text>
                <Text style={styles.groupDesc}>{item.description}</Text>
                <Text style={styles.groupMembers}>{item.members} members</Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </SafeAreaView>
  );
} 