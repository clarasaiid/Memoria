import { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { apiService } from '../services/api';
import type { AuthResponse } from '../types/auth';
import { useTheme } from '../../components/ThemeProvider';
import { useFocusEffect } from '@react-navigation/native';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import React from 'react';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [secondName, setSecondName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [birthdateObj, setBirthdateObj] = useState<Date | undefined>(undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState('');
  const [message, setMessage] = useState('');
  const [registerMessage, setRegisterMessage] = useState('');
  const [registerMessageType, setRegisterMessageType] = useState<'success' | 'error' | ''>('');
  const { colors } = useTheme();
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [username, setUsername] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<null | boolean>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setFirstName('');
      setSecondName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setBirthdate('');
      setGender('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setShowDatePicker(false);
    }, [])
  );

  const handleDateChange = (_event: unknown, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthdateObj(selectedDate);
      const formatted = `${selectedDate.getFullYear()}-${(selectedDate.getMonth()+1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`;
      setBirthdate(formatted);
    }
  };

  function getPasswordRequirements(password: string) {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      digit: /\d/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };
  }
  const requirements = getPasswordRequirements(password);
  const allMet = Object.values(requirements).every(Boolean);

  const handleRegister = async () => {
    console.log('Register button clicked');
    console.log('Form data:', {
      firstName,
      secondName,
      email,
      username,
      password,
      confirmPassword,
      birthdate,
      gender
    });
    
    try {
      if (!firstName || !secondName || !email || !username || !password || !confirmPassword || !birthdate || !gender) {
        console.log('Validation failed - missing fields');
        setMessage('Please fill in all required fields.');
        return;
      }

      if (password !== confirmPassword) {
        console.log('Validation failed - password mismatch');
        setMessage('Passwords do not match.');
        return;
      }

      if (!allMet) {
        setRegisterMessage('Please meet all password requirements.');
        setRegisterMessageType('error');
        setTimeout(() => setRegisterMessage(''), 4000);
        return;
      }

      console.log('Making API request to /auth/register');
      const response = await apiService.post('/auth/register', {
        firstName,
        lastName: secondName,
        email,
        username,
        password,
        confirmPassword,
        birthday: birthdate,
        gender
      });
      
      console.log('Registration successful, response:', response);
      
      // Store email in sessionStorage for web
      if (Platform.OS === 'web') {
        sessionStorage.setItem('pendingVerificationEmail', email);
      }
      
      setRegisterMessage('Registration successful! You will be directed to the verification page now.');
      setRegisterMessageType('success');
      setTimeout(() => {
        setRegisterMessage('');
        setRegisterMessageType('');
        router.push({ pathname: '/verify-email', params: { email } });
      }, 2000);
    } catch (error: any) {
      console.error('Registration error details:', error);
      if (error.response?.data) {
        console.error('Error data:', error.response.data);
        setMessage(error.response.data);
      } else if (error.message) {
        console.error('Error message:', error.message);
        setMessage(error.message);
      } else {
        console.error('Unknown error:', error);
        setMessage('Registration failed. Please try again.');
      }
      setRegisterMessage('Registration failed. Please try again.');
      setRegisterMessageType('error');
      setTimeout(() => setRegisterMessage(''), 4000);
    }
  };

  // Debounced username check
  useEffect(() => {
    if (!username) {
      setUsernameAvailable(null);
      return;
    }
    setCheckingUsername(true);
    const handler = setTimeout(async () => {
      try {
        const res = await apiService.get(`/auth/check-username?username=${encodeURIComponent(username)}`);
        setUsernameAvailable(res.available);
      } catch {
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [username]);

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
    },
    centeredContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    title: {
      fontFamily: 'Kapsalon',
      fontSize: 32,
      color: colors.primary,
      marginBottom: 24,
    },
    formContainer: {
      width: '100%',
      marginBottom: 40,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
    },
    inputContainer: {
      marginBottom: 20,
    },
    halfWidth: {
      width: '48%',
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
      color: colors.primary,
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
    genderInputRow: {
      flexDirection: 'row',
      gap: 8,
      justifyContent: 'space-between',
    },
    genderInput: {
      backgroundColor: colors.cardAlt,
      borderRadius: 8,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: colors.primary,
      flex: 1,
      alignItems: 'center',
      marginRight: 0,
      marginHorizontal: 4,
    },
    genderInputSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    genderInputText: {
      color: colors.primary,
      fontFamily: 'Inter-Medium',
      fontSize: 15,
    },
    genderInputTextSelected: {
      color: colors.buttonText,
    },
    registerButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 16,
    },
    registerButtonText: {
      color: colors.buttonText,
      fontFamily: 'Inter-Bold',
      fontSize: 16,
    },
    errorMessage: {
      marginTop: 12,
      marginBottom: 12,
      textAlign: 'center',
      fontSize: 14,
    },
  });

  const renderBirthdateInput = () => {
    if (Platform.OS === 'web') {
      return (
        <View style={[styles.inputContainer, styles.halfWidth]}>
          <Text style={styles.inputLabel}>Birthdate</Text>
          <input
            style={{
              width: '100%',
              height: 44,
              borderRadius: 8,
              padding: '0 16px',
              fontSize: 16,
              border: `1px solid ${colors.border}`,
              background: colors.cardAlt,
              boxSizing: 'border-box',
              marginBottom: 0,
              color: colors.primary,
              outline: 'none',
            }}
            type="date"
            value={birthdate}
            max={new Date().toISOString().split('T')[0]}
            onChange={e => {
              setBirthdate(e.target.value);
              setBirthdateObj(e.target.value ? new Date(e.target.value) : undefined);
            }}
            placeholder="yyyy-mm-dd"
          />
        </View>
      );
    }
    return (
      <View style={[styles.inputContainer, styles.halfWidth]}>
        <Text style={styles.inputLabel}>Birthdate</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <View pointerEvents="none">
            <TextInput
              style={styles.input}
              placeholder="yyyy-mm-dd"
              placeholderTextColor="#94A3B8"
              value={birthdate}
              editable={false}
            />
          </View>
        </TouchableOpacity>
        {showDatePicker && (
          Platform.OS === 'ios' ? (
            <Modal
              transparent={true}
              animationType="slide"
              visible={showDatePicker}
              onRequestClose={() => setShowDatePicker(false)}
            >
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000088' }}>
                <View style={{ backgroundColor: 'white', borderRadius: 8, padding: 16 }}>
                  <DateTimePicker
                    value={birthdateObj || new Date(2000, 0, 1)}
                    mode="date"
                    display="spinner"
                    onChange={(event, selectedDate) => {
                      if (selectedDate) handleDateChange(event, selectedDate);
                    }}
                    style={{ width: 320 }}
                  />
                  <TouchableOpacity onPress={() => setShowDatePicker(false)} style={{ marginTop: 12 }}>
                    <Text style={{ color: '#4F46E5', fontWeight: 'bold', textAlign: 'center' }}>Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          ) : (
            <DateTimePicker
              value={birthdateObj || new Date(2000, 0, 1)}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) handleDateChange(event, selectedDate);
              }}
            />
          )
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.centeredContent}>
          <Text style={styles.title}>Create Account</Text>
          <View style={styles.formContainer}>
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.inputLabel}>First Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="First Name"
                  placeholderTextColor="#94A3B8"
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Second Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Second Name"
                  placeholderTextColor="#94A3B8"
                  value={secondName}
                  onChangeText={setSecondName}
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Username</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  value={username}
                  onChangeText={setUsername}
                />
                {username.length > 0 && (
                  <Text style={{
                    color: checkingUsername ? '#888' : usernameAvailable === true ? 'green' : usernameAvailable === false ? 'red' : '#888',
                    marginTop: 4,
                    fontSize: 13,
                  }}>
                    {checkingUsername
                      ? 'Checking availability...'
                      : usernameAvailable === true
                        ? 'Username is available!'
                        : usernameAvailable === false
                          ? 'Username is taken.'
                          : ''}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={{ position: 'relative', flex: 1 }}>
                  <TextInput
                    style={[styles.passwordInput, styles.input]}
                    placeholder="Password"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)}
                    style={[styles.eyeButton, { position: 'absolute', right: 0, top: 0, height: '100%', justifyContent: 'center' }]}
                  >
                    {showPassword ? (
                      <EyeOff size={18} color="#4682B4" />
                    ) : (
                      <Eye size={18} color="#4682B4" />
                    )}
                  </TouchableOpacity>
                  {passwordFocused && !allMet && (
                    <View style={{
                      position: 'absolute',
                      left: 0,
                      bottom: '100%',
                      width: '100%',
                      zIndex: 100,
                      backgroundColor: colors.cardAlt,
                      borderRadius: 8,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: '#ddd',
                      shadowColor: '#000',
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                      elevation: 4,
                      marginBottom: 8,
                    }}>
                      <Text>Password must contain:</Text>
                      <Text style={{ color: requirements.length ? 'green' : 'red' }}>• At least 8 characters</Text>
                      <Text style={{ color: requirements.uppercase ? 'green' : 'red' }}>• An uppercase letter</Text>
                      <Text style={{ color: requirements.lowercase ? 'green' : 'red' }}>• A lowercase letter</Text>
                      <Text style={{ color: requirements.digit ? 'green' : 'red' }}>• A digit</Text>
                      <Text style={{ color: requirements.special ? 'green' : 'red' }}>• A special character</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Confirm Password"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} color="#4682B4" />
                    ) : (
                      <Eye size={18} color="#4682B4" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Gender</Text>
                <View style={styles.genderInputRow}>
                  {['Female', 'Male'].map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[styles.genderInput, gender === g && styles.genderInputSelected]}
                      onPress={() => setGender(g)}
                    >
                      <Text style={[styles.genderInputText, gender === g && styles.genderInputTextSelected]}>{g}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              {renderBirthdateInput()}
            </View>
            {message ? (
              <Text style={[styles.errorMessage, { color: colors.error || 'red' }]}>
                {message}
              </Text>
            ) : null}
            {registerMessage && (
              <View style={{
                backgroundColor: registerMessageType === 'success' ? '#d1fae5' : '#fee2e2',
                padding: 12, borderRadius: 8, marginBottom: 16
              }}>
                <Text style={{
                  color: registerMessageType === 'success' ? '#065f46' : '#b91c1c',
                  fontWeight: 'bold', textAlign: 'center'
                }}>
                  {registerMessage}
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={[styles.registerButton, { opacity: allMet ? 1 : 0.5 }]}
              onPress={handleRegister}
              disabled={!allMet}
            >
              <Text style={styles.registerButtonText}>Register</Text>
            </TouchableOpacity>
            <Text style={{ color: colors.text, marginTop: 16 }}>
              Already have an account?{' '}
              <Link href="/login" asChild>
                <TouchableOpacity>
                  <Text style={{ color: colors.primary }}>Login</Text>
                </TouchableOpacity>
              </Link>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}