import React from 'react';
import { View, StyleSheet, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../design-system';
import { spacing } from '../../design-system/tokens';
import { Text, Button } from '../../components/ui';
import type { ContactScreenProps } from '../../navigation/types';

export function InviteScreen({ navigation }: ContactScreenProps<'Invite'>) {
  const { colors, brand } = useTheme();
  const insets = useSafeAreaInsets();

  const handleShare = async () => {
    await Share.share({
      message: 'Join me on Pulse Messenger! https://pulse.app/invite/demo',
    });
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bgPrimary,
          paddingTop: insets.top + spacing['32'],
          paddingBottom: insets.bottom + spacing['24'],
        },
      ]}>
      <View style={styles.iconWrap}>
        <View style={[styles.iconCircle, { backgroundColor: brand.violet + '1A' }]}>
          <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
            <Path
              d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M8.5 11a4 4 0 100-8 4 4 0 000 8zM20 8v6M23 11h-6"
              stroke={brand.violet}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
      </View>

      <Text variant="heading" align="center" style={styles.title}>
        Invite friends
      </Text>
      <Text
        variant="body"
        color={colors.textSecondary}
        align="center"
        style={styles.subtitle}>
        Share your personal link to invite friends to Pulse
      </Text>

      <View style={styles.spacer} />

      <Button
        title="Share invite link"
        variant="primary"
        size="lg"
        onPress={handleShare}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing['24'],
    alignItems: 'center',
  },
  iconWrap: {
    marginBottom: spacing['24'],
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginBottom: spacing['8'],
  },
  subtitle: {
    paddingHorizontal: spacing['16'],
  },
  spacer: { flex: 1 },
});
