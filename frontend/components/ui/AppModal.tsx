import { Modal, Pressable, StyleSheet, Text } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { colors, radius, shadows, spacing, type } from '@/constants/theme';

export function AppModal({
  visible,
  title,
  message,
  onClose,
}: {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}) {
  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <Pressable accessibilityViewIsModal style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => undefined}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <AppButton title="Fermer" variant="secondary" onPress={onClose} style={styles.action} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderCurve: 'continuous',
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.raised,
  },
  title: type.section,
  message: type.secondary,
  action: { alignSelf: 'stretch' },
});
