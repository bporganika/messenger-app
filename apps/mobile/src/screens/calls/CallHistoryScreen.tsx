import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../design-system';
import { spacing } from '../../design-system/tokens';
import { Text, EmptyState } from '../../components/ui';

export function CallHistoryScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  // TODO: replace with real data from API
  const calls: never[] = [];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bgPrimary,
          paddingTop: insets.top + spacing['12'],
        },
      ]}>
      <View style={styles.header}>
        <Text variant="displayLg">Calls</Text>
      </View>

      <FlatList
        data={calls}
        keyExtractor={(_, i) => String(i)}
        renderItem={() => null}
        contentContainerStyle={
          calls.length === 0 ? styles.emptyContainer : styles.list
        }
        ListEmptyComponent={
          <EmptyState
            title="No calls yet"
            description="Your call history will appear here"
            icon={
              <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"
                  stroke={colors.textTertiary}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            }
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing['24'],
    marginBottom: spacing['12'],
  },
  list: {
    paddingHorizontal: spacing['16'],
  },
  emptyContainer: {
    flex: 1,
  },
});
