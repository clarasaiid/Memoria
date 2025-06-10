import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Send } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTheme } from '../../components/ThemeProvider';

export default function ConversationScreen() {
  const { id } = useLocalSearchParams();
  const [message, setMessage] = useState('');
  const { colors } = useTheme();

  // Mock messages data
  const messages = [
    {
      id: 1,
      text: 'Hey! How are you?',
      sender: 'them',
      timestamp: '10:30 AM'
    },
    {
      id: 2,
      text: 'I\'m good, thanks! How about you?',
      sender: 'me',
      timestamp: '10:31 AM'
    },
    {
      id: 3,
      text: 'I sent you a time capsule! It will open on your birthday 🎁',
      sender: 'them',
      timestamp: '10:32 AM'
    }
  ];

  const handleSend = () => {
    if (message.trim()) {
      // TODO: Implement message sending
      setMessage('');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Image 
            source={{ uri: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg' }} 
            style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }} 
          />
          <View>
            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 16, color: colors.text }}>Sarah Johnson</Text>
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: colors.textSecondary }}>Online</Text>
          </View>
        </View>

        {/* Messages List */}
        <FlatList
          data={messages}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={{ 
              alignSelf: item.sender === 'me' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              marginBottom: 16
            }}>
              <View style={{ 
                backgroundColor: item.sender === 'me' ? colors.primary : colors.card,
                padding: 12,
                borderRadius: 16,
                borderTopRightRadius: item.sender === 'me' ? 4 : 16,
                borderTopLeftRadius: item.sender === 'me' ? 16 : 4,
              }}>
                <Text style={{ 
                  fontFamily: 'Inter-Regular', 
                  fontSize: 16, 
                  color: item.sender === 'me' ? colors.buttonText : colors.text 
                }}>
                  {item.text}
                </Text>
              </View>
              <Text style={{ 
                fontFamily: 'Inter-Regular', 
                fontSize: 12, 
                color: colors.textSecondary,
                marginTop: 4,
                alignSelf: item.sender === 'me' ? 'flex-end' : 'flex-start'
              }}>
                {item.timestamp}
              </Text>
            </View>
          )}
        />

        {/* Message Input */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          padding: 16, 
          borderTopWidth: 1, 
          borderTopColor: colors.border,
          backgroundColor: colors.card
        }}>
          <TextInput
            style={{ 
              flex: 1, 
              backgroundColor: colors.cardAlt,
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 8,
              marginRight: 12,
              fontFamily: 'Inter-Regular',
              fontSize: 16,
              color: colors.text
            }}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <TouchableOpacity 
            onPress={handleSend}
            style={{ 
              backgroundColor: colors.primary,
              width: 40,
              height: 40,
              borderRadius: 20,
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Send size={20} color={colors.buttonText} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
} 