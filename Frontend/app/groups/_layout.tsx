import { Stack } from 'expo-router';
import { useTheme } from '../../components/ThemeProvider';

export default function GroupsLayout() {
  const { colors } = useTheme();
  return (
    <Stack>
      <Stack.Screen
        name="discover"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
    
  );
} 