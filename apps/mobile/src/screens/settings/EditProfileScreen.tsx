import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../design-system';
import { spacing } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text, Input, Button, Avatar } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';

export function EditProfileScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [username, setUsername] = useState(user?.username ?? '');

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bgPrimary }]}
      contentContainerStyle={{
        paddingTop: spacing['24'],
        paddingBottom: insets.bottom + spacing['24'],
      }}
      keyboardShouldPersistTaps="handled">
      <View style={styles.avatarWrap}>
        <Pressable onPress={() => haptics.buttonPress()}>
          <Avatar uri={user?.avatarUrl} name={firstName} size="2xl" />
        </Pressable>
        <Pressable onPress={() => haptics.buttonPress()}>
          <Text
            variant="bodySm"
            color={colors.accentPrimary}
            style={styles.changePhoto}>
            Change photo
          </Text>
        </Pressable>
      </View>

      <Input
        label="First name"
        value={firstName}
        onChangeText={setFirstName}
        containerStyle={styles.field}
      />
      <Input
        label="Last name"
        value={lastName}
        onChangeText={setLastName}
        containerStyle={styles.field}
      />
      <Input
        label="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        containerStyle={styles.field}
      />

      <Button
        title="Save"
        variant="primary"
        size="lg"
        onPress={() => {
          // TODO: call PATCH /users/me
        }}
        style={styles.saveBtn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  avatarWrap: {
    alignItems: 'center',
    marginBottom: spacing['32'],
  },
  changePhoto: {
    marginTop: spacing['8'],
  },
  field: {
    marginBottom: spacing['16'],
    marginHorizontal: spacing['24'],
  },
  saveBtn: {
    marginHorizontal: spacing['24'],
    marginTop: spacing['16'],
  },
});
