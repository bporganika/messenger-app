import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  LayoutChangeEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../design-system';
import { springs, timing } from '../../design-system/animations';
import { radius, spacing } from '../../design-system/tokens';
import { fontFamily, typography } from '../../design-system/typography';
import { haptics } from '../../design-system/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const INPUT_MIN_HEIGHT = 40;
const INPUT_MAX_HEIGHT = 120;

export interface MessageInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onAttach: () => void;
  onMicPressIn?: () => void;
  onMicPressOut?: () => void;
  placeholder?: string;
  attachOpen?: boolean;
}

function AttachIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5v14M5 12h14"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function MicIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M19 10v2a7 7 0 01-14 0v-2M12 19v3M8 22h8"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SendIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="#FFFFFF">
      <Path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </Svg>
  );
}

export function MessageInput({
  value,
  onChangeText,
  onSend,
  onAttach,
  onMicPressIn,
  onMicPressOut,
  placeholder,
  attachOpen = false,
}: MessageInputProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [inputHeight, setInputHeight] = useState(INPUT_MIN_HEIGHT);

  const hasText = value.trim().length > 0;

  const attachRotation = useSharedValue(0);

  React.useEffect(() => {
    attachRotation.value = withSpring(attachOpen ? 45 : 0, springs.snappy);
  }, [attachOpen, attachRotation]);

  const attachStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${attachRotation.value}deg` }],
  }));

  const sendScale = useSharedValue(hasText ? 1 : 0);

  React.useEffect(() => {
    sendScale.value = withSpring(hasText ? 1 : 0, springs.snappy);
  }, [hasText, sendScale]);

  const sendStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendScale.value }],
    opacity: sendScale.value,
  }));

  const micStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(sendScale.value, [0, 1], [1, 0]) }],
    opacity: interpolate(sendScale.value, [0, 1], [1, 0]),
  }));

  const handleContentSizeChange = useCallback(
    (e: { nativeEvent: { contentSize: { height: number } } }) => {
      const h = e.nativeEvent.contentSize.height;
      setInputHeight(Math.min(Math.max(h, INPUT_MIN_HEIGHT), INPUT_MAX_HEIGHT));
    },
    [],
  );

  const handleSend = useCallback(() => {
    if (!hasText) return;
    haptics.sendMessage();
    onSend();
  }, [hasText, onSend]);

  const handleAttach = useCallback(() => {
    haptics.buttonPress();
    onAttach();
  }, [onAttach]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceElevated,
          borderTopColor: colors.separator,
          paddingBottom: Math.max(insets.bottom, spacing['8']),
        },
      ]}>
      <View style={styles.row}>
        <AnimatedPressable
          onPress={handleAttach}
          style={[styles.sideBtn, attachStyle]}
          hitSlop={8}>
          <AttachIcon color={colors.textSecondary} />
        </AnimatedPressable>

        <View
          style={[
            styles.inputWrap,
            {
              backgroundColor: colors.surfaceDefault,
              borderColor: colors.borderDefault,
            },
          ]}>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.textPlaceholder}
            selectionColor={colors.accentPrimary}
            multiline
            onContentSizeChange={handleContentSizeChange}
            style={[
              styles.input,
              {
                height: inputHeight,
                color: colors.textPrimary,
                fontFamily: fontFamily.regular,
                fontSize: typography.body.fontSize,
              },
            ]}
          />
        </View>

        <View style={styles.actionBtn}>
          <Animated.View style={[styles.actionAbsolute, sendStyle]}>
            <Pressable
              onPress={handleSend}
              style={[
                styles.sendBtn,
                { backgroundColor: colors.accentPrimary },
              ]}>
              <SendIcon />
            </Pressable>
          </Animated.View>

          <Animated.View style={[styles.actionAbsolute, micStyle]}>
            <Pressable
              onPressIn={onMicPressIn}
              onPressOut={onMicPressOut}
              style={styles.sideBtn}>
              <MicIcon color={colors.textSecondary} />
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingTop: spacing['8'],
    paddingHorizontal: spacing['8'],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  sideBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrap: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing['16'],
    marginHorizontal: spacing['4'],
    justifyContent: 'center',
  },
  input: {
    minHeight: INPUT_MIN_HEIGHT,
    maxHeight: INPUT_MAX_HEIGHT,
    paddingTop: 10,
    paddingBottom: 10,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  actionBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionAbsolute: {
    position: 'absolute',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
