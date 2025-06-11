import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Bell, UserPlus, Heart, Clock, Users, MessageCircle, ThumbsUp, ArrowLeft, X, Check } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { notificationsService, Notification, FriendRequest } from './services/notifications';
import { useTheme } from '../components/ThemeProvider';
import * as signalR from '@microsoft/signalr';

const getNotificationIcon = (type: Notification['type'], colors: any) => {
  switch (type) {
    case 'friend_request':
      return <UserPlus color={colors.accent} size={24} />;
    case 'friend_request_accepted':
      return <Check color={colors.success} size={24} />;
    case 'follow':
      return <UserPlus color={colors.accent} size={24} />;
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
  const [activeTab, setActiveTab] = useState<'all' | 'requests' | 'follows'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [followRequests, setFollowRequests] = useState<Notification[]>([]);
  const [isPrivateAccount, setIsPrivateAccount] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isDark, colors } = useTheme();

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [notifs, requests, me] = await Promise.all([
        notificationsService.getNotifications(),
        notificationsService.getFriendRequests(),
        notificationsService.getMe(),
      ]);

      setNotifications(notifs);
      setFriendRequests(requests);
      setIsPrivateAccount(me.profile?.isPrivate ?? false);

      if (me.profile?.isPrivate) {
        const followReqs = await notificationsService.getFollowRequests();
        setFollowRequests(followReqs);
      }
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

  // SignalR connection for real-time notifications
  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:7000/chatHub', { withCredentials: true })
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => {
        connection.on('ReceiveNotification', (notification) => {
          setNotifications(prev => [notification, ...prev]);
          if (notification.type === 'friend_request') {
            setFriendRequests(prev => [notification, ...prev]);
          }
          if (notification.type === 'follow' && isPrivateAccount) {
            setFollowRequests(prev => [notification, ...prev]);
          }
        });
      })
      .catch(console.error);

    return () => {
      connection.stop();
    };
  }, [isPrivateAccount]);

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
        case 'follow':
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

  const handleFriendRequest = async (request: Notification, accept: boolean) => {
    try {
      // Use postId (friendship id) if available, else fallback to id
      const friendshipId = request.postId || request.id;
      await notificationsService.handleFriendRequest(String(friendshipId), accept);
      setFriendRequests(prev => prev.filter(req => req.id !== request.id));
      if (accept) {
        setNotifications(prev =>
          prev.filter(n => !(n.type === 'friend_request' && n.id === request.id))
        );
      }
    } catch (err) {
      console.error('Error handling friend request:', err);
    }
  };

  const handleFollowRequest = async (followId: string, accept: boolean) => {
    try {
      await notificationsService.handleFollowRequest(followId, accept);
      setFollowRequests(prev => prev.filter(req => req.id !== followId));
      if (accept) {
        setNotifications(prev => prev.map(n => n.id === followId ? { ...n, read: true } : n));
      }
    } catch (err) {
      console.error('Error handling follow request:', err);
    }
  };

  // Helper to get 'read' property safely
  const getRead = (notif: Notification | FriendRequest) => {
    return (notif as Notification).read ?? false;
  };

  // Helper to map Friendship to notification card props
  const mapFriendRequestToNotification = (req: any) => ({
    id: req.id,
    type: 'friend_request',
    text: `${req.User?.FirstName ?? ''} ${req.User?.LastName ?? ''} (@${req.User?.UserName ?? ''}) sent you a friend request`,
    read: false,
    username: req.User?.UserName ?? '',
    fullName: `${req.User?.FirstName ?? ''} ${req.User?.LastName ?? ''}`.trim(),
    userId: req.User?.Id ?? req.id,
    avatarUrl: req.User?.ProfilePictureUrl ?? '',
    createdAt: req.CreatedAt ?? new Date().toISOString(),
    PostId: req.id,
  });

  const renderNotificationCard = (
    notif: Notification | FriendRequest,
    showActions: boolean = false
  ) => {
    // Determine if this is a friend request and get the correct id for actions
    const isFriendRequest = ('type' in notif ? notif.type : undefined) === 'friend_request';
    // Use PostId if available (from Notification), else userId, else id
    const friendRequestId = isFriendRequest
      ? (('PostId' in notif && notif.PostId) ? String((notif as any).PostId) : String(notif.id))
      : String(notif.id);

    // Get the sender's information
    const avatarUrl = 'senderAvatarUrl' in notif ? notif.senderAvatarUrl : ('avatarUrl' in notif ? notif.avatarUrl : '');
    const username = 'senderUsername' in notif ? notif.senderUsername : ('username' in notif ? notif.username : '');
    const fullName = 'senderFullName' in notif ? notif.senderFullName : ('fullName' in notif ? notif.fullName : '');
    const createdAt = 'createdAt' in notif ? new Date(notif.createdAt) : new Date();

    // Format the time
    const timeAgo = formatTimeAgo(createdAt);

    // Compose the text for friend requests to always include username
    let displayText = '';
    if (isFriendRequest) {
      displayText = `${fullName} (@${username}) sent you a friend request`;
    } else {
      displayText = 'text' in notif ? notif.text || '' : '';
    }

    return (
      <View
        key={notif.id}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: getRead(notif) ? colors.cardAlt : (isDark ? '#23262F' : '#E3F0FF'),
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: getRead(notif) ? colors.border : colors.primary,
          justifyContent: 'space-between',
        }}
      >
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
          onPress={() => handleNotificationPress(notif as Notification)}
        >
          {!getRead(notif) && (
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginRight: 12 }} />
          )}
          {avatarUrl && (
            <Image
              source={{ uri: avatarUrl }}
              style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
            />
          )}
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, color: colors.text, fontWeight: '500' }}>{displayText}</Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>{timeAgo}</Text>
          </View>
        </TouchableOpacity>
        {showActions && isFriendRequest && (
          <View style={{ flexDirection: 'row', gap: 8, marginLeft: 10 }}>
            <TouchableOpacity
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: colors.success,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => handleFriendRequest(notif as Notification, true)}
            >
              <Check color="white" size={20} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: colors.error,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => handleFriendRequest(notif as Notification, false)}
            >
              <X color="white" size={20} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // Helper function to format time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    // Convert UTC to local time
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    const diffInSeconds = Math.floor((now.getTime() - localDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return localDate.toLocaleString();
  };

  const renderFollowRequest = (notif: Notification) => {
    const timeAgo = formatTimeAgo(new Date(notif.createdAt));
    const followRequestId = 'PostId' in notif && notif.PostId ? String((notif as any).PostId) : String(notif.id);
    return (
      <View
        key={notif.id}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: notif.read ? colors.cardAlt : (isDark ? '#23262F' : '#E3F0FF'),
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: notif.read ? colors.border : colors.primary,
        }}
      >
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
          onPress={() => handleNotificationPress(notif)}
        >
          {!notif.read && (
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: colors.primary,
                marginRight: 12,
              }}
            />
          )}
          {notif.senderAvatarUrl && (
            <Image
              source={{ uri: notif.senderAvatarUrl }}
              style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
            />
          )}
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, color: colors.text, fontWeight: '500' }}>
              {notif.senderFullName} (@{notif.senderUsername}) wants to follow you
            </Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>{timeAgo}</Text>
          </View>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', gap: 8, marginLeft: 10 }}>
          <TouchableOpacity
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: colors.success,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => handleFollowRequest(followRequestId, true)}
          >
            <Check color="white" size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: colors.error,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => handleFollowRequest(followRequestId, false)}
          >
            <X color="white" size={20} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
          <Text style={{ fontSize: 16, color: activeTab === 'requests' ? colors.tabActive : colors.tabInactive, fontWeight: activeTab === 'requests' ? '700' : '600' }}>
            Friend Requests{notifications.filter(n => n.type === 'friend_request').length > 0 ? ` (${notifications.filter(n => n.type === 'friend_request').length})` : ''}
          </Text>
        </TouchableOpacity>
        {isPrivateAccount && (
          <TouchableOpacity
            style={[{ marginRight: 24, paddingBottom: 6 }, activeTab === 'follows' && { borderBottomWidth: 3, borderBottomColor: colors.primary }]}
            onPress={() => setActiveTab('follows')}
          >
            <Text style={{ fontSize: 16, color: activeTab === 'follows' ? colors.tabActive : colors.tabInactive, fontWeight: activeTab === 'follows' ? '700' : '600' }}>
              Follow Requests{notifications.filter(n => n.type === 'follow_request').length > 0 ? ` (${notifications.filter(n => n.type === 'follow_request').length})` : ''}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : error ? (
          <Text style={{ color: colors.error, textAlign: 'center', marginTop: 20 }}>{error}</Text>
        ) : activeTab === 'all' ? (
          notifications.length > 0 ? (
            notifications.map((notif) =>
              renderNotificationCard(
                notif,
                notif.type === 'friend_request' // show actions for friend requests
              )
            )
          ) : (
            <Text style={{ textAlign: 'center', color: colors.textSecondary, fontSize: 16 }}>No notifications yet</Text>
          )
        ) : activeTab === 'requests' ? (
          notifications.filter(n => n.type === 'friend_request').length > 0 ? (
            notifications
              .filter(n => n.type === 'friend_request')
              .map((notif) => renderNotificationCard(notif, true))
          ) : (
            <Text style={{ textAlign: 'center', color: colors.textSecondary, fontSize: 16, marginTop: 20 }}>No friend requests</Text>
          )
        ) : activeTab === 'follows' ? (
          notifications.filter(n => n.type === 'follow_request').length > 0 ? (
            notifications
              .filter(n => n.type === 'follow_request')
              .map((notif) => renderFollowRequest(notif))
          ) : (
            <Text style={{ textAlign: 'center', color: colors.textSecondary, fontSize: 16, marginTop: 20 }}>No follow requests</Text>
          )
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
});