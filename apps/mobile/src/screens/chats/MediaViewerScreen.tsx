import React from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Svg, { Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { haptics } from '../../design-system/haptics';
import { spacing } from '../../design-system/tokens';
import { Text } from '../../components/ui';
import type { ChatScreenProps } from '../../navigation/types';

const { width, height } = Dimensions.get('window');

export function MediaViewerScreen({
  navigation,
  route,
}: ChatScreenProps<'MediaViewer'>) {
  const { uri, type } = route.params;
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Close */}
      <Pressable
        onPress={() => {
          haptics.buttonPress();
          navigation.goBack();
        }}
        hitSlop={12}
        style={[styles.closeBtn, { top: insets.top + spacing['8'] }]}>
        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
          <Path
            d="M18 6L6 18M6 6l12 12"
            stroke="#FFFFFF"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Pressable>

      {type === 'image' ? (
        <FastImage
          source={{ uri }}
          style={styles.image}
          resizeMode={FastImage.resizeMode.contain}
        />
      ) : (
        <View style={styles.videoPlaceholder}>
          <Text variant="body" color="#FFFFFF" align="center">
            {t('videoCall.video')}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    position: 'absolute',
    start: spacing['16'],
    zIndex: 10,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width,
    height,
  },
  videoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
