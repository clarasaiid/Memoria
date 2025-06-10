import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { UserPlus, Check, UserMinus } from 'lucide-react-native';
import { useTheme } from '@/components/ThemeProvider';
import { apiService } from '../services/api';

interface FriendRequestButtonProps {
  targetUserId: number;
  initialStatus?: 'none' | 'pending' | 'friends';
}

export default function FriendRequestButton({ targetUserId, initialStatus = 'none' }: FriendRequestButtonProps) {
  const [status, setStatus] = useState<'none' | 'pending' | 'friends'>(initialStatus);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { colors } = useTheme();

  useEffect(() => {
    apiService.get('/auth/me').then((me: any) => setCurrentUser(me.profile));
  }, []);

  useEffect(() => {
    if (currentUser) checkFriendshipStatus();
    // eslint-disable-next-line
  }, [targetUserId, currentUser]);

  const checkFriendshipStatus = async () => {
    try {
      // First check if we're already friends
      const response = await apiService.get(`/users/${targetUserId}/relationship`);
      if (response.isFriend) {
        setStatus('friends');
        return;
      }

      // Then check for pending requests
      const requests = await apiService.get('/api/friend-requests');
      const outgoingRequest = requests.some((req: any) =>
        req.UserId === currentUser.id && req.FriendId === targetUserId && !req.Accepted
      );
      const incomingRequest = requests.some((req: any) =>
        req.UserId === targetUserId && req.FriendId === currentUser.id && !req.Accepted
      );

      if (outgoingRequest) {
        setStatus('pending');
      } else if (incomingRequest) {
        setStatus('incoming');
      } else {
        setStatus('none');
      }
    } catch (error) {
      console.error('Error checking friendship status:', error);
    }
  };

  const sendFriendRequest = async () => {
    try {
      setLoading(true);
      await apiService.post('/api/friend-requests', {
        UserId: currentUser.id,
        FriendId: targetUserId,
        Accepted: false
      });
      setStatus('pending');
    } catch (error: any) {
      if (error?.response?.status === 400 && typeof error?.response?.data === 'string' && error.response.data.includes('already exists')) {
        await checkFriendshipStatus();
      } else {
        console.error('Error sending friend request:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleIncomingRequest = async (accept: boolean) => {
    try {
      setLoading(true);
      const requests = await apiService.get('/api/friend-requests');
      const request = requests.find((req: any) =>
        req.UserId === targetUserId && req.FriendId === currentUser.id && !req.Accepted
      );
      
      if (request) {
        await apiService.put(`/api/friend-requests/${request.id}`, { accept });
        setStatus(accept ? 'friends' : 'none');
      }
    } catch (error) {
      console.error('Error handling friend request:', error);
    } finally {
      setLoading(false);
    }
  };

  const getButtonContent = () => {
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
          <View style={[styles.button, { backgroundColor: colors.warning }]}> 
            <UserMinus color={colors.buttonText} size={20} />
            <Text style={[styles.text, { color: colors.buttonText }]}>Pending</Text>
          </View>
        );
      case 'incoming':
        return (
          <View style={styles.incomingContainer}>
            <TouchableOpacity
              style={[styles.incomingButton, { backgroundColor: colors.success }]}
              onPress={() => handleIncomingRequest(true)}
              disabled={loading}
            >
              <Check color={colors.buttonText} size={20} />
              <Text style={[styles.text, { color: colors.buttonText }]}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.incomingButton, { backgroundColor: colors.error }]}
              onPress={() => handleIncomingRequest(false)}
              disabled={loading}
            >
              <UserMinus color={colors.buttonText} size={20} />
              <Text style={[styles.text, { color: colors.buttonText }]}>Decline</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={sendFriendRequest}
            disabled={loading}
          >
            <UserPlus color={colors.buttonText} size={20} />
            <Text style={[styles.text, { color: colors.buttonText }]}> 
              {loading ? 'Sending...' : 'Add Friend'}
            </Text>
          </TouchableOpacity>
        );
    }
  };

  return getButtonContent();
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