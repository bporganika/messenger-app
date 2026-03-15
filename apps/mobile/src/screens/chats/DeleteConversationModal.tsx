import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../design-system';
import { spacing } from '../../design-system/tokens';
import { useTranslation } from 'react-i18next';
import { Text, Modal, Button } from '../../components/ui';
import type { DeleteTarget } from './types';

export interface DeleteConversationModalProps {
  target: DeleteTarget | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConversationModal({
  target,
  onClose,
  onConfirm,
}: DeleteConversationModalProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Modal visible={!!target} onClose={onClose}>
      <Text variant="title" style={styles.modalTitle}>
        {t('chat.deleteConversation')}
      </Text>
      <Text variant="bodySm" color={colors.textSecondary}>
        {target
          ? t('chat.deleteConversationMsg', { name: target.name })
          : ''}
      </Text>
      <View style={styles.modalActions}>
        <Button
          title={t('common.cancel')}
          variant="secondary"
          size="md"
          onPress={onClose}
          style={styles.modalBtn}
        />
        <Button
          title={t('common.delete')}
          variant="danger"
          size="md"
          onPress={onConfirm}
          style={styles.modalBtn}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalTitle: {
    marginBottom: spacing['8'],
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing['8'],
    marginTop: spacing['16'],
  },
  modalBtn: {
    flex: 1,
  },
});
