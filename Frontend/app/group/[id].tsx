import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/utils/api';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

interface Message {
  id: number;
  content: string;
  senderId: string;
  sender: {
    userName: string;
  };
  sentAt: string;
  isEdited: boolean;
}

interface Group {
  id: number;
  name: string;
  description: string;
  members: Array<{
    userId: string;
    role: 'Member' | 'Admin';
  }>;
}

export default function GroupChatScreen() {
  const { id } = useLocalSearchParams();
  const [group, setGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    fetchGroup();
    setupSignalR();
    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, [id]);

  const setupSignalR = async () => {
    try {
      const hubConnection = new HubConnectionBuilder()
        .withUrl(`${api.defaults.baseURL}/groupChatHub`)
        .withAutomaticReconnect()
        .build();

      hubConnection.on('ReceiveMessage', (message: Message) => {
        setMessages((prev) => [message, ...prev]);
      });

      hubConnection.on('MessageEdited', (message: Message) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === message.id ? message : m))
        );
      });

      hubConnection.on('MessageDeleted', (messageId: number) => {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      });

      await hubConnection.start();
      await hubConnection.invoke('JoinGroup', parseInt(id as string));
      setConnection(hubConnection);
    } catch (error) {
      console.error('Error setting up SignalR:', error);
    }
  };

  const fetchGroup = async () => {
    try {
      const [groupResponse, messagesResponse] = await Promise.all([
        api.get(`/api/groups/${id}`),
        api.get(`/api/groups/${id}/messages`),
      ]);
      setGroup(groupResponse.data);
      setMessages(messagesResponse.data);
    } catch (error) {
      console.error('Error fetching group data:', error);
      Alert.alert('Error', 'Failed to load group data');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !connection) return;

    try {
      await connection.invoke('SendMessage', parseInt(id as string), newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.senderId === user?.id;
    const isAdmin = group?.members.find(
      (m) => m.userId === user?.id
    )?.role === 'Admin';

    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
        ]}
      >
        {!isCurrentUser && (
          <Text style={styles.senderName}>{item.sender.userName}</Text>
        )}
        <Text style={styles.messageContent}>{item.content}</Text>
        <Text style={styles.messageTime}>
          {new Date(item.sentAt).toLocaleTimeString()}
          {item.isEdited && ' (edited)'}
        </Text>
        {(isCurrentUser || isAdmin) && (
          <View style={styles.messageActions}>
            {isCurrentUser && (
              <TouchableOpacity
                onPress={() => {
                  // Implement edit functionality
                }}
              >
                <Ionicons name="pencil" size={16} color="#666" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => {
                // Implement delete functionality
              }}
            >
              <Ionicons name="trash" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.groupName}>{group?.name}</Text>
          <Text style={styles.memberCount}>
            {group?.members.length} members
          </Text>
        </View>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => {
            // Implement group settings/menu
          }}
        >
          <Ionicons name="ellipsis-vertical" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        inverted
        contentContainerStyle={styles.messagesList}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !newMessage.trim() && styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={!newMessage.trim()}
        >
          <Ionicons
            name="send"
            size={24}
            color={newMessage.trim() ? '#007AFF' : '#ccc'}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
  },
  memberCount: {
    fontSize: 14,
    color: '#666',
  },
  menuButton: {
    marginLeft: 16,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    marginBottom: 16,
    padding: 12,
    borderRadius: 16,
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  messageContent: {
    fontSize: 16,
    color: '#000',
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  messageActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
}); 