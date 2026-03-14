import React from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../design-system';
import { spacing } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text, Avatar } from '../../components/ui';
import { MessageInput } from '../../components/chat';
import type { ChatScreenProps } from '../../navigation/types';

export function ChatScreen({ navigation, route }: ChatScreenProps<'Chat'>) {
  const { name, avatarUrl } = route.params;
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [messageText, setMessageText] = React.useState('');

  // TODO: replace with real messages from API/store
  const messages: never[] = [];

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + spacing['4'],
            backgroundColor: colors.bgPrimary,
            borderBottomColor: colors.separator,
          },
        ]}>
        <Pressable
          onPress={() => {
            haptics.buttonPress();
            navigation.goBack();
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
            // TODO: navigate to UserProfileScreen
          }}>
          <Avatar uri={avatarUrl} name={name} size="sm" status="online" />
          <View style={styles.headerText}>
            <Text variant="title" numberOfLines={1}>
              {name}
            </Text>
            <Text variant="caption" color={colors.accentSuccess}>
              Online
            </Text>
          </View>
        </Pressable>

        <View style={styles.headerActions}>
          <Pressable
            onPress={() => {
              haptics.buttonPress();
              // TODO: initiate voice call
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
              // TODO: initiate video call
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

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={(_, i) => String(i)}
        renderItem={() => null}
        inverted
        contentContainerStyle={
          messages.length === 0 ? styles.emptyList : styles.list
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text
              variant="bodySm"
              color={colors.textTertiary}
              align="center">
              No messages yet.{'\n'}Say hello!
            </Text>
          </View>
        }
      />

      {/* Input */}
      <MessageInput
        value={messageText}
        onChangeText={setMessageText}
        onSend={() => {
          // TODO: emit message:send via socket
          setMessageText('');
        }}
        onAttach={() => {
          // TODO: open attachment picker
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  list: {
    paddingHorizontal: spacing['12'],
    paddingVertical: spacing['8'],
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyWrap: {
    transform: [{ scaleY: -1 }],
    padding: spacing['32'],
  },
});
