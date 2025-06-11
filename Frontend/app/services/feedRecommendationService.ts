import { FeedPost } from '../types/feed';

interface UserPreferences {
  interests: string[];
  following: string[];
  likedPosts: number[];
  commentedPosts: number[];
}

interface PostMetadata {
  hashtags: string[];
  category: string;
  engagement: number;
  recency: number;
}

export class FeedRecommendationService {
  private static instance: FeedRecommendationService;
  private userPreferences: UserPreferences;
  private postMetadata: Map<number, PostMetadata>;

  private constructor() {
    this.userPreferences = {
      interests: [],
      following: [],
      likedPosts: [],
      commentedPosts: [],
    };
    this.postMetadata = new Map();
  }

  public static getInstance(): FeedRecommendationService {
    if (!FeedRecommendationService.instance) {
      FeedRecommendationService.instance = new FeedRecommendationService();
    }
    return FeedRecommendationService.instance;
  }

  public updateUserPreferences(preferences: Partial<UserPreferences>) {
    this.userPreferences = { ...this.userPreferences, ...preferences };
  }

  public updatePostMetadata(postId: number, metadata: PostMetadata) {
    this.postMetadata.set(postId, metadata);
  }

  private calculatePostScore(post: FeedPost, metadata: PostMetadata): number {
    let score = 0;

    // Recency score (newer posts get higher scores)
    score += metadata.recency * 0.3;

    // Engagement score
    score += metadata.engagement * 0.2;

    // Content relevance score
    const contentRelevance = this.calculateContentRelevance(post, metadata);
    score += contentRelevance * 0.3;

    // Social connection score
    const socialScore = this.calculateSocialScore(post);
    score += socialScore * 0.2;

    return score;
  }

  private calculateContentRelevance(post: FeedPost, metadata: PostMetadata): number {
    let relevance = 0;

    // Check if post contains hashtags that match user interests
    const matchingHashtags = metadata.hashtags.filter(tag =>
      this.userPreferences.interests.some(interest =>
        tag.toLowerCase().includes(interest.toLowerCase())
      )
    );
    relevance += matchingHashtags.length * 0.1;

    // Check if post is from someone the user follows
    if (this.userPreferences.following.includes(post.username)) {
      relevance += 0.3;
    }

    return Math.min(relevance, 1);
  }

  private calculateSocialScore(post: FeedPost): number {
    let score = 0;

    // Posts from users the user has interacted with get higher scores
    if (this.userPreferences.likedPosts.includes(post.id)) {
      score += 0.3;
    }
    if (this.userPreferences.commentedPosts.includes(post.id)) {
      score += 0.2;
    }

    return score;
  }

  public getRecommendedFeed(posts: FeedPost[]): FeedPost[] {
    return posts
      .map(post => ({
        post,
        score: this.calculatePostScore(post, this.postMetadata.get(post.id) || {
          hashtags: [],
          category: 'general',
          engagement: 0,
          recency: 0,
        }),
      }))
      .sort((a, b) => b.score - a.score)
      .map(item => item.post);
  }
} 