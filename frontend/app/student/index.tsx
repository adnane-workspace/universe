import { Link, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SectionTitle } from '@/components/AppHeader';
import { RoleHeader } from '@/components/RoleHeader';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppCard } from '@/components/ui/AppCard';
import { AppStatCard } from '@/components/ui/AppStatCard';
import { Screen } from '@/components/ui/Screen';
import { colors, spacing } from '@/constants/theme';
import { useAttendance } from '@/context/attendance';
import { useSession } from '@/context/session';
import { presenceRate, sessionsForGroupOn, statusLabel, studentAbsences, studentById, todayIso, type AbsenceStatus } from '@/lib/domain';

const tones: Record<AbsenceStatus, 'warning' | 'neutral' | 'success' | 'danger'> = {
  a_justifier: 'warning',
  envoye: 'neutral',
  justifiee: 'success',
  refusee: 'danger',
};

export default function StudentHomeScreen() {
  const { user } = useSession();
  const { data } = useAttendance();
  const studentId = user?.studentId ?? '';
  const person = studentById(data, studentId);
  const absences = studentAbsences(data, studentId);
  const waiting = absences.filter((item) => item.status === 'a_justifier' || item.status === 'refusee');
  const pending = absences.filter((item) => item.status === 'a_justifier').length;
  const lessons = sessionsForGroupOn(data, person?.groupId ?? '', todayIso());

  return (
    <Screen inTabs header={<RoleHeader eyebrow="Accueil" />}>
      <View style={styles.stats}>
        <Pressable accessibilityRole="button" accessibilityLabel="Ouvrir mes absences" onPress={() => router.push('/student/absences')} style={styles.stat}>
          <AppStatCard compact label="Absences" value={String(absences.length)} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Ouvrir les absences à justifier" onPress={() => router.push('/student/absences')} style={styles.stat}>
          <AppStatCard compact label="À justifier" value={String(pending)} tone={pending ? 'warning' : 'success'} />
        </Pressable>
        <View style={styles.stat}>
          <AppStatCard compact label="Présence" value={`${presenceRate(data, studentId)}%`} tone="success" />
        </View>
      </View>

      {waiting.length > 0 ? (
        <View style={styles.block}>
          <SectionTitle>Absences à traiter</SectionTitle>
          <AppCard style={styles.list}>
            {waiting.map((item, index) => {
              const session = data.sessions.find((entry) => entry.id === item.sessionId);
              return (
                <Link key={item.id} href={{ pathname: '/absence/[id]', params: { id: item.id } }} asChild>
                  <Pressable accessibilityRole="link" style={StyleSheet.flatten([styles.row, index > 0 ? styles.rowBorder : null])}>
                    <View style={styles.flex}>
                      <Text style={styles.course}>{session?.course ?? 'Absence'}</Text>
                      <Text style={styles.meta}>{item.status === 'refusee' ? 'Renvoyer le motif' : 'Déposer le motif'}</Text>
                    </View>
                    <AppBadge label={statusLabel(item.status)} tone={tones[item.status]} />
                    <Text accessibilityElementsHidden importantForAccessibility="no" style={styles.chevron}>›</Text>
                  </Pressable>
                </Link>
              );
            })}
          </AppCard>
        </View>
      ) : null}

      <View style={styles.block}>
        <SectionTitle>Aujourd’hui</SectionTitle>
        {lessons.length === 0 ? (
          <Pressable accessibilityRole="button" onPress={() => router.push('/student/cours')} style={styles.emptyLink}>
            <Text style={styles.empty}>Aucun cours prévu aujourd’hui.</Text>
            <Text style={styles.link}>Voir l’emploi du temps</Text>
          </Pressable>
        ) : (
          <AppCard style={styles.list}>
            {lessons.map((lesson, index) => {
              const missed = absences.find((item) => item.sessionId === lesson.id);
              const state = lessonState(lesson.called, missed?.status);
              const row = (
                <>
                  <Text style={styles.time}>{lesson.start}</Text>
                  <View style={styles.flex}>
                    <Text style={styles.course}>{lesson.course}</Text>
                    <Text style={styles.meta}>{missed ? (missed.status === 'refusee' ? 'Renvoyer le motif' : missed.status === 'a_justifier' ? 'Déposer le motif' : lesson.room) : lesson.room}</Text>
                  </View>
                  <AppBadge label={state.label} tone={state.tone} />
                </>
              );
              if (!missed) {
                return <View key={lesson.id} style={[styles.row, index > 0 && styles.rowBorder]}>{row}</View>;
              }
              return (
                <Link key={lesson.id} href={{ pathname: '/absence/[id]', params: { id: missed.id } }} asChild>
                  <Pressable accessibilityRole="link" style={StyleSheet.flatten([styles.row, index > 0 ? styles.rowBorder : null])}>{row}</Pressable>
                </Link>
              );
            })}
          </AppCard>
        )}
      </View>
    </Screen>
  );
}

function lessonState(called: boolean, status?: AbsenceStatus) {
  if (!called) return { label: 'À venir', tone: 'neutral' as const };
  if (!status) return { label: 'Présent', tone: 'success' as const };
  if (status === 'justifiee') return { label: 'Justifiée', tone: 'success' as const };
  if (status === 'refusee') return { label: 'Refusée', tone: 'danger' as const };
  if (status === 'envoye') return { label: 'Envoyé', tone: 'neutral' as const };
  return { label: 'À justifier', tone: 'warning' as const };
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: spacing.sm },
  stat: { flex: 1 },
  block: { gap: spacing.sm },
  list: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  time: { width: 48, color: colors.primary, fontSize: 14, fontWeight: '800' },
  flex: { flex: 1 },
  course: { color: colors.text, fontSize: 15, fontWeight: '700' },
  meta: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  empty: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  emptyLink: { gap: spacing.xs },
  link: { color: colors.primary, fontSize: 14, lineHeight: 20, fontWeight: '600' },
  chevron: { color: colors.textSecondary, fontSize: 22, lineHeight: 22, fontWeight: '600' },
});
