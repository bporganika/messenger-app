import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CallHistoryScreen } from '../screens/calls/CallHistoryScreen';
import type { CallStackParamList } from './types';

const Stack = createNativeStackNavigator<CallStackParamList>();

export function CallStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CallHistory" component={CallHistoryScreen} />
    </Stack.Navigator>
  );
}
