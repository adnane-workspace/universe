import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { JustificationForm } from '@/components/JustificationForm';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppInput } from '@/components/ui/AppInput';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { Screen } from '@/components/ui/Screen';
import { colors, spacing } from '@/constants/theme';
import { useAttendance } from '@/context/attendance';
import { useSession } from '@/context/session';
import { absenceById, absenceLabel, absenceText, canJustify, canViewAbsence, formatWhen, sessionById, studentById, type AbsenceStatus } from '@/lib/domain';

const tones: Record<AbsenceStatus, 'warning' | 'neutral' | 'success' | 'danger'> = {
  a_justifier: 'warning',
  envoye: 'neutral',
  justifiee: 'success',
  refusee: 'danger',
};

export default function AbsenceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useSession();
  const { data, decideJustification } = useAttendance();
  const absence = typeof id === 'string' ? absenceById(data, id) : null;
  const allowed = absence && user ? canViewAbsence(data, absence, user) : false;
  const session = absence ? sessionById(data, absence.sessionId) : null;
  const person = absence ? studentById(data, absence.studentId) : null;
  const [actionError, setActionError] = useState('');
  const [comment, setComment] = useState('');

  async function decide(decision: 'justifiee' | 'refusee') {
    if (!absence) return;
    if (decision === 'refusee' && comment.trim().length < 8) {
      setActionError('Expliquez le refus en quelques mots.');
      return;
    }
    setActionError(await decideJustification(absence.id, decision, comment));
  }

  return (
    <Screen
      header={
        <View style={styles.header}>
          <Pressable accessibilityRole="button" hitSlop={8} onPress={() => router.back()} style={styles.backHit}>
            <Text style={styles.back}>‹ Retour</Text>
          </Pressable>
          <AppHeader eyebrow="Absence" title={session?.course ?? 'Fiche'} subtitle={person?.name ?? ''} initials={person?.initials ?? ''} />
        </View>
      }
    >
      {!absence || !allowed || !session || !person ? (
        <AppCard>
          <AppEmptyState title="Absence introuvable" message="Cette fiche n’existe pas ou n’est pas accessible avec ce compte." />
        </AppCard>
      ) : (
        <AppCard style={styles.stack}>
          <AppBadge label={absenceLabel(absence.status, session.date)} tone={absence.status === 'a_justifier' && !canJustify(absence.status, session.date) ? 'danger' : tones[absence.status]} />
          <Detail label="Étudiant" value={person.name} />
          <Detail label="Groupe" value={session.groupId} />
          <Detail label="Quand" value={formatWhen(session.date, session.start, session.end)} />
          <Detail label="Salle" value={session.room} />
          <Text style={styles.text}>{absenceText(absence.status, session.date)}</Text>
          {absence.reason ? <Detail label="Motif" value={absence.reason} /> : null}
          {absence.comment ? <Detail label="Commentaire" value={absence.comment} /> : null}
          {actionError ? <Text style={styles.error}>{actionError}</Text> : null}
          {user?.role === 'etudiant' && canJustify(absence.status, session.date) ? (
            <JustificationForm absenceId={absence.id} again={absence.status === 'refusee'} />
          ) : null}
          {user?.role === 'enseignant' && absence.status === 'envoye' ? (
            <View style={styles.actions}>
              <AppInput
                label="Commentaire"
                maxLength={400}
                multiline
                onChangeText={(value) => {
                  setComment(value);
                  if (actionError) setActionError('');
                }}
                placeholder="Obligatoire seulement en cas de refus"
                value={comment}
              />
              <AppButton onPress={() => void decide('justifiee')} style={styles.block} title="Accepter" variant="success" />
              <AppButton onPress={() => void decide('refusee')} style={styles.block} title="Refuser" variant="secondary" />
            </View>
          ) : null}
        </AppCard>
      )}
    </Screen>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.line}>
      <Text style={styles.label}>{label}</Text>
      <Text selectable style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.sm },
  backHit: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' },
  back: { color: colors.primary, fontSize: 16, fontWeight: '600' },
  stack: { gap: spacing.md },
  line: { gap: 2 },
  label: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  value: { color: colors.text, fontSize: 16, fontWeight: '600' },
  text: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  actions: { gap: spacing.sm },
  block: { alignSelf: 'stretch' },
  error: { color: colors.error, fontSize: 14, lineHeight: 20, fontWeight: '700' },
});
