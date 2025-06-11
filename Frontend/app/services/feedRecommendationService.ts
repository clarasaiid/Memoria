import { FeedPost } from '../types/feed';

interface UserPreferences {
  interests: string[];
  following: string[];
  likedPosts: number[];
  commentedPosts: number[];
  viewedPosts: number[];
  categories: { [key: string]: number }; // Category weights
}

interface PostMetadata {
  hashtags: string[];
  category: string;
  engagement: number;
  recency: number;
  creatorPopularity: number;
}

export class FeedRecommendationService {
  private static instance: FeedRecommendationService;
  private userPreferences: UserPreferences = {
    interests: [],
    following: [],
    likedPosts: [],
    commentedPosts: [],
    viewedPosts: [],
    categories: {}
  };

  private constructor() {}

  public static getInstance(): FeedRecommendationService {
    if (!FeedRecommendationService.instance) {
      FeedRecommendationService.instance = new FeedRecommendationService();
    }
    return FeedRecommendationService.instance;
  }

  public updateUserPreferences(preferences: Partial<UserPreferences>) {
    this.userPreferences = { ...this.userPreferences, ...preferences };
  }

  public recordPostInteraction(postId: number, interactionType: 'view' | 'like' | 'comment') {
    switch (interactionType) {
      case 'view':
        if (!this.userPreferences.viewedPosts.includes(postId)) {
          this.userPreferences.viewedPosts.push(postId);
        }
        break;
      case 'like':
        if (!this.userPreferences.likedPosts.includes(postId)) {
          this.userPreferences.likedPosts.push(postId);
        }
        break;
      case 'comment':
        if (!this.userPreferences.commentedPosts.includes(postId)) {
          this.userPreferences.commentedPosts.push(postId);
        }
        break;
    }
  }

  private calculatePostScore(post: FeedPost, metadata: PostMetadata): number {
    let score = 0;

    // Recency score (0-1)
    score += metadata.recency * 0.3;

    // Engagement score (0-1)
    score += metadata.engagement * 0.2;

    // Creator popularity score (0-1)
    score += metadata.creatorPopularity * 0.15;

    // Category preference score
    const categoryWeight = this.userPreferences.categories[metadata.category] || 0.5;
    score += categoryWeight * 0.2;

    // Following boost
    if (this.userPreferences.following.includes(post.username)) {
      score += 0.15;
    }

    // Hashtag relevance
    const relevantHashtags = metadata.hashtags.filter(tag => 
      this.userPreferences.interests.some(interest => 
        tag.toLowerCase().includes(interest.toLowerCase())
      )
    );
    score += (relevantHashtags.length / Math.max(metadata.hashtags.length, 1)) * 0.1;

    return score;
  }

  public getRecommendedFeed(posts: FeedPost[]): FeedPost[] {
    // Extract metadata for each post
    const postsWithMetadata = posts.map(post => ({
      post,
      metadata: this.extractPostMetadata(post)
    }));

    // Calculate scores and sort
    const scoredPosts = postsWithMetadata
      .map(({ post, metadata }) => ({
        post,
        score: this.calculatePostScore(post, metadata)
      }))
      .sort((a, b) => b.score - a.score);

    // Return sorted posts
    return scoredPosts.map(({ post }) => post);
  }

  private extractPostMetadata(post: FeedPost): PostMetadata {
    const hashtags = this.extractHashtags(post.content);
    const category = this.determineCategory(post.content);
    const engagement = this.calculateEngagement(post);
    const recency = this.calculateRecency(post.timeAgo);
    const creatorPopularity = this.calculateCreatorPopularity(post);

    return {
      hashtags,
      category,
      engagement,
      recency,
      creatorPopularity
    };
  }

  private extractHashtags(content: string): string[] {
    const hashtagRegex = /#[\w-]+/g;
    return content.match(hashtagRegex) || [];
  }

  private determineCategory(content: string): string {
    const categories = {
      travel: ['travel', 'trip', 'vacation', 'beach', 'mountain', 'journey', 'explore'],
      photography: ['photo', 'picture', 'camera', 'shot', 'capture', 'lens'],
      memories: ['memory', 'remember', 'throwback', 'nostalgia', 'flashback'],
      food: ['food', 'eat', 'restaurant', 'cook', 'recipe', 'dinner', 'lunch'],
      lifestyle: ['lifestyle', 'life', 'daily', 'routine', 'day'],
      art: ['art', 'draw', 'paint', 'creative', 'design', 'artist'],
      music: ['music', 'song', 'concert', 'band', 'artist', 'playlist'],
      sports: ['sport', 'game', 'team', 'play', 'match', 'competition']
    };

    const contentLower = content.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => contentLower.includes(keyword))) {
        return category;
      }
    }
    return 'general';
  }

  private calculateEngagement(post: FeedPost): number {
    const likes = post.likeCount || 0;
    const comments = post.commentCount || 0;
    const views = post.viewCount || 0;
    
    // Weight different types of engagement
    return (likes + comments * 2 + views * 0.5) / 100;
  }

  private calculateRecency(timeAgo: string): number {
    // Convert timeAgo to hours
    const hours = this.parseTimeAgo(timeAgo);
    // Exponential decay: newer posts get higher scores
    return Math.exp(-hours / 24);
  }

  private calculateCreatorPopularity(post: FeedPost): number {
    // This would ideally come from user data, but for now we'll use a simple metric
    const followers = post.followerCount || 0;
    const posts = post.postCount || 0;
    
    // Normalize to 0-1 range
    return Math.min((followers * 0.7 + posts * 0.3) / 1000, 1);
  }

  private parseTimeAgo(timeAgo: string): number {
    const now = new Date();
    const timeAgoLower = timeAgo.toLowerCase();
    
    if (timeAgoLower.includes('just now')) return 0;
    if (timeAgoLower.includes('minute')) return 1;
    if (timeAgoLower.includes('hour')) return 1;
    if (timeAgoLower.includes('day')) return 24;
    if (timeAgoLower.includes('week')) return 168;
    if (timeAgoLower.includes('month')) return 720;
    if (timeAgoLower.includes('year')) return 8760;
    
    return 24; // Default to 1 day if we can't parse
  }
} 