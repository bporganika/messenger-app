import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, TextInput, Pressable, FlatList } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../design-system';
import { spacing, radius } from '../../design-system/tokens';
import { fontFamily, typography } from '../../design-system/typography';
import { haptics } from '../../design-system/haptics';
import { Text, BottomSheet, Divider } from '../../components/ui';
import { useTranslation } from 'react-i18next';
import { COUNTRIES } from './countries';
import type { Country } from './countries';

// ─── Props ──────────────────────────────────────────────
export interface CountryPickerProps {
  visible: boolean;
  selectedCode: string;
  onSelect: (country: Country) => void;
  onClose: () => void;
}

// ─── Icons ──────────────────────────────────────────────
function SearchIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Component ──────────────────────────────────────────
export function CountryPicker({
  visible,
  selectedCode,
  onSelect,
  onClose,
}: CountryPickerProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return COUNTRIES;
    const q = search.toLowerCase();
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dial.includes(q) ||
        c.code.toLowerCase().includes(q),
    );
  }, [search]);

  const handleClose = useCallback(() => {
    onClose();
    setSearch('');
  }, [onClose]);

  const handleSelect = useCallback(
    (item: Country) => {
      haptics.buttonPress();
      onSelect(item);
      setSearch('');
    },
    [onSelect],
  );

  const renderItem = useCallback(
    ({ item }: { item: Country }) => (
      <Pressable onPress={() => handleSelect(item)} style={styles.countryRow}>
        <Text variant="body" style={styles.countryFlag}>
          {item.flag}
        </Text>
        <Text variant="body" style={styles.countryName}>
          {item.name}
        </Text>
        <Text variant="bodySm" color={colors.textTertiary}>
          {item.dial}
        </Text>
        {item.code === selectedCode && (
          <View
            style={[styles.checkDot, { backgroundColor: colors.accentPrimary }]}
          />
        )}
      </Pressable>
    ),
    [selectedCode, colors.textTertiary, colors.accentPrimary, handleSelect],
  );

  const keyExtractor = useCallback((item: Country) => item.code, []);

  const ListEmpty = useMemo(
    () => (
      <View style={styles.emptySearch}>
        <Text
          variant="bodySm"
          color={colors.textTertiary}
          align="center">
          {t('phoneAuth.noCountries')}
        </Text>
      </View>
    ),
    [colors.textTertiary, t],
  );

  return (
    <BottomSheet visible={visible} onClose={handleClose} snapPoint={0.7}>
      <Text variant="title" style={styles.sheetTitle}>
        {t('phoneAuth.selectCountry')}
      </Text>

      {/* Search */}
      <View
        style={[
          styles.searchBox,
          {
            backgroundColor: colors.surfaceDefault,
            borderColor: colors.borderDefault,
          },
        ]}>
        <SearchIcon color={colors.textTertiary} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={t('phoneAuth.searchCountry')}
          placeholderTextColor={colors.textPlaceholder}
          autoCapitalize="none"
          autoCorrect={false}
          style={[
            styles.searchInput,
            {
              color: colors.textPrimary,
              fontFamily: fontFamily.regular,
              fontSize: typography.body.fontSize,
            },
          ]}
        />
      </View>

      {/* Country list */}
      <FlatList
        data={filtered}
        keyExtractor={keyExtractor}
        keyboardShouldPersistTaps="handled"
        ItemSeparatorComponent={Divider}
        renderItem={renderItem}
        ListEmptyComponent={ListEmpty}
      />
    </BottomSheet>
  );
}

// ─── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  sheetTitle: {
    marginBottom: spacing['16'],
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.full,
    height: 40,
    paddingHorizontal: spacing['12'],
    gap: spacing['8'],
    marginBottom: spacing['12'],
  },
  searchInput: {
    flex: 1,
    height: '100%',
    padding: 0,
    includeFontPadding: false,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing['12'],
    gap: spacing['12'],
  },
  countryFlag: {
    fontSize: 24,
    width: 32,
  },
  countryName: {
    flex: 1,
  },
  checkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptySearch: {
    paddingVertical: spacing['32'],
  },
});
