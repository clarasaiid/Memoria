import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '../../components/ThemeProvider';
import { ArrowLeft } from 'lucide-react-native';

const mockFriends = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
  { id: '3', name: 'Charlie' },
];

export default function CreateGroupScreen() {
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const { colors } = useTheme();

  // Filter friends for invite
  const filteredFriends = mockFriends.filter(f => f.name.toLowerCase().includes(memberSearch.toLowerCase()));
  const [members, setMembers] = useState<{id: string, name: string, canInvite: boolean, selected: boolean}[]>(
    mockFriends.map(f => ({ ...f, canInvite: false, selected: false }))
  );

  const toggleSelect = (id: string) => {
    setMembers(members => members.map(m => m.id === id ? { ...m, selected: !m.selected } : m));
  };
  const toggleCanInvite = (id: string) => {
    setMembers(members => members.map(m => m.id === id ? { ...m, canInvite: !m.canInvite } : m));
  };

  const handleCreate = () => {
    // Handle group creation logic here
    router.back();
  };

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      padding: 15,
    },
    header: {
      fontFamily: 'Inter-Bold',
      fontSize: 26,
      color: colors.primary,
      marginBottom: 18,
      marginTop: 0,
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
      marginBottom: 14,
    },
    sectionTitle: {
      fontFamily: 'Inter-Bold',
      fontSize: 17,
      color: colors.primary,
      marginBottom: 8,
      marginTop: 10,
    },
    memberRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 10,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 2,
      elevation: 1,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      backgroundColor: colors.card,
    },
    checkboxSelected: {
      backgroundColor: colors.primary,
    },
    checkboxTick: {
      color: colors.buttonText,
      fontWeight: 'bold',
      fontSize: 15,
    },
    memberName: {
      flex: 1,
      fontFamily: 'Inter-Regular',
      fontSize: 15,
      color: colors.text,
    },
    inviteSwitchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    inviteSwitchLabel: {
      fontFamily: 'Inter-Regular',
      fontSize: 13,
      color: colors.primary,
      marginRight: 2,
    },
    createButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 16,
      marginBottom: 8,
      width: '100%',
    },
    createButtonText: {
      fontFamily: 'Inter-Bold',
      fontSize: 17,
      color: colors.buttonText,
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 4, paddingLeft: 12, marginBottom: 0 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginRight: 4 }}>
          <ArrowLeft size={28} color={colors.text} />
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        <Text style={styles.header}>Create Group</Text>
        <TextInput
          style={styles.input}
          placeholder="Group Name"
          placeholderTextColor={colors.textSecondary}
          value={groupName}
          onChangeText={setGroupName}
        />
        <TextInput
          style={[styles.input, { height: 60 }]}
          placeholder="Description"
          placeholderTextColor={colors.textSecondary}
          value={groupDesc}
          onChangeText={setGroupDesc}
          multiline
        />
        <Text style={styles.sectionTitle}>Invite Members</Text>
        <TextInput
          style={styles.input}
          placeholder="Search friends..."
          placeholderTextColor={colors.textSecondary}
          value={memberSearch}
          onChangeText={setMemberSearch}
        />
        <FlatList
          data={filteredFriends}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.memberRow}>
              <TouchableOpacity onPress={() => toggleSelect(item.id)} style={[styles.checkbox, members.find(m => m.id === item.id)?.selected && styles.checkboxSelected]}>
                {members.find(m => m.id === item.id)?.selected && <Text style={styles.checkboxTick}>✓</Text>}
              </TouchableOpacity>
              <Text style={styles.memberName}>{item.name}</Text>
              <View style={styles.inviteSwitchRow}>
                <Text style={styles.inviteSwitchLabel}>Can invite</Text>
                <Switch
                  value={members.find(m => m.id === item.id)?.canInvite || false}
                  onValueChange={() => toggleCanInvite(item.id)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={members.find(m => m.id === item.id)?.canInvite ? colors.primary : colors.card}
                />
              </View>
            </View>
          )}
        />
        <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
} 