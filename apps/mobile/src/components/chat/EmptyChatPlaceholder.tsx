import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../design-system';
import { spacing } from '../../design-system/tokens';
import { useTranslation } from 'react-i18next';
import { Text } from '../ui';

export function EmptyChatPlaceholder() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.emptyWrap}>
      <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
        <Path
          d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
          stroke={colors.textTertiary}
          strokeWidth={1}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      <Text
        variant="bodySm"
        color={colors.textTertiary}
        align="center"
        style={styles.emptyText}>
        {t('chat.noMessages')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyWrap: {
    transform: [{ scaleY: -1 }],
    alignItems: 'center',
    padding: spacing['32'],
    gap: spacing['12'],
  },
  emptyText: {
    marginTop: spacing['4'],
  },
});
