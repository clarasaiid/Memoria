import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '../../components/ThemeProvider';
import { apiService } from '../services/api';

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const { colors } = useTheme();

  const handleSendCode = async () => {
    if (!email) {
      setMessage('Please enter your email.');
      return;
    }
    try {
      await apiService.post('/auth/request-password-reset', email);
      setCodeSent(true);
      setMessage('A verification code has been sent to your email.');
    } catch (error) {
      setMessage('Failed to send code.');
    }
  };

  const handleResetPassword = async () => {
    if (!verificationCode || !newPassword) {
      setMessage('Please enter the code and your new password.');
      return;
    }
    try {
      await apiService.post('/auth/reset-password', {
        email,
        code: verificationCode,
        newPassword
      });
      setMessage('Your password has been reset!');
      setTimeout(() => {
        router.push('/login');
      }, 1200);
    } catch (error) {
      setMessage('Failed to reset password.');
    }
  };

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      padding: 24,
      paddingBottom: 40,
      flexGrow: 1,
      justifyContent: 'center',
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
      fontFamily: 'Kapsalon',
      color: colors.primary,
    },
    instructions: {
      fontSize: 15,
      color: colors.textSecondary,
      marginBottom: 10,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      marginBottom: 14,
      backgroundColor: colors.cardAlt,
      color: colors.text,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 14,
      alignItems: 'center',
      marginBottom: 16,
    },
    buttonText: {
      color: colors.buttonText,
      fontWeight: 'bold',
      fontSize: 16,
    },
    message: {
      color: colors.primary,
      fontSize: 15,
      marginTop: 10,
      textAlign: 'center',
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reset Password</Text>
        </View>
        <Text style={styles.instructions}>Enter your email to receive a verification code.</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TouchableOpacity style={styles.button} onPress={handleSendCode}>
          <Text style={styles.buttonText}>Send Code</Text>
        </TouchableOpacity>
        {codeSent && (
          <>
            <Text style={styles.instructions}>Enter the code sent to your email and your new password.</Text>
            <TextInput
              style={styles.input}
              placeholder="Verification Code"
              value={verificationCode}
              onChangeText={setVerificationCode}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
              <Text style={styles.buttonText}>Reset Password</Text>
            </TouchableOpacity>
          </>
        )}
        {!!message && <Text style={styles.message}>{message}</Text>}
      </ScrollView>
    </SafeAreaView>
  );
} 