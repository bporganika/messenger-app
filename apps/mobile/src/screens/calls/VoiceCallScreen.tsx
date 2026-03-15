import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../design-system';
import { callRingPulse } from '../../design-system/animations';
import { spacing } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text } from '../../components/ui';
import { PulsingRings, CallControls, CallTimer } from '../../components/call';
import { useCallStore } from '../../stores/callStore';
import * as CallKeepService from '../../services/callkeep';
import type { RootScreenProps } from '../../navigation/types';

// ─── Icon SVG paths ─────────────────────────────────────
const ICON_BACK = 'M15 18l-6-6 6-6';

// ─── Screen ─────────────────────────────────────────────
export function VoiceCallScreen({
  navigation,
  route,
}: RootScreenProps<'VoiceCall'>) {
  const { callId, userId, name, avatarUrl } = route.params;
  const { t } = useTranslation();
  const { colors, brand } = useTheme();
  const insets = useSafeAreaInsets();

  const status = useCallStore((s) => s.status);
  const isMuted = useCallStore((s) => s.isMuted);
  const isSpeaker = useCallStore((s) => s.isSpeaker);
  const connectedAt = useCallStore((s) => s.connectedAt);
  const initCall = useCallStore((s) => s.initCall);
  const toggleMute = useCallStore((s) => s.toggleMute);
  const toggleSpeaker = useCallStore((s) => s.toggleSpeaker);
  const endCallAction = useCallStore((s) => s.setEnded);
  const reset = useCallStore((s) => s.reset);

  // ── Initialize call ───────────────────────────────────
  useEffect(() => {
    initCall({ callId, userId, name, avatarUrl, type: 'voice' });
    CallKeepService.startOutgoingCall(callId, name, false);

    return () => {
      if (useCallStore.getState().status !== 'ended') {
        CallKeepService.endCall(callId);
      }
      reset();
    };
  }, [callId, userId, name, avatarUrl, initCall, reset]);

  // ── CallKeep: native end call button (iOS/Android) ────
  useEffect(() => {
    const unsub = CallKeepService.onEndCall((endedId) => {
      if (endedId === callId) {
        endCallAction();
        navigation.goBack();
      }
    });
    return unsub;
  }, [callId, endCallAction, navigation]);

  // ── CallKeep: native mute toggle ──────────────────────
  useEffect(() => {
    const unsub = CallKeepService.onMuteToggle((muteId, muted) => {
      if (muteId === callId && useCallStore.getState().isMuted !== muted) {
        toggleMute();
      }
    });
    return unsub;
  }, [callId, toggleMute]);

  // ── Sync mute state -> CallKeep ───────────────────────
  useEffect(() => {
    CallKeepService.setMuted(callId, isMuted);
  }, [callId, isMuted]);

  // ── Handlers ──────────────────────────────────────────
  const handleEndCall = useCallback(() => {
    haptics.error();
    CallKeepService.endCall(callId);
    endCallAction();
    navigation.goBack();
  }, [callId, endCallAction, navigation]);

  const handleSwitchToVideo = useCallback(() => {
    haptics.buttonPress();
    navigation.replace('VideoCall', { callId, userId, name, avatarUrl });
  }, [callId, userId, name, avatarUrl, navigation]);

  // ── Derived values ────────────────────────────────────
  const isConnected = status === 'connected';
  const ringColor = isConnected ? colors.accentSuccess : brand.violet;
  const ringDuration = isConnected ? 3500 : callRingPulse.duration;

  const statusLabel =
    status === 'ringing'
      ? t('voiceCall.calling')
      : status === 'connecting'
        ? t('voiceCall.connecting')
        : status === 'ended'
          ? t('voiceCall.ended')
          : null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bgPrimary,
          paddingTop: insets.top + spacing['24'],
          paddingBottom: insets.bottom + spacing['32'],
        },
      ]}>
      {/* Back / minimize */}
      <Pressable
        onPress={handleEndCall}
        hitSlop={12}
        style={[styles.backBtn, { top: insets.top + spacing['12'] }]}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path
            d={ICON_BACK}
            stroke={colors.textPrimary}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Pressable>

      {/* Caller name */}
      <Animated.View entering={FadeInUp.springify()}>
        <Text variant="title" align="center">
          {name}
        </Text>
      </Animated.View>

      {/* Avatar + pulsing rings */}
      <PulsingRings
        ringColor={ringColor}
        ringDuration={ringDuration}
        avatarUri={avatarUrl}
        name={name}
      />

      {/* Status text / timer */}
      <View style={styles.statusWrap}>
        {statusLabel ? (
          <Text variant="body" color={colors.textSecondary} align="center">
            {statusLabel}
          </Text>
        ) : (
          <CallTimer connectedAt={connectedAt} />
        )}
      </View>

      <View style={styles.spacer} />

      {/* Control buttons */}
      <CallControls
        isMuted={isMuted}
        isSpeaker={isSpeaker}
        onToggleMute={toggleMute}
        onToggleSpeaker={toggleSpeaker}
        onSwitchToVideo={handleSwitchToVideo}
        onEndCall={handleEndCall}
      />
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing['24'],
  },
  backBtn: {
    position: 'absolute',
    left: spacing['16'],
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  statusWrap: {
    height: 24,
    justifyContent: 'center',
  },
  spacer: { flex: 1 },
});
