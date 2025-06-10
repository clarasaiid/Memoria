import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Text } from 'react-native';

interface StoryCircleProps {
  imageUrl: string;
  username: string;
  isViewed?: boolean;
  onPress: () => void;
  size?: number;
}

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=F3E8FF&color=A78BFA';

export default function StoryCircle({ imageUrl, username, isViewed, onPress, size = 70 }: StoryCircleProps) {
  // Debug: log the imageUrl
  console.log('StoryCircle imageUrl:', imageUrl);
  return (
    <TouchableOpacity style={[styles.container, { width: size, height: size }]} onPress={onPress}>
      <View style={[styles.circle, { borderColor: isViewed ? '#E2E8F0' : '#A78BFA', width: size, height: size, borderRadius: size / 2, overflow: 'hidden' }]}> 
        <Image
          source={{ uri: imageUrl || DEFAULT_AVATAR }}
          style={{ width: size - 8, height: size - 8, borderRadius: (size - 8) / 2 }}
          resizeMode="cover"
        />
      </View>
      <Text style={styles.username} numberOfLines={1}>{username}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: 8,
  },
  circle: {
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    // borderRadius and overflow are set inline for dynamic size
  },
  username: {
    fontSize: 13,
    color: '#334155',
    maxWidth: 80,
    textAlign: 'center',
  },
});