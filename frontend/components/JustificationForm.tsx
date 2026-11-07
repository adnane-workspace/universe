import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { colors, radius, spacing } from '@/constants/theme';
import { useAttendance } from '@/context/attendance';
import { composeJustification, justificationKinds, type JustificationKindId } from '@/lib/domain';
import { choisirPiece, type PieceJointe } from '@/lib/piece';

export function JustificationForm({ absenceId, again = false, onSent }: { absenceId: string; again?: boolean; onSent?: () => void }) {
  const { sendJustification } = useAttendance();
  const [kind, setKind] = useState<JustificationKindId | ''>('');
  const [detail, setDetail] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [piece, setPiece] = useState<PieceJointe | null>(null);
  const selected = justificationKinds.find((item) => item.id === kind);
  const count = detail.trim().length;

  async function submit() {
    if (pending) return;
    const composed = composeJustification(kind, detail);
    if (composed.error) {
      setError(composed.error);
      return;
    }
    setPending(true);
    const result = await sendJustification(absenceId, composed.reason, piece);
    setPending(false);
    if (result) {
      setError(result);
      return;
    }
    setSent(true);
  }

  async function importer() {
    const resultat = await choisirPiece();
    if (typeof resultat === 'string') {
      setError(resultat);
      return;
    }
    if (resultat) {
      setPiece(resultat);
      if (error) setError('');
    }
  }

  if (sent) {
    return (
      <View style={styles.form}>
        <Text style={styles.done}>Dossier envoyé. L’enseignant va l’examiner.</Text>
        <AppButton onPress={() => onSent?.()} style={styles.block} title="Fermer" />
      </View>
    );
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
      {selected ? (
        <Text style={[styles.hint, count >= selected.min && styles.hintOk]}>
          {selected.hint} {count} / {selected.min} caractères.
        </Text>
      ) : null}
      <AppInput
        editable={Boolean(selected)}
        error={error}
        label="Description"
        maxLength={400}
        multiline
        onChangeText={(value) => {
          setDetail(value);
          if (error) setError('');
        }}
        placeholder={selected ? 'Décrivez le motif' : 'Choisissez d’abord un type'}
        value={detail}
      />
      <Pressable accessibilityRole="button" onPress={() => void importer()} style={styles.file}>
        <Text style={styles.fileText}>{piece ? piece.name : 'Importer un fichier'}</Text>
      </Pressable>
      {piece ? (
        <Pressable accessibilityRole="button" onPress={() => setPiece(null)}>
          <Text style={styles.remove}>Retirer le fichier</Text>
        </Pressable>
      ) : (
        <Text style={styles.hint}>PDF, JPEG ou PNG, 2 Mo maximum.</Text>
      )}
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
  hintOk: { color: colors.success },
  done: { color: colors.text, fontSize: 15, lineHeight: 22, fontWeight: '600' },
  file: {
    minHeight: 48,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  fileText: { color: colors.primary, fontSize: 15, fontWeight: '700', textAlign: 'center' },
  remove: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  block: { alignSelf: 'stretch' },
});
