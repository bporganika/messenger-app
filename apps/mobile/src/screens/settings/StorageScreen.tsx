import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path, Rect } from 'react-native-svg';
import { useTheme } from '../../design-system';
import { spacing, radius } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text, Button, Divider } from '../../components/ui';

interface StorageItem {
  label: string;
  size: string;
  bytes: number;
  color: string;
}

export function StorageScreen() {
  const { colors } = useTheme();
  const [clearing, setClearing] = useState(false);

  const items: StorageItem[] = [
    { label: 'Images', size: '24.3 MB', bytes: 24300000, color: colors.accentPrimary },
    { label: 'Videos', size: '48.1 MB', bytes: 48100000, color: colors.accentSecondary },
    { label: 'Voice messages', size: '8.7 MB', bytes: 8700000, color: colors.accentSuccess },
    { label: 'Documents', size: '5.2 MB', bytes: 5200000, color: colors.accentWarning },
  ];

  const totalBytes = items.reduce((sum, i) => sum + i.bytes, 0);
  const totalSize = `${(totalBytes / 1_000_000).toFixed(1)} MB`;

  const handleClear = useCallback(() => {
    haptics.buttonPress();
    setClearing(true);
    // TODO: clear cache, recalculate sizes
    setTimeout(() => {
      setClearing(false);
      haptics.success();
    }, 1200);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      {/* Total */}
      <Animated.View entering={FadeInUp.springify()} style={styles.totalWrap}>
        <View style={[styles.totalCircle, { backgroundColor: colors.surfaceDefault }]}>
          <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
            <Path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" stroke={colors.accentPrimary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </View>
        <Text variant="displayLg">{totalSize}</Text>
        <Text variant="bodySm" color={colors.textSecondary}>Total cache used</Text>
      </Animated.View>

      {/* Breakdown */}
      <Animated.View entering={FadeInUp.springify().delay(80)}>
        <Text variant="caption" color={colors.textTertiary} style={styles.sectionLabel}>
          BREAKDOWN
        </Text>
        <View style={[styles.section, { backgroundColor: colors.surfaceDefault, borderColor: colors.borderDefault }]}>
          {items.map((item, i) => (
            <React.Fragment key={item.label}>
              {i > 0 && <Divider inset={16} />}
              <View style={styles.row}>
                <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                <Text variant="body" style={styles.rowLabel}>{item.label}</Text>
                <Text variant="bodySm" color={colors.textSecondary}>{item.size}</Text>
              </View>
              <View style={styles.barWrap}>
                <StorageBar ratio={item.bytes / totalBytes} color={item.color} />
              </View>
            </React.Fragment>
          ))}
        </View>
      </Animated.View>

      {/* Clear button */}
      <Animated.View entering={FadeInUp.springify().delay(160)}>
        <Button
          title={clearing ? 'Clearing...' : 'Clear all cache'}
          variant="secondary"
          size="lg"
          loading={clearing}
          onPress={handleClear}
          style={styles.clearBtn}
        />
      </Animated.View>

      <Animated.View entering={FadeInUp.springify().delay(200)}>
        <Text variant="caption" color={colors.textTertiary} style={styles.hint}>
          Clearing cache will remove locally stored media.
          Your messages and conversations will not be affected.
        </Text>
      </Animated.View>
    </View>
  );
}

function StorageBar({ ratio, color }: { ratio: number; color: string }) {
  const { colors } = useTheme();
  const width = useSharedValue(0);

  React.useEffect(() => {
    width.value = withTiming(ratio * 100, { duration: 800 });
  }, [ratio, width]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
    backgroundColor: color,
  }));

  return (
    <View style={[styles.barTrack, { backgroundColor: colors.borderSubtle }]}>
      <Animated.View style={[styles.barFill, barStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: spacing['8'] },
  totalWrap: {
    alignItems: 'center',
    paddingVertical: spacing['24'],
    gap: spacing['4'],
  },
  totalCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['8'],
  },
  sectionLabel: {
    marginHorizontal: spacing['24'],
    marginTop: spacing['8'],
    marginBottom: spacing['8'],
    letterSpacing: 0.8,
  },
  section: {
    marginHorizontal: spacing['16'],
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['16'],
    paddingTop: spacing['12'],
    paddingBottom: spacing['4'],
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing['12'],
  },
  rowLabel: { flex: 1 },
  barWrap: {
    paddingHorizontal: spacing['16'],
    paddingBottom: spacing['12'],
  },
  barTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: 4,
    borderRadius: 2,
  },
  clearBtn: {
    marginHorizontal: spacing['16'],
    marginTop: spacing['24'],
  },
  hint: {
    marginHorizontal: spacing['24'],
    marginTop: spacing['12'],
    lineHeight: 20,
  },
});
