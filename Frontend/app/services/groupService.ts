import { apiService } from './api';

export interface Group {
  id: number;
  name: string;
  description: string;
  ownerId: number;
  createdAt: string;
  memberCount: number;
  members?: GroupMember[];
  photoUrl?: string;
}

export interface GroupMember {
  id: number;
  userId: number;
  userName: string;
  profilePictureUrl: string;
  role: string;
}

export interface GroupMessage {
  id: number;
  groupChatId: number;
  senderId: number;
  sender: {
    id: number;
    userName: string;
    profilePictureUrl: string;
  };
  content: string;
  sentAt: string;
}

export const groupService = {
  // Group endpoints
  getGroups: () => apiService.get<Group[]>('/api/groups'),
  getGroup: (id: number) => apiService.get<Group>(`/api/groups/${id}`),
  createGroup: (group: Partial<Group>) => apiService.post<Group>('/api/groups', group),
  updateGroup: (id: number, group: Partial<Group>) => apiService.put(`/api/groups/${id}`, group),
  deleteGroup: (id: number) => apiService.delete(`/api/groups/${id}`),
  joinGroup: (id: number) => apiService.post(`/api/groups/${id}/join`),
  leaveGroup: (id: number) => apiService.post(`/api/groups/${id}/leave`),
  inviteMember: (groupId: number, userId: number) => apiService.post(`/api/groups/${groupId}/invite`, { userId }),
  removeMember: (groupId: number, userId: number) => apiService.post(`/api/groups/${groupId}/remove`, { userId }),
  updateGroupPhoto: (id: number, photoUrl: string) => apiService.put(`/api/groups/${id}`, { photoUrl }),

  // Group chat endpoints
  getMessages: (groupId: number) => apiService.get<GroupMessage[]>(`/api/groupchats/${groupId}/messages`),
  sendMessage: (groupId: number, content: string) => apiService.post<GroupMessage>(`/api/groupchats/${groupId}/messages`, content),
}; 