import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Send } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../components/ThemeProvider';
import { apiService } from '../services/api';
import * as SignalR from '@microsoft/signalr';

export default function ConversationScreen() {
  const { id, username } = useLocalSearchParams();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const { colors } = useTheme();
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [otherUserOnline, setOtherUserOnline] = useState<boolean>(false);
  const hubConnection = useRef<SignalR.HubConnection | null>(null);

  // Fetch current user, messages, and other user info
  useEffect(() => {
    apiService.get('/api/auth/me').then((me: any) => {
      setCurrentUserId(me.profile.id);
      // Fetch messages between current user and conversation partner
      apiService.get(`/api/messages/between/${me.profile.id}/${id}`).then((msgs: unknown) => {
        setMessages(msgs as any[]);
      });
      // Fetch other user's info
      apiService.get(`/api/users/username/${username}`).then((user: any) => {
        setOtherUser(user);
      });
    });
  }, [id, username]);

  // Setup SignalR connection
  useEffect(() => {
    if (!currentUserId) return;
    const token = localStorage.getItem('token');
    const connection = new SignalR.HubConnectionBuilder()
      .withUrl('http://localhost:7000/chatHub', {
        accessTokenFactory: () => token || ''
      })
      .withAutomaticReconnect()
      .build();
    hubConnection.current = connection;
    connection.start().then(async () => {
      // Check initial online status
      if (otherUser?.id) {
        const isOnline = await connection.invoke('IsUserOnline', otherUser.id);
        setOtherUserOnline(isOnline);
      }
    });
    connection.on('ReceivePrivateMessage', (msg: any) => {
      // Only add if relevant to this conversation
      if ((msg.SenderId === currentUserId && msg.ReceiverId == id) ||
          (msg.SenderId == id && msg.ReceiverId === currentUserId)) {
        setMessages(prev => [...prev, msg]);
      }
    });
    connection.on('UserStatusChanged', (userId: number, isOnline: boolean) => {
      if (otherUser && userId === otherUser.id) {
        setOtherUserOnline(isOnline);
      }
    });
    return () => {
      connection.stop();
    };
  }, [currentUserId, id, otherUser]);

  const handleSend = () => {
    if (message.trim() && hubConnection.current && currentUserId) {
      // Optimistically add the message to the UI
      const newMsg = {
        id: Date.now(),
        SenderId: currentUserId,
        ReceiverId: Number(id),
        Text: message,
        SentAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, newMsg]);
      hubConnection.current.invoke('SendPrivateMessage', currentUserId, Number(id), message);
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
            source={{ uri: otherUser?.profilePictureUrl || 'https://ui-avatars.com/api/?name=' + (otherUser?.userName || otherUser?.username || '') }}
            style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
          />
          <View>
            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 16, color: colors.text }}>{otherUser?.userName || otherUser?.username || 'User'}</Text>
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: colors.textSecondary }}>
              {otherUserOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>

        {/* Messages List */}
        <FlatList
          data={messages}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={{ 
              alignSelf: item.SenderId === currentUserId ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              marginBottom: 16
            }}>
              <View style={{ 
                backgroundColor: item.SenderId === currentUserId ? colors.primary : colors.card,
                padding: 12,
                borderRadius: 16,
                borderTopRightRadius: item.SenderId === currentUserId ? 4 : 16,
                borderTopLeftRadius: item.SenderId === currentUserId ? 16 : 4,
              }}>
                <Text style={{ 
                  fontFamily: 'Inter-Regular', 
                  fontSize: 16, 
                  color: item.SenderId === currentUserId ? colors.buttonText : colors.text 
                }}>
                  {item.Text}
                </Text>
              </View>
              <Text style={{ 
                fontFamily: 'Inter-Regular', 
                fontSize: 12, 
                color: colors.textSecondary,
                marginTop: 4,
                alignSelf: item.SenderId === currentUserId ? 'flex-end' : 'flex-start'
              }}>
                {new Date(item.SentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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