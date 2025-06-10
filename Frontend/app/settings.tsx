import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { ArrowLeft, Calendar, Archive, LogOut } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '../components/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const [privateAccount, setPrivateAccount] = useState(false);
  const { isDark, colors, toggleTheme } = useTheme();

  const handleChangePassword = () => {
    router.push('/change-password');
  };

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>Settings</Text>
        </View>

        {/* Account Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
        <View style={[styles.sectionBox, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
          <TouchableOpacity style={styles.row} onPress={() => router.push('/edit-profile')}>
            <Text style={[styles.rowText, { color: colors.text }]}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={handleChangePassword}>
            <Text style={[styles.rowText, { color: colors.text }]}>Change Password</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => router.push('/archive')}>
            <Text style={[styles.rowText, { color: colors.text }]}>Archive</Text>
            <Ionicons name="archive-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Privacy Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Privacy</Text>
        <View style={[styles.sectionBox, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
          <View style={styles.row}>
            <Text style={[styles.rowText, { color: colors.text }]}>Private Account</Text>
            <Switch value={privateAccount} onValueChange={setPrivateAccount}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={privateAccount ? colors.button : colors.card}
            />
          </View>
        </View>

        {/* Appearance Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
        <View style={[styles.sectionBox, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
          <View style={styles.row}>
            <Text style={[styles.rowText, { color: colors.text }]}>Dark Mode</Text>
            <Switch value={isDark} onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isDark ? colors.button : colors.card}
            />
          </View>
        </View>

        {/* Log Out */}
        <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: colors.error }]} onPress={handleLogout}>
          <Text style={[styles.logoutText, { color: colors.buttonText }]}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backBtn: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 18,
    marginBottom: 8,
  },
  sectionBox: {
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  rowText: {
    fontSize: 16,
  },
  logoutBtn: {
    marginTop: 32,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});