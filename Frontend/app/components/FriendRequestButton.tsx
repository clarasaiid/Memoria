import React, { useState, useEffect, useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator } from 'react-native';
import { UserPlus, Check, UserMinus } from 'lucide-react-native';
import { useTheme } from '@/components/ThemeProvider';
import { useFocusEffect } from '@react-navigation/native';
import { apiService } from '../services/api';

interface FriendRequestButtonProps {
  targetUserId: number;
  currentUser: any;
}

export default function FriendRequestButton({ targetUserId, currentUser }: FriendRequestButtonProps) {
  const [status, setStatus] = useState<'loading' | 'none' | 'pending' | 'incoming' | 'friends'>('loading');
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();

  const checkFriendshipStatus = async () => {
    try {
      setStatus('loading');
      const response: any = await apiService.get(`/api/users/${targetUserId}/relationship`);
      if (response.isFriend) {
        setStatus('friends');
        return;
      }
      if (!currentUser) return setStatus('none');
      const requests: any[] = await apiService.get(`/api/friendships/incoming`);
      const outgoing = requests.find((req: any) =>
        (req.userId || req.UserId) === currentUser.id &&
        (req.friendId || req.FriendId) === targetUserId &&
        !(req.accepted || req.Accepted)
      );
      const incoming = requests.find((req: any) =>
        (req.userId || req.UserId) === targetUserId &&
        (req.friendId || req.FriendId) === currentUser.id &&
        !(req.accepted || req.Accepted)
      );
      if (outgoing) setStatus('pending');
      else if (incoming) setStatus('incoming');
      else setStatus('none');
    } catch (error) {
      console.error('Error checking friendship:', error);
      setStatus('none');
    }
  };

  useEffect(() => {
    if (currentUser && targetUserId) checkFriendshipStatus();
  }, [targetUserId]);

  useFocusEffect(
    useCallback(() => {
      if (currentUser && targetUserId) checkFriendshipStatus();
    }, [targetUserId, currentUser])
  );

  const sendFriendRequest = async () => {
    try {
      setLoading(true);
      const res = await apiService.post('/api/friendships', {
        UserId: currentUser.id,
        FriendId: targetUserId,
        Accepted: false
      });

      if (res && (res as any).id) {
        setStatus('pending');
      } else {
        setTimeout(() => checkFriendshipStatus(), 2000);
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
    } finally {
      setLoading(false);
    }
  };

  const revokeFriendRequest = async () => {
    try {
      setLoading(true);
      const requests: any[] = await apiService.get(`/api/friendships/incoming`);
      const outgoing = requests.find((req: any) =>
        (req.userId || req.UserId) === currentUser.id &&
        (req.friendId || req.FriendId) === targetUserId &&
        !(req.accepted || req.Accepted)
      );
      if (outgoing && typeof outgoing === 'object' && 'id' in outgoing) {
        await apiService.delete(`/api/friendships/${outgoing.id}`);
        setStatus('none');
      }
    } catch (error) {
      console.error('Error revoking friend request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIncomingRequest = async (accept: boolean) => {
    try {
      setLoading(true);
      const requests: any[] = await apiService.get(`/api/friendships/incoming`);
      const request = requests.find((req: any) =>
        (req.userId || req.UserId) === targetUserId &&
        (req.friendId || req.FriendId) === currentUser.id &&
        !(req.accepted || req.Accepted)
      );
      if (request) {
        await apiService.put(`/api/friendships/${request.id}`, { accept });
        setStatus(accept ? 'friends' : 'none');
      }
    } catch (error) {
      console.error('Error handling incoming friend request:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser || status === 'loading') {
    return (
      <View style={[styles.button, { backgroundColor: colors.card, opacity: 0.5 }]}>
        <ActivityIndicator size="small" color={colors.textSecondary} />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.button, { backgroundColor: colors.primary }]}>
        <ActivityIndicator size="small" color={colors.buttonText} />
      </View>
    );
  }

  switch (status) {
    case 'friends':
      return (
        <View style={[styles.button, { backgroundColor: colors.success }]}>
          <Check color={colors.buttonText} size={20} />
          <Text style={[styles.text, { color: colors.buttonText }]}>Friends</Text>
        </View>
      );

    case 'pending':
      return (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.warning }]}
          onPress={revokeFriendRequest}
        >
          <UserMinus color={colors.buttonText} size={20} />
          <Text style={[styles.text, { color: colors.buttonText }]}>Cancel Request</Text>
        </TouchableOpacity>
      );

    case 'incoming':
      return (
        <View style={styles.incomingContainer}>
          <TouchableOpacity
            style={[styles.incomingButton, { backgroundColor: colors.success }]}
            onPress={() => handleIncomingRequest(true)}
          >
            <Check color={colors.buttonText} size={20} />
            <Text style={[styles.text, { color: colors.buttonText }]}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.incomingButton, { backgroundColor: colors.error }]}
            onPress={() => handleIncomingRequest(false)}
          >
            <UserMinus color={colors.buttonText} size={20} />
            <Text style={[styles.text, { color: colors.buttonText }]}>Decline</Text>
          </TouchableOpacity>
        </View>
      );

    case 'none':
    default:
      return (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={sendFriendRequest}
        >
          <UserPlus color={colors.buttonText} size={20} />
          <Text style={[styles.text, { color: colors.buttonText }]}>Add Friend</Text>
        </TouchableOpacity>
      );
  }
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
  incomingContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  incomingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
});
