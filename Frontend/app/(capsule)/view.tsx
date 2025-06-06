import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { X, Clock, Lock, Globe, Heart, MessageCircle, Share2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Confetti from '@/components/Confetti';
import { useState } from 'react';

export default function CapsuleViewScreen() {
  const { id } = useLocalSearchParams();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(142);
  
  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Confetti />
        
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Clock size={20} color="#A78BFA" />
            <Text style={styles.headerTitle}>Time Capsule Opened</Text>
          </View>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <X size={24} color="#0F172A" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content}>
          <View style={styles.capsuleInfo}>
            <Text style={styles.capsuleTitle}>My Summer Memories 2023</Text>
            <Text style={styles.capsuleDate}>Created: June 15, 2023 • Opened: Now</Text>
            <View style={styles.capsulePrivacy}>
              {/* This example is for a public capsule */}
              <Globe size={16} color="#64748B" />
              <Text style={styles.capsulePrivacyText}>Public Capsule</Text>
            </View>
          </View>
          
          <View style={styles.capsuleCreator}>
            <Image 
              source={{ uri: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg" }} 
              style={styles.creatorAvatar} 
            />
            <View>
              <Text style={styles.creatorName}>Sarah Johnson</Text>
              <Text style={styles.creatorMessage}>A message from the past...</Text>
            </View>
          </View>
          
          <View style={styles.capsuleContent}>
            <Text style={styles.capsuleMessage}>
              Dear Future Me,{'\n\n'}
              I'm writing this on a sunny day in June 2023. I hope when you read this, you'll remember how beautiful this summer was. We went to the beach, hiked in the mountains, and spent countless evenings with friends around bonfires.{'\n\n'}
              I hope you're doing well and all those dreams we had have started to come true. Remember to take time to enjoy the little things in life, just like we did this summer.{'\n\n'}
              With love from the past,{'\n'}
              You
            </Text>
            
            <Image 
              source={{ uri: "https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg" }}
              style={styles.capsuleImage}
            />
            
            <Text style={styles.imageCaption}>Sunset at Crystal Beach - June 2023</Text>
          </View>
          
          <View style={styles.actionContainer}>
            <View style={styles.leftActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleLike}
              >
                <Heart 
                  size={24} 
                  color={isLiked ? '#EC4899' : '#64748B'} 
                  fill={isLiked ? '#EC4899' : 'transparent'} 
                />
                <Text 
                  style={[
                    styles.actionText, 
                    isLiked && styles.likedText
                  ]}
                >
                  {likeCount}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <MessageCircle size={24} color="#64748B" />
                <Text style={styles.actionText}>24</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.shareButton}>
              <Share2 size={20} color="#FFFFFF" />
              <Text style={styles.shareText}>Share</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#0F172A',
    marginLeft: 8,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  capsuleInfo: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  capsuleTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#0F172A',
    marginBottom: 4,
  },
  capsuleDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  capsulePrivacy: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  capsulePrivacyText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#64748B',
    marginLeft: 4,
  },
  capsuleCreator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  creatorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  creatorName: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 2,
  },
  creatorMessage: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
  },
  capsuleContent: {
    padding: 16,
  },
  capsuleMessage: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#0F172A',
    lineHeight: 24,
    marginBottom: 20,
  },
  capsuleImage: {
    width: '100%',
    height: 240,
    borderRadius: 8,
    marginBottom: 8,
  },
  imageCaption: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginBottom: 16,
  },
  leftActions: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#64748B',
    marginLeft: 4,
  },
  likedText: {
    color: '#EC4899',
  },
  shareButton: {
    backgroundColor: '#A78BFA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
  },
});