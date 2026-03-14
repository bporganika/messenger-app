import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ChatListScreen } from '../screens/chats/ChatListScreen';
import { ChatScreen } from '../screens/chats/ChatScreen';
import { MediaViewerScreen } from '../screens/chats/MediaViewerScreen';
import type { ChatStackParamList } from './types';

const Stack = createNativeStackNavigator<ChatStackParamList>();

export function ChatStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="ChatList" component={ChatListScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen
        name="MediaViewer"
        component={MediaViewerScreen}
        options={{
          animation: 'fade',
          presentation: 'fullScreenModal',
        }}
      />
    </Stack.Navigator>
  );
}
