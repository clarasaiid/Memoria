import { useLocalSearchParams, router } from 'expo-router';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput, Platform, useWindowDimensions, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react-native';
import { apiService } from '../services/api';

export default function PostDetails() {
  const { id } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const isLarge = width > 700;

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const res = await apiService.get(`/posts/${id}`);
        setPost(res);
        setComments(res.comments || []);
      } catch (e) {
        setPost(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPost();
  }, [id]);

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
  }

  if (!post) {
    return (
      <View style={styles.centered}><Text>Post not found.</Text></View>
    );
  }

  const handleAddComment = () => {
    if (comment.trim()) {
      setComments([{ id: Date.now(), username: post.user?.userName || 'You', text: comment }, ...comments]);
      setComment('');
    }
  };

  return (
    <View style={[styles.outer, isLarge && styles.outerLarge]}>
      <View style={[styles.card, isLarge && styles.cardLarge]}>
        {/* Image */}
        <View style={[styles.imageCol, isLarge && styles.imageColLarge]}>
          {post.imageUrl && (
            <Image source={{ uri: post.imageUrl.startsWith('http') ? post.imageUrl : `http://localhost:7000${post.imageUrl}` }} style={[styles.postImage, isLarge && styles.postImageLarge]} />
          )}
        </View>
        {/* Info/Comments */}
        <View style={[styles.infoCol, isLarge && styles.infoColLarge]}>
          <View style={styles.infoInner}>
            {/* Header */}
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={styles.backBtn}>
                <ArrowLeft size={24} color="#222" />
              </TouchableOpacity>
              <Image source={{ uri: post.user?.profilePictureUrl || `https://ui-avatars.com/api/?name=${post.user?.userName}` }} style={styles.avatar} />
              <Text style={styles.username}>{post.user?.userName}</Text>
            </View>
            {/* Likes/Caption */}
            <View style={styles.likesRow}>
              <Text style={styles.likesText}>{post.reactions?.length || 0} likes</Text>
            </View>
            <View style={styles.captionRow}>
              <Text style={styles.captionUsername}>{post.user?.userName}</Text>
              <Text style={styles.captionText}> {post.content}</Text>
            </View>
            {/* Comments */}
            <View style={styles.commentsListWrap}>
              <ScrollView style={styles.commentsList} contentContainerStyle={{ paddingBottom: 10 }}>
                {comments.length === 0 && <Text style={styles.noComments}>No comments yet.</Text>}
                {comments.map((c) => (
                  <View key={c.id} style={styles.commentItem}>
                    <Text style={styles.commentUsername}>{c.username}</Text>
                    <Text style={styles.commentText}> {c.text}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
          {/* Add Comment (always at bottom) */}
          <View style={styles.addCommentRow}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              value={comment}
              onChangeText={setComment}
              placeholderTextColor="#888"
            />
            <TouchableOpacity onPress={handleAddComment} style={styles.postBtn}>
              <Text style={styles.postBtnText}>Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: '#fafafa' },
  outerLarge: { alignItems: 'center' },
  card: { flex: 1, backgroundColor: '#fff', borderRadius: 12, margin: 24, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  cardLarge: { flexDirection: 'row', width: 900, height: 520, borderRadius: 16, overflow: 'hidden' },
  imageCol: {},
  imageColLarge: { flex: 1, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center', height: '100%' },
  postImage: { width: '100%', height: 320, resizeMode: 'cover', borderRadius: 12 },
  postImageLarge: { width: 450, height: 630, borderRadius: 0 },
  infoCol: { padding: 24, flex: 1, backgroundColor: '#fff', justifyContent: 'flex-start' },
  infoColLarge: { flex: 1, padding: 40, justifyContent: 'flex-start', height: '100%' },
  infoInner: { flex: 1, justifyContent: 'flex-start' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  backBtn: { marginRight: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  username: { fontSize: 16, color: '#222', fontWeight: 'bold', marginRight: 8 },
  likesRow: { marginBottom: 8 },
  likesText: { fontSize: 15, color: '#222', fontWeight: 'bold' },
  captionRow: { flexDirection: 'row', marginBottom: 10, flexWrap: 'wrap' },
  captionUsername: { fontWeight: 'bold', color: '#222' },
  captionText: { color: '#222' },
  commentsListWrap: { flex: 1, minHeight: 120, maxHeight: 180, marginBottom: 8 },
  commentsList: { flex: 1 },
  noComments: { color: '#888', fontSize: 15, marginBottom: 8 },
  commentItem: { flexDirection: 'row', marginBottom: 6 },
  commentUsername: { fontWeight: 'bold', color: '#222' },
  commentText: { color: '#222' },
  addCommentRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 1, backgroundColor: '#fff' },
  commentInput: { flex: 1, fontSize: 15, color: '#222', padding: 8, backgroundColor: '#f3f3f3', borderRadius: 8, marginRight: 8 },
  postBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#A78BFA', borderRadius: 8 },
  postBtnText: { color: '#fff', fontWeight: 'bold' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
}); 