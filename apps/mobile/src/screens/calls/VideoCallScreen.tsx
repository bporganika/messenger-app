import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../design-system';
import { spacing } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text } from '../../components/ui';
import type { RootScreenProps } from '../../navigation/types';

export function VideoCallScreen({
  navigation,
  route,
}: RootScreenProps<'VideoCall'>) {
  const { name } = route.params;
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Top overlay */}
      <View style={[styles.topBar, { paddingTop: insets.top + spacing['8'] }]}>
        <Pressable
          onPress={() => {
            haptics.buttonPress();
            navigation.goBack();
          }}
          hitSlop={12}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M15 18l-6-6 6-6"
              stroke="#FFFFFF"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Pressable>
        <View style={styles.topInfo}>
          <Text variant="title" color="#FFFFFF">
            {name}
          </Text>
          <Text variant="mono" color="rgba(255,255,255,0.7)">
            00:00
          </Text>
        </View>
      </View>

      {/* Placeholder for remote video */}
      <View style={styles.remoteVideo}>
        <Text variant="body" color="rgba(255,255,255,0.5)" align="center">
          {t('videoCall.video')}
        </Text>
      </View>

      {/* Local PiP */}
      <View
        style={[styles.localPip, { top: insets.top + 80 }]}>
        <Text variant="caption" color="rgba(255,255,255,0.7)">
          {t('videoCall.you')}
        </Text>
      </View>

      {/* Controls */}
      <View
        style={[styles.controls, { paddingBottom: insets.bottom + spacing['24'] }]}>
        {([
          { key: 'mute', label: t('videoCall.mute') },
          { key: 'flip', label: t('videoCall.flip') },
          { key: 'video', label: t('videoCall.video') },
        ] as const).map((item) => (
          <Pressable
            key={item.key}
            onPress={() => haptics.buttonPress()}
            style={styles.ctrlBtn}>
            <View
              style={[
                styles.ctrlCircle,
                { backgroundColor: 'rgba(255,255,255,0.15)' },
              ]}>
              <Text variant="caption" color="#FFFFFF">
                {item.label[0]}
              </Text>
            </View>
            <Text variant="caption" color="rgba(255,255,255,0.8)">
              {item.label}
            </Text>
          </Pressable>
        ))}
        <Pressable
          onPress={() => {
            haptics.error();
            navigation.goBack();
          }}
          style={styles.ctrlBtn}>
          <View style={[styles.ctrlCircle, { backgroundColor: colors.accentError }]}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"
                stroke="#FFFFFF"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <Text variant="caption" color="rgba(255,255,255,0.8)">
            {t('videoCall.end')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    start: 0,
    end: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['16'],
    gap: spacing['12'],
  },
  topInfo: {
    flex: 1,
  },
  remoteVideo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  localPip: {
    position: 'absolute',
    end: spacing['16'],
    width: 100,
    height: 140,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing['24'],
    paddingTop: spacing['16'],
  },
  ctrlBtn: {
    alignItems: 'center',
    gap: spacing['6'],
  },
  ctrlCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
