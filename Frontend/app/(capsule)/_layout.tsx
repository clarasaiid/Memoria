import { Stack } from 'expo-router/stack';

export default function CapsuleLayout() {
  return (
    <Stack screenOptions={{ 
      headerShown: false,
      presentation: 'modal',
    }}>
      <Stack.Screen name="view" />
    </Stack>
  );
}