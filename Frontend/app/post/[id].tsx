import { useLocalSearchParams, router } from 'expo-router';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput, Platform, useWindowDimensions } from 'react-native';
import { useMockProfileData } from '@/hooks/useMockData';
import { ArrowLeft, MoreHorizontal } from 'lucide-react-native';
import { useState } from 'react';

// Mock comments
const mockComments = [
  { id: 1, username: 'emma_l', text: 'Beautiful view! 😍' },
  { id: 2, username: 'alex_j', text: 'Where is this?' },
  { id: 3, username: 'david_w', text: 'Amazing shot!' },
];

export default function PostDetails() {
  const { id } = useLocalSearchParams();
  const { posts, profile } = useMockProfileData();
  const post = posts.find((p) => p.id.toString() === id);
  const { width } = useWindowDimensions();
  const isLarge = width > 700;
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(mockComments);

  if (!post) {
    return (
      <View style={styles.centered}><Text>Post not found.</Text></View>
    );
  }

  const handleAddComment = () => {
    if (comment.trim()) {
      setComments([{ id: Date.now(), username: profile.username, text: comment }, ...comments]);
      setComment('');
    }
  };

  return (
    <View style={[styles.outer, isLarge && styles.outerLarge]}>
      <View style={[styles.card, isLarge && styles.cardLarge]}>
        {/* Image */}
        <View style={[styles.imageCol, isLarge && styles.imageColLarge]}>
          <Image source={{ uri: post.imageUrl }} style={[styles.postImage, isLarge && styles.postImageLarge]} />
        </View>
        {/* Info/Comments */}
        <View style={[styles.infoCol, isLarge && styles.infoColLarge]}>
          <View style={styles.infoInner}>
            {/* Header */}
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={styles.backBtn}>
                <ArrowLeft size={24} color="#222" />
              </TouchableOpacity>
              <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
              <Text style={styles.username}>{profile.username}</Text>
              <TouchableOpacity style={styles.menuBtn}><MoreHorizontal size={22} color="#222" /></TouchableOpacity>
            </View>
            {/* Likes/Caption */}
            <View style={styles.likesRow}>
              <Text style={styles.likesText}>370,608 likes</Text>
            </View>
            <View style={styles.captionRow}>
              <Text style={styles.captionUsername}>{profile.username}</Text>
              <Text style={styles.captionText}> This is a placeholder caption for the post.</Text>
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
  menuBtn: { marginLeft: 'auto', padding: 6 },
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