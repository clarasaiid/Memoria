import { apiService } from './api';
import { uploadImage } from './imageUpload';

export interface Story {
  id: string;
  imageUrl: string;
  userId: string;
  username: string;
  avatarUrl: string;
  timestamp: number;
  archiveAt: number;
  isViewed?: boolean;
  content?: string;
}

export interface CreateStoryDto {
  imageUrl: string;
  caption?: string;
}

class StoryService {
  async createStory(imageUri: string, caption?: string): Promise<Story> {
    // First upload the image
    const imageUrl = await uploadImage(imageUri);
    
    // Then create the story post
    const imagePath = imageUrl.replace('http://localhost:7000', '');
    const response = await apiService.post('/posts', {
      ImageUrl: imagePath,
      Content: caption || "",
      IsStory: true,
    });

    return this.formatStory(response);
  }

  async getStories(): Promise<Story[]> {
    const posts = await apiService.get('/posts/stories');
    return (posts as any[]).map(post => this.formatStory(post));
  }

  async getStory(id: string): Promise<Story> {
    const post = await apiService.get(`/posts/${id}`);
    return this.formatStory(post);
  }

  private formatStory(post: any): Story {
    const createdAt = new Date(post.createdAt).getTime();
    const archiveAt = createdAt + 24 * 60 * 60 * 1000; // 24 hours after creation
    return {
      id: post.id,
      imageUrl: post.imageUrl.startsWith('http') ? post.imageUrl : `http://localhost:7000${post.imageUrl}`,
      userId: post.user?.id,
      username: post.user?.userName || post.user?.username || 'Unknown User',
      avatarUrl: post.user?.avatarUrl || post.user?.profilePictureUrl || `https://ui-avatars.com/api/?name=${post.user?.userName || post.user?.username || 'Unknown'}`,
      timestamp: createdAt,
      archiveAt,
      isViewed: post.isViewed || false,
      content: post.content,
    };
  }
}

export const storyService = new StoryService(); 