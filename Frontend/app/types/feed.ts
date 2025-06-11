export interface FeedPost {
  id: number;
  username: string;
  avatarUrl: string;
  timeAgo: string;
  imageUrl: string | null;
  content: string;
  likeCount?: number;
  commentCount?: number;
  hashtags?: string[];
  category?: string;
}

export interface FeedMetadata {
  hashtags: string[];
  category: string;
  engagement: number;
  recency: number;
} 