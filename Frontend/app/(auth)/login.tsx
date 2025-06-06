import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiService } from '../services/api';
import type { LoginData, AuthResponse } from '../types/auth';
import { useTheme } from '../../components/ThemeProvider';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showVerified, setShowVerified] = useState(false);
  const [loginMessage, setLoginMessage] = useState('');
  const [loginMessageType, setLoginMessageType] = useState<'success' | 'error' | ''>('');
  
  const { colors } = useTheme();
  const params = useLocalSearchParams();
  
  useEffect(() => {
    if (params.verified === '1') {
      setShowVerified(true);
      setTimeout(() => setShowVerified(false), 4000);
    }
  }, [params.verified]);
  
  const handleLogin = async () => {
    try {
      const response = await apiService.post<AuthResponse>('/auth/login', {
        email: email,
        password: password
      });
      apiService.setToken(response.token);
      setLoginMessage('Login successful!');
      setLoginMessageType('success');
      setTimeout(() => {
        setLoginMessage('');
        setLoginMessageType('');
        router.replace('/(tabs)');
      }, 1500);
    } catch (error: any) {
      let msg = 'Login failed. Please try again.';
      if (error.response?.data) msg = error.response.data;
      setLoginMessage(msg);
      setLoginMessageType('error');
      setTimeout(() => setLoginMessage(''), 4000);
    }
  };
  
  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      padding: 24,
      justifyContent: 'center',
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 40,
    },
    logoText: {
      fontFamily: 'Kapsalon',
      fontSize: 40,
      color: colors.primary,
      marginBottom: 8,
    },
    tagline: {
      fontFamily: 'Kapsalon',
      fontSize: 16,
      color: colors.primary,
    },
    formContainer: {
      marginBottom: 40,
    },
    inputContainer: {
      marginBottom: 20,
    },
    inputLabel: {
      fontFamily: 'Inter-Medium',
      fontSize: 16,
      color: colors.primary,
      marginBottom: 8,
    },
    input: {
      fontFamily: 'Inter-Regular',
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.cardAlt,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardAlt,
      borderRadius: 8,
    },
    passwordInput: {
      flex: 1,
      fontFamily: 'Inter-Regular',
      fontSize: 16,
      color: colors.text,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    eyeButton: {
      padding: 12,
    },
    forgotPassword: {
      alignSelf: 'flex-end',
      marginBottom: 24,
    },
    forgotPasswordText: {
      fontFamily: 'Inter-Medium',
      fontSize: 14,
      color: colors.primary,
    },
    loginButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 16,
      alignItems: 'center',
      marginBottom: 24,
    },
    loginButtonText: {
      color: colors.buttonText,
      fontFamily: 'Inter-Bold',
      fontSize: 16,
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      marginHorizontal: 8,
      color: colors.textSecondary,
      fontSize: 14,
    },
    socialButton: {
      backgroundColor: colors.cardAlt,
      borderRadius: 8,
      paddingVertical: 14,
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    socialButtonText: {
      color: colors.text,
      fontFamily: 'Inter-Bold',
      fontSize: 16,
    },
    footer: {
      alignItems: 'center',
      marginTop: 16,
    },
    footerText: {
      color: colors.textSecondary,
      fontSize: 15,
    },
    signupText: {
      color: colors.primary,
      fontFamily: 'Inter-Bold',
      fontSize: 15,
    },
  });
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>Memoria</Text>
            <Text style={styles.tagline}>Capture moments for the future</Text>
          </View>
          
          {showVerified && (
            <View style={{ backgroundColor: '#d1fae5', padding: 12, borderRadius: 8, marginBottom: 16 }}>
              <Text style={{ color: '#065f46', fontWeight: 'bold', textAlign: 'center' }}>
                Email verified! You can now log in.
              </Text>
            </View>
          )}
          {loginMessage && (
            <View style={{
              backgroundColor: loginMessageType === 'success' ? '#d1fae5' : '#fee2e2',
              padding: 12, borderRadius: 8, marginBottom: 16
            }}>
              <Text style={{
                color: loginMessageType === 'success' ? '#065f46' : '#b91c1c',
                fontWeight: 'bold', textAlign: 'center'
              }}>
                {loginMessage}
              </Text>
            </View>
          )}
          
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#64748B" />
                  ) : (
                    <Eye size={20} color="#64748B" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
            
            <TouchableOpacity style={styles.forgotPassword} onPress={() => router.push('/reset-password')}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={handleLogin}
            >
              <Text style={styles.loginButtonText}>Log In</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Don't have an account? {' '}
              <Link href="/register" asChild>
                <TouchableOpacity>
                  <Text style={styles.signupText}>Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}