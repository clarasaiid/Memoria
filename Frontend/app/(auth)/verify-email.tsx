import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { apiService } from '../services/api';
import { useTheme } from '../../components/ThemeProvider';

export default function VerifyEmailScreen() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const params = useLocalSearchParams();
  const { email } = params;
  const { colors } = useTheme();

  useEffect(() => {
    if (params.token) {
      verifyEmail(params.token as string);
    }
  }, [params.token]);

  const verifyEmail = async (token: string) => {
    setLoading(true);
    try {
      const res = await apiService.get(`/auth/confirm-email?token=${token}`);
      if (res.token) {
        apiService.setToken(res.token);
        setMessage('Email verified successfully! You can now set up your profile.');
        setTimeout(() => {
          setMessage('');
          router.replace(`/profile-details`);
        }, 1800);
      } else {
        setMessage('Verification succeeded, but no token received. Please log in.');
      }
    } catch (error: any) {
      setMessage(error.response?.data || 'Failed to verify email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setMessage('No email address found. Please register again.');
      return;
    }

    setLoading(true);
    try {
      await apiService.post('/auth/resend-verification', { email });
      setMessage('Verification email resent! Please check your inbox.');
    } catch (error: any) {
      setMessage(error.response?.data || 'Failed to resend email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Check your email</Text>
      <Text style={[styles.text, { color: colors.text }]}>
        We've sent a verification link to your email. Please click the link to verify your account.
      </Text>
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.primary }]} 
          onPress={handleResend}
        >
          <Text style={styles.buttonText}>Resend verification email</Text>
        </TouchableOpacity>
      )}
      {!!message && (
        <View style={{ backgroundColor: message.includes('success') ? '#d1fae5' : '#fee2e2', padding: 12, borderRadius: 8, marginTop: 16 }}>
          <Text style={{ color: message.includes('success') ? '#065f46' : '#b91c1c', fontWeight: 'bold', textAlign: 'center' }}>{message}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 24 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 16 
  },
  text: { 
    fontSize: 16, 
    textAlign: 'center', 
    marginBottom: 24 
  },
  button: { 
    padding: 12, 
    borderRadius: 8, 
    marginTop: 12 
  },
  buttonText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  message: { 
    marginTop: 12, 
    fontSize: 15 
  }
}); 