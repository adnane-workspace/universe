import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, spacing } from '@/constants/theme';
import { ouvrirPiece } from '@/lib/piece';

export function PieceLink({ absenceId, name }: { absenceId: string; name: string }) {
  const [error, setError] = useState('');

  async function open() {
    try {
      await ouvrirPiece(absenceId, name);
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Ouverture impossible.');
    }
  }

  return (
    <>
      <Pressable accessibilityRole="button" onPress={() => void open()}>
        <Text style={styles.link}>{name}</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </>
  );
}

const styles = StyleSheet.create({
  link: { color: colors.primary, fontSize: 15, lineHeight: 20, fontWeight: '700' },
  error: { color: colors.error, fontSize: 13, lineHeight: 18, marginTop: spacing.xs },
});
