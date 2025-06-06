import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

interface StoryCircleProps {
  imageUrl: string;
  username: string;
  isViewed: boolean;
}

export default function StoryCircle({ imageUrl, username, isViewed }: StoryCircleProps) {
  return (
    <TouchableOpacity style={styles.container}>
      <View style={[styles.imageContainer, isViewed ? styles.viewedBorder : styles.unviewedBorder]}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
      </View>
      <Text style={styles.username} numberOfLines={1}>
        {username}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: 12,
    width: 80,
  },
  imageContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    padding: 2,
    marginBottom: 4,
  },
  unviewedBorder: {
    borderWidth: 2,
    borderColor: '#A78BFA',
  },
  viewedBorder: {
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  username: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#0F172A',
    textAlign: 'center',
    width: '100%',
  },
});