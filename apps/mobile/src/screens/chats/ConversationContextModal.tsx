import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing } from '../../design-system/tokens';
import { useTranslation } from 'react-i18next';
import { Text, Modal, Button } from '../../components/ui';
import type { Conversation } from './types';

export interface ConversationContextModalProps {
  target: Conversation | null;
  onClose: () => void;
  onArchive: (id: string) => void;
  onDelete: (id: string, name: string) => void;
}

export function ConversationContextModal({
  target,
  onClose,
  onArchive,
  onDelete,
}: ConversationContextModalProps) {
  const { t } = useTranslation();

  return (
    <Modal visible={!!target} onClose={onClose}>
      <Text variant="title" style={styles.modalTitle}>
        {target?.name}
      </Text>
      <View style={styles.modalActions}>
        <Button
          title={t('chat.archive')}
          variant="secondary"
          size="md"
          onPress={() => {
            if (target) onArchive(target.id);
            onClose();
          }}
          style={styles.modalBtn}
        />
        <Button
          title={t('common.delete')}
          variant="danger"
          size="md"
          onPress={() => {
            if (target) onDelete(target.id, target.name);
            onClose();
          }}
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
