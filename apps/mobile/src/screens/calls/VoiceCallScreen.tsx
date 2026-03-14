import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  Easing,
  FadeInUp,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../design-system';
import { callRingPulse, springs } from '../../design-system/animations';
import { spacing } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text, Avatar } from '../../components/ui';
import { useCallStore } from '../../stores/callStore';
import * as CallKeepService from '../../services/callkeep';
import type { RootScreenProps } from '../../navigation/types';

// ─── Icon SVG paths ──────────────────────────────────────
const ICON = {
  mic: 'M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8',
  micOff:
    'M1 1l22 22M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6M17 16.95A7 7 0 015 12v-2M19 10v2c0 .3-.01.6-.04.89M12 19v4M8 23h8',
  speaker:
    'M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07',
  speakerOff: 'M11 5L6 9H2v6h4l5 4V5z',
  video:
    'M23 7l-7 5 7 5V7zM14 5H3a2 2 0 00-2 2v10a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2z',
  end: 'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z',
  back: 'M15 18l-6-6 6-6',
};

const RING_SIZE = 160;

// ─── Pulsing Ring ────────────────────────────────────────
function PulsingRing({
  delay,
  color,
  duration,
}: {
  delay: number;
  color: string;
  duration: number;
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(callRingPulse.opacityFrom);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(callRingPulse.scaleTo, {
            duration,
            easing: Easing.out(Easing.quad),
          }),
          withTiming(1, { duration: 0 }),
        ),
        -1,
      ),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0, { duration, easing: Easing.out(Easing.quad) }),
          withTiming(callRingPulse.opacityFrom, { duration: 0 }),
        ),
        -1,
      ),
    );
  }, [delay, duration, scale, opacity]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.ring,
        {
          width: RING_SIZE,
          height: RING_SIZE,
          borderRadius: RING_SIZE / 2,
          borderColor: color,
        },
        animStyle,
      ]}
    />
  );
}

// ─── Call Timer ──────────────────────────────────────────
function CallTimer({ connectedAt }: { connectedAt: number | null }) {
  const { colors } = useTheme();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!connectedAt) return;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - connectedAt) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [connectedAt]);

  if (!connectedAt) return null;

  const mm = Math.floor(elapsed / 60)
    .toString()
    .padStart(2, '0');
  const ss = (elapsed % 60).toString().padStart(2, '0');

  return (
    <Text variant="mono" color={colors.accentSuccess} align="center">
      {mm}:{ss}
    </Text>
  );
}

// ─── Control Button ──────────────────────────────────────
function ControlButton({
  iconPath,
  label,
  bg,
  iconColor,
  onPress,
}: {
  iconPath: string;
  label: string;
  bg: string;
  iconColor: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.88, springs.snappy);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, springs.snappy);
      }}
      onPress={() => {
        haptics.buttonPress();
        onPress();
      }}
      style={styles.controlBtn}>
      <Animated.View
        style={[styles.controlCircle, { backgroundColor: bg }, animStyle]}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path
            d={iconPath}
            stroke={iconColor}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Animated.View>
      <Text variant="caption" color={colors.textSecondary}>
        {label}
      </Text>
    </Pressable>
  );
}

// ─── Screen ──────────────────────────────────────────────
export function VoiceCallScreen({
  navigation,
  route,
}: RootScreenProps<'VoiceCall'>) {
  const { callId, userId, name, avatarUrl } = route.params;
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

  // ── Initialize call ──────────────────────────────────────
  useEffect(() => {
    initCall({ callId, userId, name, avatarUrl, type: 'voice' });
    CallKeepService.startOutgoingCall(callId, name, false);

    // TODO: emit socket 'call:initiate' to server
    // TODO: set up WebRTC peer connection via services/webrtc.ts

    // Simulated flow (replace with real socket events)
    const t1 = setTimeout(() => {
      useCallStore.getState().setConnecting();
      CallKeepService.reportConnecting(callId);
    }, 2000);

    const t2 = setTimeout(() => {
      useCallStore.getState().setConnected();
      CallKeepService.reportConnected(callId);
      haptics.success();
    }, 3500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (useCallStore.getState().status !== 'ended') {
        CallKeepService.endCall(callId);
      }
      reset();
    };
  }, [callId, userId, name, avatarUrl, initCall, reset]);

  // ── CallKeep: native end call button (iOS/Android) ───────
  useEffect(() => {
    const unsub = CallKeepService.onEndCall((endedId) => {
      if (endedId === callId) {
        endCallAction();
        navigation.goBack();
      }
    });
    return unsub;
  }, [callId, endCallAction, navigation]);

  // ── CallKeep: native mute toggle ─────────────────────────
  useEffect(() => {
    const unsub = CallKeepService.onMuteToggle((muteId, muted) => {
      if (muteId === callId && useCallStore.getState().isMuted !== muted) {
        toggleMute();
      }
    });
    return unsub;
  }, [callId, toggleMute]);

  // ── Sync mute state → CallKeep ───────────────────────────
  useEffect(() => {
    CallKeepService.setMuted(callId, isMuted);
  }, [callId, isMuted]);

  // ── Handlers ─────────────────────────────────────────────
  const handleEndCall = useCallback(() => {
    haptics.error();
    CallKeepService.endCall(callId);
    endCallAction();
    // TODO: emit socket 'call:end'
    navigation.goBack();
  }, [callId, endCallAction, navigation]);

  const handleSwitchToVideo = useCallback(() => {
    haptics.buttonPress();
    // TODO: enable camera track via WebRTC
    navigation.replace('VideoCall', { callId, userId, name, avatarUrl });
  }, [callId, userId, name, avatarUrl, navigation]);

  // ── Derived values ───────────────────────────────────────
  const isConnected = status === 'connected';
  const ringColor = isConnected ? colors.accentSuccess : brand.violet;
  const ringDuration = isConnected ? 3500 : callRingPulse.duration;

  const statusLabel =
    status === 'ringing'
      ? 'Calling...'
      : status === 'connecting'
        ? 'Connecting...'
        : status === 'ended'
          ? 'Call ended'
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
            d={ICON.back}
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
      <View style={styles.avatarArea}>
        {Array.from({ length: callRingPulse.ringCount }).map((_, i) => (
          <PulsingRing
            key={i}
            delay={i * callRingPulse.stagger}
            color={ringColor}
            duration={ringDuration}
          />
        ))}
        <Avatar uri={avatarUrl} name={name} size="2xl" />
      </View>

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
      <Animated.View
        entering={FadeInUp.springify().delay(200)}
        style={styles.controls}>
        <ControlButton
          iconPath={isMuted ? ICON.micOff : ICON.mic}
          label="Mute"
          bg={isMuted ? colors.accentPrimary : colors.surfaceDefault}
          iconColor={isMuted ? '#FFFFFF' : colors.textPrimary}
          onPress={toggleMute}
        />
        <ControlButton
          iconPath={isSpeaker ? ICON.speaker : ICON.speakerOff}
          label="Speaker"
          bg={isSpeaker ? colors.accentPrimary : colors.surfaceDefault}
          iconColor={isSpeaker ? '#FFFFFF' : colors.textPrimary}
          onPress={toggleSpeaker}
        />
        <ControlButton
          iconPath={ICON.video}
          label="Video"
          bg={colors.surfaceDefault}
          iconColor={colors.textPrimary}
          onPress={handleSwitchToVideo}
        />
        <ControlButton
          iconPath={ICON.end}
          label="End"
          bg={colors.accentError}
          iconColor="#FFFFFF"
          onPress={handleEndCall}
        />
      </Animated.View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────
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
  avatarArea: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing['40'],
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
  },
  statusWrap: {
    height: 24,
    justifyContent: 'center',
  },
  spacer: { flex: 1 },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing['24'],
  },
  controlBtn: {
    alignItems: 'center',
    width: 64,
  },
  controlCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['6'],
  },
});
