import { useState, useEffect } from 'react';

interface Story {
  id: number;
  username: string;
  avatarUrl: string;
  isViewed: boolean;
}

interface Post {
  id: number;
  username: string;
  avatarUrl: string;
  location: string;
  imageUrl: string;
  likes: number;
  caption: string;
  timeAgo: string;
  isTimeCapsule: boolean;
  openDate?: string;
  mood: string;
  weather: string;
  musicPlaying?: string;
  locationType: 'indoor' | 'outdoor' | 'travel';
  tags: string[];
  relatedCapsules?: number[];
}

interface TrendingItem {
  id: number;
  imageUrl: string;
  isTimeCapsule: boolean;
}

interface TimeCapsule {
  id: number;
  title: string;
  openDate: string;
  coverUrl: string;
  creatorName: string;
  creatorAvatar: string;
  theme: string;
  contributors: number;
  memoryCount: number;
  isPublic: boolean;
  mood: string;
  location: string;
  description: string;
  tags: string[];
}

interface Conversation {
  id: number;
  username: string;
  avatarUrl: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

interface Profile {
  name: string;
  username: string;
  bio: string;
  avatarUrl: string;
  posts: number;
  followers: number;
  following: number;
  activeCapsules: number;
}

interface ProfilePost {
  id: number;
  imageUrl: string;
}

interface ProfileTimeCapsule {
  id: number;
  coverUrl: string;
  openDate: string;
}

interface GroupMember {
  id: number;
  username: string;
  avatarUrl: string;
  role: 'admin' | 'contributor' | 'viewer';
  joinedDate: string;
  isActive: boolean;
}

interface GroupAccount {
  id: number;
  name: string;
  username: string;
  description: string;
  avatarUrl: string;
  coverUrl: string;
  createdAt: string;
  members: GroupMember[];
  posts: number;
  followers: number;
  following: number;
  isPrivate: boolean;
  theme: string;
  tags: string[];
  activeTimeCapsules: number;
}

// Home Feed Data
export function useMockFeedData() {
  const [stories, setStories] = useState<Story[]>([
    {
      id: 1,
      username: 'yourstory',
      avatarUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
      isViewed: false,
    },
    {
      id: 2,
      username: 'alex_j',
      avatarUrl: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
      isViewed: false,
    },
    {
      id: 3,
      username: 'sophia_m',
      avatarUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
      isViewed: true,
    },
    {
      id: 4,
      username: 'david_w',
      avatarUrl: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg',
      isViewed: true,
    },
    {
      id: 5,
      username: 'emma_l',
      avatarUrl: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg',
      isViewed: false,
    },
    {
      id: 6,
      username: 'james_t',
      avatarUrl: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg',
      isViewed: false,
    },
  ]);

  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      username: 'sarah_j',
      avatarUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
      location: 'Crystal Beach',
      imageUrl: 'https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg',
      likes: 245,
      caption: 'Beautiful sunset at the beach today! 🌅 #sunset #beachvibes',
      timeAgo: '2 hours ago',
      isTimeCapsule: true,
      openDate: 'December 25, 2023',
      mood: 'peaceful',
      weather: 'sunny',
      musicPlaying: 'Ocean Waves - Nature Sounds',
      locationType: 'outdoor',
      tags: ['sunset', 'beach', 'peace', 'nature'],
      relatedCapsules: [2, 3]
    },
    {
      id: 2,
      username: 'alex_j',
      avatarUrl: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
      location: 'Downtown Cafe',
      imageUrl: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg',
      likes: 182,
      caption: 'Morning coffee and planning the day ahead ☕',
      timeAgo: '5 hours ago',
      isTimeCapsule: false,
      mood: 'productive',
      weather: 'cloudy',
      musicPlaying: 'Lo-fi Beats',
      locationType: 'indoor',
      tags: ['coffee', 'morning', 'work', 'cafe']
    },
    {
      id: 3,
      username: 'emma_l',
      avatarUrl: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg',
      location: 'Hiking Trail',
      imageUrl: 'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg',
      likes: 346,
      caption: 'Summit reached! The view was worth every step 🏔️ #hiking #mountains',
      timeAgo: '1 day ago',
      isTimeCapsule: false,
      mood: 'accomplished',
      weather: 'clear',
      locationType: 'outdoor',
      tags: ['hiking', 'mountains', 'adventure', 'nature'],
      relatedCapsules: [1]
    },
    {
      id: 4,
      username: 'james_t',
      avatarUrl: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg',
      location: 'Music Festival',
      imageUrl: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg',
      likes: 528,
      caption: 'Best night ever! The concert was amazing 🎵 #musicfestival #livemusic',
      timeAgo: '2 days ago',
      isTimeCapsule: true,
      openDate: 'January 1, 2024',
      mood: 'energetic',
      weather: 'night',
      musicPlaying: 'Live Concert Audio',
      locationType: 'outdoor',
      tags: ['music', 'concert', 'night', 'festival'],
      relatedCapsules: [5]
    },
  ]);

  return { stories, posts };
}

// Discover Data
export function useMockDiscoverData() {
  const [trending, setTrending] = useState<TrendingItem[]>([
    {
      id: 1,
      imageUrl: 'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg',
      isTimeCapsule: false,
    },
    {
      id: 2,
      imageUrl: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg',
      isTimeCapsule: true,
    },
    {
      id: 3,
      imageUrl: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg',
      isTimeCapsule: false,
    },
    {
      id: 4,
      imageUrl: 'https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg',
      isTimeCapsule: true,
    },
    {
      id: 5,
      imageUrl: 'https://images.pexels.com/photos/2253275/pexels-photo-2253275.jpeg',
      isTimeCapsule: false,
    },
    {
      id: 6,
      imageUrl: 'https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg',
      isTimeCapsule: true,
    },
    {
      id: 7,
      imageUrl: 'https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg',
      isTimeCapsule: false,
    },
    {
      id: 8,
      imageUrl: 'https://images.pexels.com/photos/933964/pexels-photo-933964.jpeg',
      isTimeCapsule: true,
    },
    {
      id: 9,
      imageUrl: 'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg',
      isTimeCapsule: false,
    },
  ]);

  const [timeCapsules, setTimeCapsules] = useState<TimeCapsule[]>([
    {
      id: 1,
      title: 'Graduation Memories',
      openDate: 'June 15, 2024',
      coverUrl: 'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg',
      creatorName: 'Alex Johnson',
      creatorAvatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
      theme: 'celebration',
      contributors: 45,
      memoryCount: 128,
      isPublic: true,
      mood: 'nostalgic',
      location: 'University Campus',
      description: 'A collection of our final year memories, from late-night study sessions to graduation day celebrations.',
      tags: ['graduation', 'college', 'friends', 'memories']
    },
    {
      id: 2,
      title: 'Summer Roadtrip 2023',
      openDate: 'July 4, 2024',
      coverUrl: 'https://images.pexels.com/photos/3935702/pexels-photo-3935702.jpeg',
      creatorName: 'Emma Lewis',
      creatorAvatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg',
      theme: 'adventure',
      contributors: 8,
      memoryCount: 64,
      isPublic: false,
      mood: 'adventurous',
      location: 'West Coast',
      description: 'Our epic summer roadtrip across the coast, capturing every sunset and spontaneous detour.',
      tags: ['roadtrip', 'summer', 'travel', 'friends']
    },
    {
      id: 3,
      title: 'New Year Resolutions',
      openDate: 'January 1, 2024',
      coverUrl: 'https://images.pexels.com/photos/3927634/pexels-photo-3927634.jpeg',
      creatorName: 'James Thompson',
      creatorAvatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg',
      theme: 'personal-growth',
      contributors: 1,
      memoryCount: 12,
      isPublic: false,
      mood: 'motivated',
      location: 'Home',
      description: 'My journey of personal growth and achievements throughout the year.',
      tags: ['newyear', 'goals', 'growth', 'reflection']
    },
  ]);

  return { trending, timeCapsules };
}

// Messages Data
export function useMockMessagesData() {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 1,
      username: 'Sarah Johnson',
      avatarUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
      lastMessage: 'I sent you a time capsule! It will open on your birthday 🎁',
      lastMessageTime: '2m ago',
      unreadCount: 2,
      isOnline: true,
    },
    {
      id: 2,
      username: 'Alex Wilson',
      avatarUrl: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
      lastMessage: 'Hey, are we still meeting tomorrow?',
      lastMessageTime: '15m ago',
      unreadCount: 0,
      isOnline: true,
    },
    {
      id: 3,
      username: 'Emma Lewis',
      avatarUrl: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg',
      lastMessage: 'Thanks for the memories! I\'ll check it out.',
      lastMessageTime: '1h ago',
      unreadCount: 0,
      isOnline: false,
    },
    {
      id: 4,
      username: 'David Wang',
      avatarUrl: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg',
      lastMessage: 'Your time capsule from last year is ready to open!',
      lastMessageTime: '3h ago',
      unreadCount: 1,
      isOnline: false,
    },
    {
      id: 5,
      username: 'Sophia Martinez',
      avatarUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
      lastMessage: 'I loved your latest post! Where was that taken?',
      lastMessageTime: '1d ago',
      unreadCount: 0,
      isOnline: false,
    },
    {
      id: 6,
      username: 'James Thompson',
      avatarUrl: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg',
      lastMessage: 'Let\'s create a group time capsule for the reunion!',
      lastMessageTime: '2d ago',
      unreadCount: 0,
      isOnline: true,
    },
  ]);

  return { conversations };
}

// Profile Data
export function useMockProfileData() {
  const [profile, setProfile] = useState<Profile>({
    name: 'Sarah Johnson',
    username: 'sarah_j',
    bio: 'Creating memories one day at a time ✨ | Photographer | Time capsule enthusiast',
    avatarUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
    posts: 42,
    followers: 1254,
    following: 867,
    activeCapsules: 5,
  });

  const [posts, setPosts] = useState<ProfilePost[]>([
    {
      id: 1,
      imageUrl: 'https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg',
    },
    {
      id: 2,
      imageUrl: 'https://images.pexels.com/photos/933964/pexels-photo-933964.jpeg',
    },
    {
      id: 3,
      imageUrl: 'https://images.pexels.com/photos/2253275/pexels-photo-2253275.jpeg',
    },
    {
      id: 4,
      imageUrl: 'https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg',
    },
    {
      id: 5,
      imageUrl: 'https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg',
    },
    {
      id: 6,
      imageUrl: 'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg',
    },
    {
      id: 7,
      imageUrl: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg',
    },
    {
      id: 8,
      imageUrl: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg',
    },
    {
      id: 9,
      imageUrl: 'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg',
    },
  ]);

  const [timeCapsules, setTimeCapsules] = useState<ProfileTimeCapsule[]>([
    {
      id: 1,
      coverUrl: 'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg',
      openDate: 'June 15, 2024',
    },
    {
      id: 2,
      coverUrl: 'https://images.pexels.com/photos/3935702/pexels-photo-3935702.jpeg',
      openDate: 'July 4, 2024',
    },
    {
      id: 3,
      coverUrl: 'https://images.pexels.com/photos/3927634/pexels-photo-3927634.jpeg',
      openDate: 'Jan 1, 2024',
    },
    {
      id: 4,
      coverUrl: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg',
      openDate: 'Dec 25, 2023',
    },
    {
      id: 5,
      coverUrl: 'https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg',
      openDate: 'Feb 14, 2024',
    },
  ]);

  return { profile, posts, timeCapsules };
}

// Group Accounts Data
export function useMockGroupAccountsData() {
  const [groupAccounts, setGroupAccounts] = useState<GroupAccount[]>([] as GroupAccount[]);
  
  useEffect(() => {
    setGroupAccounts([
      {
        id: 1,
        name: 'Travel Squad 2024',
        username: 'travel_squad_2024',
        description: 'Five friends documenting our adventures around the world 🌎',
        avatarUrl: 'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg',
        coverUrl: 'https://images.pexels.com/photos/3935702/pexels-photo-3935702.jpeg',
        createdAt: 'January 1, 2024',
        members: [
          {
            id: 1,
            username: 'sarah_j',
            avatarUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
            role: 'admin',
            joinedDate: 'January 1, 2024',
            isActive: true
          },
          {
            id: 2,
            username: 'alex_j',
            avatarUrl: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
            role: 'contributor',
            joinedDate: 'January 1, 2024',
            isActive: true
          },
          {
            id: 3,
            username: 'emma_l',
            avatarUrl: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg',
            role: 'contributor',
            joinedDate: 'January 2, 2024',
            isActive: true
          }
        ],
        posts: 42,
        followers: 1254,
        following: 867,
        isPrivate: false,
        theme: 'travel',
        tags: ['travel', 'friends', 'adventure', 'memories'],
        activeTimeCapsules: 3
      },
      {
        id: 2,
        name: 'Cooking Club',
        username: 'cooking_club_2024',
        description: 'Sharing our culinary adventures and favorite recipes 👨‍🍳',
        avatarUrl: 'https://images.pexels.com/photos/2253275/pexels-photo-2253275.jpeg',
        coverUrl: 'https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg',
        createdAt: 'February 1, 2024',
        members: [
          {
            id: 4,
            username: 'james_t',
            avatarUrl: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg',
            role: 'admin',
            joinedDate: 'February 1, 2024',
            isActive: true
          },
          {
            id: 5,
            username: 'sophia_m',
            avatarUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
            role: 'contributor',
            joinedDate: 'February 1, 2024',
            isActive: true
          },
          {
            id: 6,
            username: 'david_w',
            avatarUrl: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg',
            role: 'contributor',
            joinedDate: 'February 2, 2024',
            isActive: true
          }
        ],
        posts: 28,
        followers: 856,
        following: 432,
        isPrivate: false,
        theme: 'food',
        tags: ['cooking', 'recipes', 'food', 'culinary'],
        activeTimeCapsules: 2
      },
      {
        id: 3,
        name: 'Family Memories',
        username: 'family_memories_2024',
        description: 'Our family\'s special moments and milestones 👨‍👩‍👧‍👦',
        avatarUrl: 'https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg',
        coverUrl: 'https://images.pexels.com/photos/933964/pexels-photo-933964.jpeg',
        createdAt: 'March 1, 2024',
        members: [
          {
            id: 7,
            username: 'mom_j',
            avatarUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
            role: 'admin',
            joinedDate: 'March 1, 2024',
            isActive: true
          },
          {
            id: 8,
            username: 'dad_j',
            avatarUrl: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
            role: 'admin',
            joinedDate: 'March 1, 2024',
            isActive: true
          },
          {
            id: 9,
            username: 'sister_j',
            avatarUrl: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg',
            role: 'contributor',
            joinedDate: 'March 1, 2024',
            isActive: true
          },
          {
            id: 10,
            username: 'brother_j',
            avatarUrl: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg',
            role: 'contributor',
            joinedDate: 'March 1, 2024',
            isActive: true
          }
        ],
        posts: 15,
        followers: 45,
        following: 12,
        isPrivate: true,
        theme: 'family',
        tags: ['family', 'memories', 'private', 'milestones'],
        activeTimeCapsules: 5
      }
    ]);
  }, []);

  return { groupAccounts };
}