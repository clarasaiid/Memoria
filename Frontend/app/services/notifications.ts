import { apiService } from './api'; // your ApiService class

export interface Notification {
  id: string;
  type: 'friend_request' | 'friend_request_accepted' | 'follow' | 'follow_request' | 'like' | 'comment' | 'comment_like' | 'time_capsule' | 'group_invite';
  text: string;
  read: boolean;
  userId?: string;
  postId?: string;
  groupId?: string;
  capsuleId?: string;
  senderId?: string;
  senderAvatarUrl?: string;
  senderUsername?: string;
  senderFullName?: string;
  createdAt: string;
}

export interface FriendRequest {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string;
}

export const notificationsService = {
  // Get general notifications
  async getNotifications(): Promise<Notification[]> {
    return apiService.get('/api/notifications/me');
  },

  // Mark a notification as read
  async markNotificationAsRead(id: string): Promise<void> {
    return apiService.put(`/api/notifications/${id}/read`, {});
  },

  // Get pending friend requests
  async getFriendRequests(): Promise<FriendRequest[]> {
    return apiService.get('/api/friend-requests/incoming'); // adjust as needed
  },

  // Accept or decline a friend request
  async handleFriendRequest(id: string, accept: boolean): Promise<void> {
    return apiService.put(`/api/friend-requests/${id}`, { accept });
  },

  // Get current user profile
  async getMe(): Promise<{ profile: any }> {
    return apiService.get('/auth/me');
  },

  // Get follow requests (for private accounts)
  async getFollowRequests(): Promise<Notification[]> {
    return apiService.get('/api/follow-requests/incoming'); // implement backend if needed
  },

  // Accept or decline a follow request
  async handleFollowRequest(id: string, accept: boolean): Promise<void> {
    return apiService.post(`/api/follow-requests/${id}/${accept ? 'accept' : 'decline'}`, {});
  },
};
