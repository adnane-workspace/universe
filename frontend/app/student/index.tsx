import { Link, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SectionTitle } from '@/components/AppHeader';
import { Icon } from '@/components/Icon';
import { JustificationForm } from '@/components/JustificationForm';
import { RoleHeader } from '@/components/RoleHeader';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppCard } from '@/components/ui/AppCard';
import { AttendanceRing } from '@/components/ui/AttendanceRing';
import { CourseMark } from '@/components/ui/CourseMark';
import { Screen } from '@/components/ui/Screen';
import { colors, radius, spacing } from '@/constants/theme';
import { useAttendance } from '@/context/attendance';
import { useSession } from '@/context/session';
import { absenceLabel, attendanceBalance, canJustify, courseAlerts, formatWhen, presenceRate, sessionsForGroupOn, studentAbsences, studentById, todayIso, type AbsenceStatus, type CourseSession } from '@/lib/domain';

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
  const today = todayIso();
  const waiting = absences.filter((item) => {
    const session = data.sessions.find((entry) => entry.id === item.sessionId);
    return session ? canJustify(item.status, session.date) : false;
  });
  const balance = attendanceBalance(data, studentId);
  const alerts = courseAlerts(data, studentId);
  const lessons = sessionsForGroupOn(data, person?.groupId ?? '', today);
  const upcoming = upcomingSessions(data.sessions, person?.groupId ?? '', today);

  return (
    <Screen inTabs header={<RoleHeader eyebrow="Bonjour" subtitle={user?.subtitle} />}>
      <AppCard style={styles.hero}>
        <View style={styles.heroCopy}>
          <Text style={styles.heroLabel}>Mon assiduité</Text>
          <Text style={styles.heroValue}>
            {balance.held === 0 ? 'Aucune séance appelée' : `Présences : ${balance.present} / ${balance.held}`}
          </Text>
          <Text style={styles.heroHint}>Les absences justifiées ne comptent pas.</Text>
        </View>
        <AttendanceRing onPrimary value={presenceRate(data, studentId)} />
      </AppCard>

      {alerts.length > 0 ? (
        <View style={styles.alerts}>
          {alerts.map((alert) => (
            <Text key={alert.course} style={styles.alert}>
              {alert.course} : {alert.count} absences non justifiées. Le seuil est de 3.
            </Text>
          ))}
        </View>
      ) : null}

      <View style={styles.shortcuts}>
        <Shortcut icon={{ ios: 'calendar', android: 'calendar_today' }} label="Emploi du temps" onPress={() => router.push('/student/cours')} />
        <Shortcut icon={{ ios: 'list.bullet', android: 'list' }} label="Absences" onPress={() => router.push('/student/absences')} />
      </View>

      {waiting.length > 0 ? (
        <View style={styles.block}>
          <SectionTitle>Absences à traiter</SectionTitle>
          {waiting.map((item) => {
            const session = data.sessions.find((entry) => entry.id === item.sessionId);
            return (
              <AppCard key={item.id} style={styles.justify}>
                <Link href={{ pathname: '/absence/[id]', params: { id: item.id } }} asChild>
                  <Pressable accessibilityRole="link" style={styles.row}>
                    <CourseMark course={session?.course ?? 'Absence'} />
                    <View style={styles.flex}>
                      <Text style={styles.course}>{session?.course ?? 'Absence'}</Text>
                      <Text style={styles.meta}>{session ? formatWhen(session.date, session.start, session.end) : 'Absence confirmée'}</Text>
                    </View>
                    <AppBadge label={session ? absenceLabel(item.status, session.date) : 'Absence'} tone={tones[item.status]} />
                  </Pressable>
                </Link>
                <JustificationForm absenceId={item.id} again={item.status === 'refusee'} />
              </AppCard>
            );
          })}
        </View>
      ) : null}

      <View style={styles.block}>
        <SectionTitle
          action={
            <Pressable accessibilityRole="link" onPress={() => router.push('/student/cours')}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </Pressable>
          }
        >
          {lessons.length > 0 ? 'Aujourd’hui' : 'Prochains cours'}
        </SectionTitle>
        {(lessons.length > 0 ? lessons : upcoming).length === 0 ? (
          <Text style={styles.empty}>Aucun cours prévu.</Text>
        ) : (
          (lessons.length > 0 ? lessons : upcoming).map((lesson) => {
            const missedLesson = absences.find((item) => item.sessionId === lesson.id);
            const state = lessonState(lesson.called, missedLesson?.status, lesson.date);
            const body = (
              <>
                <CourseMark course={lesson.course} />
                <View style={styles.flex}>
                  <Text style={styles.course}>{lesson.course}</Text>
                  <Text style={styles.meta}>{formatWhen(lesson.date, lesson.start, lesson.end)}</Text>
                  <Text style={styles.meta}>{lesson.room}</Text>
                </View>
                <AppBadge label={state.label} tone={state.tone} />
              </>
            );
            if (!missedLesson) {
              return (
                <AppCard key={lesson.id} style={styles.row}>
                  {body}
                </AppCard>
              );
            }
            return (
              <Link key={lesson.id} href={{ pathname: '/absence/[id]', params: { id: missedLesson.id } }} asChild>
                <Pressable accessibilityRole="link">
                  <AppCard style={styles.row}>{body}</AppCard>
                </Pressable>
              </Link>
            );
          })
        )}
      </View>
    </Screen>
  );
}

function Shortcut({
  icon,
  label,
  onPress,
}: {
  icon: { ios: 'calendar' | 'list.bullet'; android: 'calendar_today' | 'list' };
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.shortcut, pressed && styles.pressed]}>
      <View style={styles.shortcutIcon}>
        <Icon name={icon} color={colors.primary} size={20} />
      </View>
      <Text style={styles.shortcutLabel}>{label}</Text>
    </Pressable>
  );
}

function upcomingSessions(sessions: CourseSession[], groupId: string, today: string) {
  return sessions
    .filter((item) => item.groupId === groupId && item.date >= today)
    .sort((left, right) => left.date.localeCompare(right.date) || left.start.localeCompare(right.start))
    .slice(0, 3);
}

function lessonState(called: boolean, status: AbsenceStatus | undefined, sessionDate: string) {
  if (!called) return { label: 'À venir', tone: 'neutral' as const };
  if (!status) return { label: 'Présent', tone: 'success' as const };
  if (status === 'justifiee') return { label: 'Justifiée', tone: 'success' as const };
  if (status === 'refusee') return { label: 'Refusée', tone: 'danger' as const };
  if (status === 'envoye') return { label: 'En examen', tone: 'neutral' as const };
  if (!canJustify(status, sessionDate)) return { label: 'Hors délai', tone: 'danger' as const };
  return { label: 'À justifier', tone: 'warning' as const };
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    paddingVertical: spacing.lg,
  },
  heroCopy: { flex: 1, gap: spacing.xs },
  heroLabel: { color: colors.onPrimary, fontSize: 16, fontWeight: '700' },
  heroValue: { color: 'rgba(255,255,255,0.82)', fontSize: 14, lineHeight: 20 },
  heroHint: { color: 'rgba(255,255,255,0.72)', fontSize: 12, lineHeight: 16 },
  alerts: { gap: spacing.xs },
  alert: { color: colors.error, fontSize: 14, lineHeight: 20, fontWeight: '600' },
  shortcuts: { flexDirection: 'row', gap: spacing.sm },
  shortcut: {
    flex: 1,
    minHeight: 88,
    borderRadius: radius.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  shortcutIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutLabel: { color: colors.text, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  pressed: { opacity: 0.85 },
  block: { gap: spacing.sm },
  justify: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  flex: { flex: 1 },
  course: { color: colors.text, fontSize: 15, fontWeight: '700' },
  meta: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  empty: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  seeAll: { color: colors.primary, fontSize: 14, fontWeight: '700' },
});
