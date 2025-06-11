import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomDateTimePicker from '../components/DateTimePicker';
import { useTheme } from '../components/ThemeProvider';
import { apiService } from './services/api';
import { router } from 'expo-router';

export default function CreateTimeCapsulePage() {
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [openDate, setOpenDate] = useState(new Date(Date.now() + 24*60*60*1000));
  const [isPrivate, setIsPrivate] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recipients, setRecipients] = useState<{ id: number; name: string; avatar: string }[]>([]);
  const [recipientSearch, setRecipientSearch] = useState('');

  const friends: { id: number; name: string; avatar: string }[] = [];
  const filteredFriends = friends.filter(f => f.name.toLowerCase().includes(recipientSearch.toLowerCase()) && !recipients.some(r => r.id === f.id));

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        Title: title,
        Content: content,
        OpenAt: openDate.toISOString(),
      };
      let query = '';
      if (isPrivate && recipients.length > 0) {
        query = '?' + recipients.map(r => `viewerIds=${r.id}`).join('&');
      }
      await apiService.post(`/api/timecapsule${query}`, payload);
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
      <CustomDateTimePicker
        value={openDate}
        onChange={setOpenDate}
        minimumDate={new Date(Date.now() + 24 * 60 * 60 * 1000)}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 16 }}>
        <Text style={{ color: colors.text, fontSize: 16, marginRight: 12 }}>Private Capsule</Text>
        <Switch
          value={isPrivate}
          onValueChange={setIsPrivate}
          trackColor={{ false: '#CBD5E1', true: '#A78BFA' }}
          thumbColor="#FFFFFF"
        />
      </View>
      <View style={{ marginVertical: 16 }}>
        <Text style={{ color: colors.text, fontSize: 16, marginBottom: 8 }}>Recipients</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
          {recipients.map(r => (
            <View key={r.id} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardAlt, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 4, marginRight: 8, marginBottom: 8 }}>
              <Text style={{ color: colors.primary, marginRight: 4 }}>{r.name}</Text>
              <TouchableOpacity onPress={() => setRecipients(recipients.filter(x => x.id !== r.id))}>
                <Text style={{ color: colors.error, fontWeight: 'bold' }}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
        <TextInput
          style={{ backgroundColor: colors.cardAlt, color: colors.text, borderRadius: 8, padding: 8, marginBottom: 8 }}
          placeholder="Search friends..."
          placeholderTextColor={colors.textSecondary}
          value={recipientSearch}
          onChangeText={setRecipientSearch}
        />
        {filteredFriends.length > 0 && (
          <View style={{ backgroundColor: colors.card, borderRadius: 8, padding: 8 }}>
            {filteredFriends.map(f => (
              <TouchableOpacity key={f.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6 }} onPress={() => { setRecipients([...recipients, f]); setRecipientSearch(''); }}>
                <Text style={{ color: colors.text }}>{f.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
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