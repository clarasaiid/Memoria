import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Chrome as Home, Users, SquarePlus as PlusSquare, MessageSquare, User } from 'lucide-react-native';
import { View, StyleSheet, TouchableOpacity, Modal, Text } from 'react-native';
import { useTheme } from '../../components/ThemeProvider';
import { useState } from 'react';
import StoryCreator from '../../components/StoryCreator';

export default function TabLayout() {
  const { colors } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [showStoryCreator, setShowStoryCreator] = useState(false);
  const router = useRouter();

  const handleCreate = async (type: string) => {
    setShowModal(false);
    if (type === 'timecapsule') {
      router.push({ pathname: '/create-timecapsule' });
    } else if (type === 'post') {
      router.push('/create');
    } else if (type === 'story') {
      setShowStoryCreator(true);
    }
  };

  const handleStoryCreated = (story: { imageUrl: string; caption?: string }) => {
    // Here you would typically upload the story to your backend
    console.log('New story created:', story);
    setShowStoryCreator(false);
  };

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.tabActive,
          tabBarInactiveTintColor: colors.tabInactive,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.text,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Home size={size} color={color} />
            ),
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="friends"
          options={{
            title: 'Friends',
            tabBarIcon: ({ color, size }) => (
              <Users size={size} color={color} />
            ),
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: 'Create',
            tabBarIcon: ({ color, size }) => (
              <PlusSquare size={size} color={color} />
            ),
            headerShown: false,
            tabBarButton: () => (
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => setShowModal(true)}
              >
                <PlusSquare size={24} color={colors.buttonText} />
              </TouchableOpacity>
            ),
          }}
        />
        <Tabs.Screen
          name="messages"
          options={{
            title: 'Messages',
            tabBarIcon: ({ color, size }) => (
              <MessageSquare size={size} color={color} />
            ),
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <User size={size} color={color} />
            ),
            headerShown: false,
          }}
        />
      </Tabs>
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowModal(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleCreate('timecapsule')}>
              <Text style={[styles.actionText, { color: colors.text }]}>Create Time Capsule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleCreate('post')}>
              <Text style={[styles.actionText, { color: colors.text }]}>Create Post</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleCreate('story')}>
              <Text style={[styles.actionText, { color: colors.text }]}>Create Story</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {showStoryCreator && (
        <StoryCreator
          onStoryCreated={handleStoryCreated}
          onClose={() => setShowStoryCreator(false)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  createButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4682B4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 16,
  },
  actionButton: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  actionText: {
    fontSize: 16,
    textAlign: 'center',
  },
});




