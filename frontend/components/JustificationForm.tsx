import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { colors, spacing } from '@/constants/theme';
import { useAttendance } from '@/context/attendance';

export function JustificationForm({ absenceId, again = false }: { absenceId: string; again?: boolean }) {
  const { sendJustification } = useAttendance();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function submit() {
    if (pending) return;
    const motif = reason.trim();
    if (motif.length < 8) {
      setError('Décrivez le motif en au moins quelques mots.');
      return;
    }
    setPending(true);
    const result = await sendJustification(absenceId, motif);
    setPending(false);
    if (result) setError(result);
  }

  return (
    <View style={styles.form}>
      <Text style={styles.lead}>
        {again
          ? 'L’enseignant a refusé le justificatif. Vous pouvez en déposer un autre.'
          : 'L’enseignant a confirmé l’absence. Ajoutez votre justificatif.'}
      </Text>
      <AppInput
        error={error}
        label="Motif"
        maxLength={400}
        multiline
        onChangeText={(value) => {
          setReason(value);
          if (error) setError('');
        }}
        placeholder="Ex. rendez-vous médical, avec le justificatif"
        value={reason}
      />
      <AppButton
        disabled={pending}
        onPress={() => void submit()}
        style={styles.block}
        title={pending ? 'Envoi…' : again ? 'Renvoyer le justificatif' : 'Déposer le justificatif'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.sm },
  lead: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
  block: { alignSelf: 'stretch' },
});
