import { apiService } from './api';

export interface SearchResult {
  users: UserResult[];
  hashtags: HashtagResult[];
  groups: GroupResult[];
}

export interface UserResult {
  id: number;
  userName: string;
  firstName: string;
  lastName: string;
  profilePictureUrl: string;
  type: 'user';
}

export interface HashtagResult {
  tag: string;
  count: number;
  type: 'hashtag';
}

export interface GroupResult {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  type: 'group';
}

class SearchService {
  async search(query: string): Promise<SearchResult> {
    return apiService.get<SearchResult>(`/api/search?query=${encodeURIComponent(query)}`);
  }
}

export const searchService = new SearchService(); 