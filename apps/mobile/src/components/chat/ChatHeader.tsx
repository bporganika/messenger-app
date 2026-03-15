import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../design-system';
import { spacing } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { useTranslation } from 'react-i18next';
import { Text, Avatar } from '../ui';

export interface ChatHeaderProps {
  name: string;
  avatarUrl?: string;
  isTyping: boolean;
  paddingTop: number;
  onBack: () => void;
  onProfilePress: () => void;
  onVoiceCall: () => void;
  onVideoCall: () => void;
}

export function ChatHeader({
  name,
  avatarUrl,
  isTyping,
  paddingTop,
  onBack,
  onProfilePress,
  onVoiceCall,
  onVideoCall,
}: ChatHeaderProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop,
          backgroundColor: colors.bgPrimary,
          borderBottomColor: colors.separator,
        },
      ]}>
      <Pressable
        onPress={() => {
          haptics.buttonPress();
          onBack();
        }}
        hitSlop={12}
        style={styles.backBtn}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path
            d="M15 18l-6-6 6-6"
            stroke={colors.textPrimary}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Pressable>

      <Pressable
        style={styles.headerInfo}
        onPress={() => {
          haptics.buttonPress();
          onProfilePress();
        }}>
        <Avatar uri={avatarUrl} name={name} size="sm" status="online" />
        <View style={styles.headerText}>
          <Text variant="title" numberOfLines={1}>
            {name}
          </Text>
          {isTyping ? (
            <Text variant="caption" color={colors.accentPrimary}>
              {t('chat.typing')}
            </Text>
          ) : (
            <Text variant="caption" color={colors.accentSuccess}>
              {t('chat.online')}
            </Text>
          )}
        </View>
      </Pressable>

      <View style={styles.headerActions}>
        <Pressable
          onPress={() => {
            haptics.buttonPress();
            onVoiceCall();
          }}
          hitSlop={8}
          style={styles.headerActionBtn}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"
              stroke={colors.textPrimary}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Pressable>
        <Pressable
          onPress={() => {
            haptics.buttonPress();
            onVideoCall();
          }}
          hitSlop={8}
          style={styles.headerActionBtn}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M23 7l-7 5 7 5V7zM14 5H3a2 2 0 00-2 2v10a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2z"
              stroke={colors.textPrimary}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing['8'],
    paddingHorizontal: spacing['8'],
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['8'],
    marginLeft: spacing['4'],
  },
  headerText: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing['4'],
  },
  headerActionBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
