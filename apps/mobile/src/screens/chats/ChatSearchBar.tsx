import React, { useState } from 'react';
import { StyleSheet, Pressable, TextInput } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../design-system';
import { spacing, radius } from '../../design-system/tokens';
import { fontFamily, typography } from '../../design-system/typography';
import { haptics } from '../../design-system/haptics';
import { useTranslation } from 'react-i18next';

export interface ChatSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

export function ChatSearchBar({ value, onChangeText }: ChatSearchBarProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [focused, setFocused] = useState(false);

  return (
    <Animated.View
      entering={FadeInUp.delay(80).springify()}
      style={[
        styles.searchBar,
        {
          backgroundColor: colors.surfaceDefault,
          borderColor: focused
            ? colors.borderFocus
            : colors.borderDefault,
        },
      ]}>
      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Path
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          stroke={colors.textTertiary}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={t('chat.search')}
        placeholderTextColor={colors.textPlaceholder}
        selectionColor={colors.accentPrimary}
        returnKeyType="search"
        autoCorrect={false}
        style={[
          styles.searchInput,
          {
            color: colors.textPrimary,
            fontFamily: fontFamily.regular,
            fontSize: typography.bodySm.fontSize,
          },
        ]}
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => {
            haptics.buttonPress();
            onChangeText('');
          }}
          hitSlop={8}>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path
              d="M18 6L6 18M6 6l12 12"
              stroke={colors.textTertiary}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </Svg>
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing['16'],
    marginBottom: spacing['8'],
    paddingHorizontal: spacing['12'],
    height: 40,
    borderRadius: radius.full,
    borderWidth: 1,
    gap: spacing['8'],
  },
  searchInput: {
    flex: 1,
    height: '100%',
    padding: 0,
    includeFontPadding: false,
  },
});
