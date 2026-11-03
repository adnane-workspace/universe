import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SectionTitle } from '@/components/AppHeader';
import { JustificationForm } from '@/components/JustificationForm';
import { RoleHeader } from '@/components/RoleHeader';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppCard } from '@/components/ui/AppCard';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { Screen } from '@/components/ui/Screen';
import { colors, spacing } from '@/constants/theme';
import { useAttendance } from '@/context/attendance';
import { useSession } from '@/context/session';
import { dateParts, formatWhen, statusLabel, statusText, studentAbsences, type AbsenceStatus } from '@/lib/domain';

const tones: Record<AbsenceStatus, 'warning' | 'neutral' | 'success' | 'danger'> = {
  a_justifier: 'warning',
  envoye: 'neutral',
  justifiee: 'success',
  refusee: 'danger',
};

export default function StudentAbsencesScreen() {
  const { user } = useSession();
  const { data } = useAttendance();
  const absences = studentAbsences(data, user?.studentId ?? '');

  return (
    <Screen inTabs header={<RoleHeader eyebrow="Mes absences" subtitle="Détail et justificatifs" />}>
      <View style={styles.stack}>
        <SectionTitle>Historique</SectionTitle>
        {absences.length === 0 ? (
          <AppCard>
            <AppEmptyState title="Aucune absence" message="Votre présence est complète sur les séances déjà appelées." />
          </AppCard>
        ) : (
          absences.map((item) => {
            const session = data.sessions.find((entry) => entry.id === item.sessionId);
            const parts = dateParts(session?.date ?? '2026-01-01');
            return (
              <AppCard key={item.id} style={styles.stack}>
                <Link href={{ pathname: '/absence/[id]', params: { id: item.id } }} asChild>
                  <Pressable accessibilityHint="Ouvre la fiche de l’absence" style={styles.cardHeader}>
                    <View style={[styles.date, item.status === 'justifiee' && styles.dateOk]}>
                      <Text style={[styles.month, item.status === 'justifiee' && styles.monthOk]}>{parts.month}</Text>
                      <Text style={styles.day}>{parts.day}</Text>
                    </View>
                    <View style={styles.flex}>
                      <Text style={styles.cardTitle}>{session?.course}</Text>
                      <Text style={styles.meta}>{session ? `${formatWhen(session.date, session.start, session.end)} · ${session.groupId}` : ''}</Text>
                    </View>
                    <AppBadge label={statusLabel(item.status)} tone={tones[item.status]} />
                    <Text accessibilityElementsHidden importantForAccessibility="no" style={styles.chevron}>›</Text>
                  </Pressable>
                </Link>
                <Text style={styles.description}>{statusText(item.status)}</Text>
                {item.reason ? <Text selectable style={styles.reason}>{item.reason}</Text> : null}
                {item.status === 'refusee' && item.comment ? <Text selectable style={styles.reason}>Retour de l’enseignant : {item.comment}</Text> : null}
                {(item.status === 'a_justifier' || item.status === 'refusee') ? <JustificationForm absenceId={item.id} again={item.status === 'refusee'} /> : null}
              </AppCard>
            );
          })
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  date: { width: 48, height: 52, borderRadius: 14, backgroundColor: colors.warningSoft, alignItems: 'center', justifyContent: 'center' },
  dateOk: { backgroundColor: colors.successSoft },
  month: { color: colors.warningText, fontSize: 11, fontWeight: '700' },
  monthOk: { color: colors.success },
  day: { color: colors.text, fontSize: 18, fontWeight: '700' },
  flex: { flex: 1 },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  meta: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  description: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  reason: { color: colors.text, fontSize: 14, lineHeight: 20 },
  chevron: { color: colors.textSecondary, fontSize: 22, lineHeight: 22, fontWeight: '600' },
});
