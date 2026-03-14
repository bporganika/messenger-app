import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ContactsScreen } from '../screens/contacts/ContactsScreen';
import { UserProfileScreen } from '../screens/contacts/UserProfileScreen';
import { InviteScreen } from '../screens/contacts/InviteScreen';
import type { ContactStackParamList } from './types';

const Stack = createNativeStackNavigator<ContactStackParamList>();

export function ContactStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="Contacts" component={ContactsScreen} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      <Stack.Screen
        name="Invite"
        component={InviteScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
