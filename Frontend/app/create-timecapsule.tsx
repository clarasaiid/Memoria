import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../components/ThemeProvider';
import { apiService } from './services/api';
import { router } from 'expo-router';

export default function CreateTimeCapsulePage() {
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [openDate, setOpenDate] = useState(new Date(Date.now() + 24*60*60*1000));
  const [showDate, setShowDate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await apiService.post('/api/timecapsule', {
        title,
        content,
        openAt: openDate.toISOString(),
      });
      router.replace('/messages');
    } catch (e) {
      setError('Failed to create time capsule.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, padding: 24 }}>
      <Text style={{ fontFamily: 'Inter-Bold', fontSize: 24, color: colors.primary, marginBottom: 24 }}>Create Time Capsule</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.cardAlt, color: colors.text }]}
        placeholder="Title"
        placeholderTextColor={colors.textSecondary}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.textArea, { backgroundColor: colors.cardAlt, color: colors.text }]}
        placeholder="What's inside your time capsule?"
        placeholderTextColor={colors.textSecondary}
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={4}
      />
      <TouchableOpacity onPress={() => setShowDate(true)} style={[styles.dateButton, { backgroundColor: colors.card }]}> 
        <Text style={{ color: colors.text }}>Open Date: {openDate.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {showDate && (
        <DateTimePicker
          value={openDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, date) => {
            setShowDate(false);
            if (date) setOpenDate(date);
          }}
          minimumDate={new Date(Date.now() + 24*60*60*1000)}
        />
      )}
      {error ? <Text style={{ color: 'red', marginVertical: 8 }}>{error}</Text> : null}
      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: colors.primary, opacity: loading ? 0.6 : 1 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={{ color: colors.buttonText, fontFamily: 'Inter-Bold', fontSize: 16 }}>Create</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  input: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  submitButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
}); 