import { useState } from 'react';
import { apiService } from '../app/services/api';

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  userId: number;
  username: string;
}

interface Reaction {
  id: number;
  userId: number;
  postId: number;
  type: 'Like';
  createdAt: string;
}

export const usePostInteractions = (postId: number) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPostInteractions = async () => {
    try {
      setIsLoading(true);
      const [reactions, commentsData] = await Promise.all([
        apiService.get<Reaction[]>(`/api/reactions/post/${postId}`),
        apiService.get<Comment[]>(`/api/comments?postId=${postId}`)
      ]);

      setLikeCount(reactions.length);
      setComments(commentsData);
      // Check if current user has liked the post
      const currentUserId = await apiService.get<number>('/api/auth/me');
      setIsLiked(reactions.some(r => r.userId === currentUserId));
    } catch (error) {
      console.error('Error fetching post interactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLike = async () => {
    try {
      setIsLoading(true);
      await apiService.post(`/api/reactions/like/${postId}`, {});
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addComment = async (content: string) => {
    try {
      setIsLoading(true);
      const newComment = await apiService.post<Comment>('/api/comments', {
        content,
        postId
      });
      setComments(prev => [...prev, newComment]);
      return newComment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLiked,
    likeCount,
    comments,
    isLoading,
    fetchPostInteractions,
    toggleLike,
    addComment
  };
}; 