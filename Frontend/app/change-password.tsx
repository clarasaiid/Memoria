import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '../components/ThemeProvider';
import { apiService } from './services/api';

export default function ChangePasswordScreen() {
  const { colors } = useTheme();
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const handleSave = async () => {
    // Validate inputs
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      setMessage('Please fill in all fields.');
      setMessageType('error');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage('New password and confirmation do not match.');
      setMessageType('error');
      return;
    }

    try {
      console.log('Attempting to change password...');
      const response = await apiService.put('/users/me/password', passwords);
      console.log('Password change response:', response);
      setMessage('Password changed successfully!');
      setMessageType('success');
      
      // Clear form
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      // Navigate back after a short delay
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error: any) {
      console.error('Password change error:', error);
      console.error('Error response:', error.response?.data);
      let errorMessage = 'Failed to change password. Please try again.';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.errors) {
          errorMessage = error.response.data.errors.join('\n');
        } else if (error.response.data.title) {
          errorMessage = error.response.data.title;
        }
      }
      setMessage(errorMessage);
      setMessageType('error');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>Change Password</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={[styles.saveButton, { color: colors.primary }]}>Save</Text>
          </TouchableOpacity>
        </View>

        {message ? (
          <View style={[styles.messageContainer, { backgroundColor: messageType === 'success' ? colors.success : colors.error }]}>
            <Text style={[styles.messageText, { color: colors.buttonText }]}>{message}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Current Password</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.cardAlt,
                color: colors.text,
                borderColor: colors.border
              }]}
              value={passwords.currentPassword}
              onChangeText={(text) => setPasswords({ ...passwords, currentPassword: text })}
              placeholder="Enter current password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>New Password</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.cardAlt,
                color: colors.text,
                borderColor: colors.border
              }]}
              value={passwords.newPassword}
              onChangeText={(text) => setPasswords({ ...passwords, newPassword: text })}
              placeholder="Enter new password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Confirm New Password</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.cardAlt,
                color: colors.text,
                borderColor: colors.border
              }]}
              value={passwords.confirmPassword}
              onChangeText={(text) => setPasswords({ ...passwords, confirmPassword: text })}
              placeholder="Confirm new password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
            />
          </View>
        </View>
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
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    fontSize: 16,
  },
  messageContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  messageText: {
    fontSize: 14,
    textAlign: 'center',
  },
});