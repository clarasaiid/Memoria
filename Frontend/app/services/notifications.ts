import { apiService } from './api';

export interface Notification {
  id: string;
  type: 'friend_request' | 'like' | 'time_capsule' | 'group_invite' | 'comment' | 'comment_like';
  text: string;
  read: boolean;
  userId?: string;
  postId?: string;
  capsuleId?: string;
  groupId?: string;
  createdAt: string;
}

export interface FriendRequest {
  id: string;
  username: string;
  avatarUrl: string;
  createdAt: string;
}

class NotificationsService {
  async getNotifications(): Promise<Notification[]> {
    return apiService.get<Notification[]>('/api/notifications');
  }

  async getFriendRequests(): Promise<FriendRequest[]> {
    return apiService.get<FriendRequest[]>('/api/friend-requests');
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    return apiService.put(`/api/notifications/${notificationId}/read`, {});
  }

  async handleFriendRequest(requestId: string, accept: boolean): Promise<void> {
    return apiService.put(`/api/friend-requests/${requestId}`, { accept });
  }

  async deleteNotification(notificationId: string): Promise<void> {
    return apiService.delete(`/api/notifications/${notificationId}`);
  }
}

export const notificationsService = new NotificationsService(); 