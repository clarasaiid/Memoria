import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { useTheme } from '@/components/ThemeProvider';
import { useRouter } from 'expo-router';

interface MessageButtonProps {
  targetUserId: number;
  targetUsername: string;
}

export default function MessageButton({ targetUserId, targetUsername }: MessageButtonProps) {
  const { colors } = useTheme();
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: '/conversation/[id]',
      params: { id: targetUserId, username: targetUsername }
    });
  };

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: colors.secondary }]}
      onPress={handlePress}
    >
      <MessageCircle color={colors.buttonText} size={20} />
      <Text style={[styles.text, { color: colors.buttonText }]}>Message</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 