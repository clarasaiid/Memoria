import React, { useState, useEffect } from 'react';
import { View, Text, Image, Pressable, Modal, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Home, MessageCircle, User as UserIcon, Users, PlusSquare } from 'lucide-react-native';
import StoryCreator from './StoryCreator';
import { useTheme } from '../components/ThemeProvider';
import { apiService } from '../app/services/api';

const SIDEBAR_WIDTH = 200;
const SIDEBAR_BG = '#23272f';
const SIDEBAR_TEXT = '#fff';
const SIDEBAR_ACTIVE = '#3b82f6';
const SIDEBAR_AVATAR_PLACEHOLDER = 'https://ui-avatars.com/api/?name=User&background=F3E8FF&color=A78BFA';

const NAV_ITEMS = [
  { label: 'Home', icon: 'Home', route: '/' },
  { label: 'Messages', icon: 'MessageCircle', route: '/messages' },
  { label: 'Profile', icon: 'User', route: '/profile' },
  { label: 'My Groups', icon: 'Users', route: '/my-groups' },
];

function MobileTabsLayout({ children, handleCreate, handleStoryCreated }: { children: React.ReactNode; handleCreate: (type: string) => void; handleStoryCreated: (story: { imageUrl: string; caption?: string }) => void }) {
  const { colors } = useTheme();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [showStoryCreator, setShowStoryCreator] = useState(false);

  const handleCreateStory = async (type: string) => {
    setShowModal(false);
    if (type === 'timecapsule') {
      router.push({ pathname: '/create-timecapsule' });
    } else if (type === 'post') {
      router.push('/create');
    } else if (type === 'story') {
      setShowStoryCreator(true);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>{children}</View>
      <View style={styles.mobileTabBar}>
        <Pressable style={styles.mobileTabItem} onPress={() => router.push('/')}> <Home size={22} /> <Text style={styles.mobileTabLabel}>Home</Text> </Pressable>
        <Pressable style={styles.mobileTabItem} onPress={() => router.push('/messages')}> <MessageCircle size={22} /> <Text style={styles.mobileTabLabel}>Messages</Text> </Pressable>
        <Pressable style={styles.mobileTabItem} onPress={() => setShowModal(true)}> <PlusSquare size={22} /> </Pressable>
        <Pressable style={styles.mobileTabItem} onPress={() => router.push('/profile')}> <UserIcon size={22} /> <Text style={styles.mobileTabLabel}>Profile</Text> </Pressable>
        <Pressable style={styles.mobileTabItem} onPress={() => router.push('/my-groups')}> <Users size={22} /> <Text style={styles.mobileTabLabel}>Groups</Text> </Pressable>
      </View>
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowModal(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}> 
            <TouchableOpacity style={styles.actionButton} onPress={() => handleCreateStory('timecapsule')}>
              <Text style={[styles.actionText, { color: colors.text }]}>Create Time Capsule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleCreateStory('post')}>
              <Text style={[styles.actionText, { color: colors.text }]}>Create Post</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleCreateStory('story')}>
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
    </View>
  );
}

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { colors } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [showStoryCreator, setShowStoryCreator] = useState(false);
  const [sidebarUser, setSidebarUser] = useState<{ userName: string; profilePictureUrl?: string } | null>(null);

  useEffect(() => {
    apiService.get('/api/auth/me').then((user: any) => {
      setSidebarUser({
        userName: user.userName || 'User',
        profilePictureUrl: user.profilePictureUrl || '',
      });
    });
  }, []);

  const handleCreate = async (type: string) => {
    setShowModal(false);
    if (type === 'timecapsule') {
      router.push({ pathname: '/create-timecapsule' });
    } else if (type === 'post') {
      router.push('/create');
    }
  };

  const handleStoryCreated = (story: { imageUrl: string; caption?: string }) => {
    setShowStoryCreator(false);
  };

  const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

  if (isMobile) {
    return <MobileTabsLayout handleCreate={handleCreate} handleStoryCreated={handleStoryCreated}>{children}</MobileTabsLayout>;
  }

  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>

      <View style={{
        width: SIDEBAR_WIDTH,
        backgroundColor: colors.card,
        paddingVertical: 32,
        paddingHorizontal: 0,
        alignItems: 'center',
        borderRightWidth: 1,
        borderRightColor: colors.border,
        minHeight: '100%',
      }}>

        <View style={{ alignItems: 'center', width: '100%', marginBottom: 32 }}>
          <Text style={{
            color: colors.primary,
            fontFamily: 'Kapsalon',
            fontSize: 32,
            letterSpacing: 2,
            marginBottom: 16,
            marginTop: 0,
            textAlign: 'center',
            width: '100%',
          }}>MEMORIA</Text>
          <Image
            source={{ uri: (sidebarUser?.profilePictureUrl && sidebarUser.profilePictureUrl !== '' ? sidebarUser.profilePictureUrl : SIDEBAR_AVATAR_PLACEHOLDER) }}
            style={{ width: 56, height: 56, borderRadius: 28, marginBottom: 12, borderWidth: 2, borderColor: colors.primary }}
          />
          <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>
            {sidebarUser?.userName || 'User'}
          </Text>
        </View>
   
        <View style={{ width: '100%' }}>
          {NAV_ITEMS.map(item => (
            <Pressable
              key={item.label}
              style={({ pressed }: { pressed: boolean }) => [{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 18,
                backgroundColor: pressed ? colors.primaryLight : 'transparent',
                borderRadius: 8,
                marginBottom: 6,
                width: '100%',
              }]}
              onPress={() => router.push(item.route as any)}
            >
              {item.icon === 'Home' && <Home size={20} color={colors.text} style={{ marginRight: 14 }} />}
              {item.icon === 'MessageCircle' && <MessageCircle size={20} color={colors.text} style={{ marginRight: 14 }} />}
              {item.icon === 'User' && <UserIcon size={20} color={colors.text} style={{ marginRight: 14 }} />}
              {item.icon === 'Users' && <Users size={20} color={colors.text} style={{ marginRight: 14 }} />}
              <Text style={{ color: colors.text, fontSize: 15, fontWeight: '500' }}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowModal(true)}
        >
          <PlusSquare size={24} color={colors.buttonText} />
        </TouchableOpacity>

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
      </View>
      {/* Main Content */}
      <View style={{ flex: 1 }}>{children}</View>
    </View>
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
    marginTop: 32,
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
  mobileTabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 56,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  mobileTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileTabLabel: {
    fontSize: 11,
    marginTop: 2,
    color: '#222',
  },
}); 