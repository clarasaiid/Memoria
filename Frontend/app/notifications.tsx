import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Bell, UserPlus, Heart, Clock, Users, MessageCircle, ThumbsUp, ArrowLeft, X, Check } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { notificationsService, Notification, FriendRequest } from './services/notifications';
import { useTheme } from '../components/ThemeProvider';

const getNotificationIcon = (type: Notification['type'], colors: any) => {
  switch (type) {
    case 'friend_request':
      return <UserPlus color={colors.accent} size={24} />;
    case 'friend_request_accepted':
      return <Check color={colors.success} size={24} />;
    case 'like':
      return <Heart color={colors.accent} size={24} />;
    case 'time_capsule':
      return <Clock color={colors.primary} size={24} />;
    case 'group_invite':
      return <Users color={colors.secondary} size={24} />;
    case 'comment':
      return <MessageCircle color={colors.secondary} size={24} />;
    case 'comment_like':
      return <ThumbsUp color={colors.warning} size={24} />;
  }
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'requests'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isDark, colors } = useTheme();

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [notifs, requests] = await Promise.all([
        notificationsService.getNotifications(),
        notificationsService.getFriendRequests(),
      ]);
      setNotifications(notifs);
      setFriendRequests(requests);
    } catch (err) {
      setError('Failed to load notifications. Please try again.');
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleNotificationPress = async (notification: Notification) => {
    try {
      if (!notification.read) {
        await notificationsService.markNotificationAsRead(notification.id);
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
        );
      }

      switch (notification.type) {
        case 'friend_request':
        case 'friend_request_accepted':
          if (notification.userId) {
            router.push({ pathname: '/profile', params: { username: String(notification.userId) } });
          }
          break;
        case 'like':
        case 'comment':
        case 'comment_like':
          if (notification.postId) {
            router.push({ pathname: '/post/[id]', params: { id: String(notification.postId) } });
          }
          break;
        case 'time_capsule':
          if (notification.capsuleId) {
            router.push({ pathname: '/(capsule)/view', params: { id: String(notification.capsuleId) } });
          }
          break;
        case 'group_invite':
          if (notification.groupId) {
            router.push({ pathname: '/groups/[id]', params: { id: String(notification.groupId) } });
          }
          break;
      }
    } catch (err) {
      console.error('Error handling notification press:', err);
    }
  };

  const handleFriendRequest = async (requestId: string, accept: boolean) => {
    try {
      await notificationsService.handleFriendRequest(requestId, accept);
      setFriendRequests(prev => prev.filter(req => req.id !== requestId));
      if (accept) {
        setNotifications(prev => 
          prev.filter(n => !(n.type === 'friend_request' && n.userId === requestId))
        );
      }
    } catch (err) {
      console.error('Error handling friend request:', err);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <ArrowLeft color={colors.primary} size={28} />
          </TouchableOpacity>
          <Bell color={colors.primary} size={32} />
          <Text style={{ fontFamily: 'Kapsalon', fontSize: 24, color: colors.primary, marginLeft: 12 }}>Notifications</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <ArrowLeft color={colors.primary} size={28} />
          </TouchableOpacity>
          <Bell color={colors.primary} size={32} />
          <Text style={{ fontFamily: 'Kapsalon', fontSize: 24, color: colors.primary, marginLeft: 12 }}>Notifications</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: colors.error, fontSize: 16, textAlign: 'center', marginBottom: 16 }}>{error}</Text>
          <TouchableOpacity style={{ backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }} onPress={loadData}>
            <Text style={{ color: colors.buttonText, fontSize: 16, fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <ArrowLeft color={colors.primary} size={28} />
        </TouchableOpacity>
        <Bell color={colors.primary} size={32} />
        <Text style={{ fontFamily: 'Kapsalon', fontSize: 24, color: colors.primary, marginLeft: 12 }}>Notifications</Text>
      </View>

      <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.background }}>
        <TouchableOpacity 
          style={[{ marginRight: 24, paddingBottom: 6 }, activeTab === 'all' && { borderBottomWidth: 3, borderBottomColor: colors.primary }]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={{ fontSize: 16, color: activeTab === 'all' ? colors.tabActive : colors.tabInactive, fontWeight: activeTab === 'all' ? '700' : '600' }}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[{ marginRight: 24, paddingBottom: 6 }, activeTab === 'requests' && { borderBottomWidth: 3, borderBottomColor: colors.primary }]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={{ fontSize: 16, color: activeTab === 'requests' ? colors.tabActive : colors.tabInactive, fontWeight: activeTab === 'requests' ? '700' : '600' }}>Friend Requests</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {activeTab === 'all' ? (
          notifications.length > 0 ? (
            notifications.map((notif) => (
              <TouchableOpacity
                key={notif.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: notif.read ? colors.cardAlt : (isDark ? '#23262F' : '#E3F0FF'),
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: notif.read ? colors.border : colors.primary,
                  shadowOpacity: 0.04,
                  shadowRadius: 4,
                  shadowOffset: { width: 0, height: 2 },
                }}
                onPress={() => handleNotificationPress(notif)}
              >
                {!notif.read && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginRight: 12 }} />}
                {getNotificationIcon(notif.type, colors)}
                <Text style={{ fontSize: 15, color: colors.text, marginLeft: 16, fontWeight: '500' }}>{notif.text}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={{ textAlign: 'center', color: colors.textSecondary, fontSize: 16, marginTop: 20 }}>No notifications yet</Text>
          )
        ) : (
          friendRequests.length > 0 ? (
            friendRequests.map((request) => (
              <View key={request.id} style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: colors.cardAlt,
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: colors.border,
              }}>
                <TouchableOpacity 
                  style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                  onPress={() => router.push({ pathname: '/profile', params: { username: String(request.username) } })}
                >
                  <View style={{ marginRight: 12 }}>
                    <Image source={{ uri: request.avatarUrl }} style={{ width: 40, height: 40, borderRadius: 20 }} />
                  </View>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>{request.username}</Text>
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity 
                    style={{ width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.success }}
                    onPress={() => handleFriendRequest(request.id, true)}
                  >
                    <Check color={colors.buttonText} size={20} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={{ width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.error }}
                    onPress={() => handleFriendRequest(request.id, false)}
                  >
                    <X color={colors.buttonText} size={20} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={{ textAlign: 'center', color: colors.textSecondary, fontSize: 16, marginTop: 20 }}>No friend requests</Text>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
} 