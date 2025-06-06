import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, Plus } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '../../components/ThemeProvider';

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

export default function GroupsScreen() {
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
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 18,
      marginTop: 8,
    },
    header: {
      fontFamily: 'Inter-Bold',
      fontSize: 26,
      color: colors.primary,
    },
    headerButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    discoverButton: {
      backgroundColor: colors.primaryLight,
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 14,
      marginRight: 8,
    },
    discoverButtonText: {
      color: colors.primary,
      fontFamily: 'Inter-Bold',
      fontSize: 15,
    },
    createButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 14,
    },
    createButtonText: {
      color: colors.buttonText,
      fontFamily: 'Inter-Bold',
      fontSize: 15,
      marginLeft: 6,
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
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>Your Groups</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.discoverButton} onPress={() => router.push('/groups/discover')}>
              <Text style={styles.discoverButtonText}>Discover</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createButton} onPress={() => router.push('/groups/create')}>
              <Plus size={20} color="#fff" />
              <Text style={styles.createButtonText}>Create Group</Text>
            </TouchableOpacity>
          </View>
        </View>
        <FlatList
          data={mockGroups}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.groupCard} onPress={() => router.push(`/groups/${item.id}`)}>
              <View style={styles.iconWrap}>
                <Users size={28} color="#A78BFA" />
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