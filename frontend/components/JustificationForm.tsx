import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { colors, radius, spacing } from '@/constants/theme';
import { useAttendance } from '@/context/attendance';
import { composeJustification, justificationKinds, type JustificationKindId } from '@/lib/domain';

export function JustificationForm({ absenceId, again = false }: { absenceId: string; again?: boolean }) {
  const { sendJustification } = useAttendance();
  const [kind, setKind] = useState<JustificationKindId | ''>('');
  const [detail, setDetail] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const selected = justificationKinds.find((item) => item.id === kind);

  async function submit() {
    if (pending) return;
    const composed = composeJustification(kind, detail);
    if (composed.error) {
      setError(composed.error);
      return;
    }
    setPending(true);
    const result = await sendJustification(absenceId, composed.reason);
    setPending(false);
    if (result) setError(result);
  }

  return (
    <View style={styles.form}>
      <Text style={styles.lead}>
        {again
          ? 'Le dossier a été refusé. Choisissez à nouveau un type, puis décrivez le motif.'
          : 'Choisissez le type de motif, puis décrivez-le. Le dossier part en examen.'}
      </Text>
      <View style={styles.kinds}>
        {justificationKinds.map((item) => {
          const active = item.id === kind;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              key={item.id}
              onPress={() => {
                setKind(item.id);
                if (error) setError('');
              }}
              style={[styles.kind, active && styles.kindOn]}
            >
              <Text style={[styles.kindText, active && styles.kindTextOn]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {selected ? <Text style={styles.hint}>{selected.hint} Minimum {selected.min} caractères.</Text> : null}
      <AppInput
        error={error}
        label="Description"
        maxLength={400}
        multiline
        onChangeText={(value) => {
          setDetail(value);
          if (error) setError('');
        }}
        placeholder={selected ? selected.hint : 'Choisissez d’abord un type'}
        value={detail}
      />
      <AppButton
        disabled={pending}
        onPress={() => void submit()}
        style={styles.block}
        title={pending ? 'Envoi…' : again ? 'Renvoyer le dossier' : 'Déposer le dossier'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.sm },
  lead: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
  kinds: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  kind: {
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
  },
  kindOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  kindText: { color: colors.text, fontSize: 13, fontWeight: '700' },
  kindTextOn: { color: colors.onPrimary },
  hint: { color: colors.textSecondary, fontSize: 12, lineHeight: 16 },
  block: { alignSelf: 'stretch' },
});
