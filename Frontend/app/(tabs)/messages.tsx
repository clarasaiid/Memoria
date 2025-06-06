import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Search, CreditCard as Edit } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMockMessagesData, useMockFeedData } from '@/hooks/useMockData';
import StoryCircle from '@/components/StoryCircle';
import { router } from 'expo-router';
import { useTheme } from '../../components/ThemeProvider';

export default function MessagesScreen() {
  const { conversations } = useMockMessagesData();
  const { stories } = useMockFeedData();
  const [searchQuery, setSearchQuery] = useState('');
  const { colors } = useTheme();
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <Text style={{ fontFamily: 'Inter-Bold', fontSize: 24, color: colors.text }}>Messages</Text>
          <TouchableOpacity style={{ backgroundColor: colors.primary, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
            <Edit size={20} color={colors.buttonText} />
          </TouchableOpacity>
        </View>

        {/* Stories at the top */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={{ padding: 16 }}
          contentContainerStyle={{ alignItems: 'center' }}
        >
          {stories.map((story) => (
            <StoryCircle
              key={story.id}
              imageUrl={story.avatarUrl}
              username={story.username}
              isViewed={story.isViewed}
            />
          ))}
        </ScrollView>

        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardAlt, borderRadius: 16, paddingHorizontal: 12, marginHorizontal: 16, marginVertical: 12, height: 40 }}>
          <Search size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={{ flex: 1, height: 40, fontFamily: 'Inter-Regular', fontSize: 16, color: colors.text }}
            placeholder="Search"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <FlatList
          data={conversations}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}
              onPress={() => router.push(`/conversation/${item.id}`)}
            >
              <View style={{ position: 'relative', marginRight: 12 }}>
                <Image source={{ uri: item.avatarUrl }} style={{ width: 56, height: 56, borderRadius: 28 }} />
                {item.isOnline && <View style={{ position: 'absolute', width: 14, height: 14, borderRadius: 7, backgroundColor: colors.success, borderWidth: 2, borderColor: colors.card, bottom: 0, right: 0 }} />}
              </View>
              
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={{ fontFamily: 'Inter-Bold', fontSize: 16, color: colors.text }}>{item.username}</Text>
                  <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: colors.textSecondary }}>{item.lastMessageTime}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text 
                    style={{ fontFamily: item.unreadCount > 0 ? 'Inter-Medium' : 'Inter-Regular', color: item.unreadCount > 0 ? colors.text : colors.textSecondary, fontSize: 14, flex: 1 }}
                    numberOfLines={1}
                  >
                    {item.lastMessage}
                  </Text>
                  {item.unreadCount > 0 && (
                    <View style={{ backgroundColor: colors.accent, minWidth: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6, marginLeft: 8 }}>
                      <Text style={{ fontFamily: 'Inter-Bold', fontSize: 12, color: colors.buttonText }}>{item.unreadCount}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}