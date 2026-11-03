import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SectionTitle } from '@/components/AppHeader';
import { RoleHeader } from '@/components/RoleHeader';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppInput } from '@/components/ui/AppInput';
import { Screen } from '@/components/ui/Screen';
import { colors, radius, spacing } from '@/constants/theme';
import { useAttendance } from '@/context/attendance';
import { formatWhen, todayIso } from '@/lib/domain';

export default function AdminSessionsScreen() {
  const { data, createSession, cancelSession } = useAttendance();
  const [course, setCourse] = useState('');
  const [room, setRoom] = useState('');
  const [date, setDate] = useState(todayIso());
  const [start, setStart] = useState('08:00');
  const [end, setEnd] = useState('10:00');
  const [groupId, setGroupId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [formError, setFormError] = useState('');
  const [saved, setSaved] = useState('');
  const [pending, setPending] = useState(false);
  const selectedGroup = groupId || data.groups[0]?.id || '';
  const selectedTeacher = teacherId || data.teachers[0]?.id || '';
  const planned = data.sessions
    .filter((item) => item.groupId === selectedGroup)
    .sort((left, right) => `${left.date}${left.start}`.localeCompare(`${right.date}${right.start}`));

  async function submit() {
    if (pending) return;
    setPending(true);
    const error = await createSession({
      course,
      room,
      date: date.trim(),
      start: start.trim(),
      end: end.trim(),
      groupId: selectedGroup,
      teacherId: selectedTeacher,
    });
    setPending(false);
    if (error) {
      setFormError(error);
      setSaved('');
      return;
    }
    setCourse('');
    setRoom('');
    setFormError('');
    setSaved('La séance est ajoutée à l’emploi du temps du groupe.');
  }

  async function cancel(sessionId: string) {
    if (pending) return;
    setPending(true);
    const error = await cancelSession(sessionId);
    setPending(false);
    if (error) {
      setFormError(error);
      setSaved('');
      return;
    }
    setFormError('');
    setSaved('La séance à venir a été annulée.');
  }

  return (
    <Screen inTabs keyboard header={<RoleHeader eyebrow="Séances" subtitle="Planifier un cours" />}>
      <SectionTitle>Nouvelle séance</SectionTitle>
      <Text style={styles.help}>Groupe</Text>
      <View style={styles.choices}>
        {data.groups.map((item) => (
          <Choice key={item.id} active={item.id === selectedGroup} label={item.name} onPress={() => setGroupId(item.id)} />
        ))}
      </View>
      <Text style={styles.help}>Enseignant</Text>
      <View style={styles.choices}>
        {data.teachers.map((item) => (
          <Choice key={item.id} active={item.id === selectedTeacher} label={item.name} onPress={() => setTeacherId(item.id)} />
        ))}
      </View>
      <AppCard style={styles.stack}>
        <AppInput label="Cours" onChangeText={setCourse} placeholder="Génie logiciel" value={course} />
        <AppInput label="Salle" onChangeText={setRoom} placeholder="Salle A-112" value={room} />
        <AppInput autoCapitalize="none" label="Date" onChangeText={setDate} placeholder="2026-11-04" value={date} />
        <View style={styles.times}>
          <View style={styles.time}>
            <AppInput autoCapitalize="none" label="Début" onChangeText={setStart} placeholder="08:00" value={start} />
          </View>
          <View style={styles.time}>
            <AppInput autoCapitalize="none" label="Fin" onChangeText={setEnd} placeholder="10:00" value={end} />
          </View>
        </View>
        {formError ? <Text style={styles.error}>{formError}</Text> : null}
        {saved ? <Text style={styles.saved}>{saved}</Text> : null}
        <AppButton disabled={pending} onPress={() => void submit()} style={styles.block} title={pending ? 'Enregistrement…' : 'Planifier la séance'} />
      </AppCard>
      <View style={styles.stack}>
        <SectionTitle>Séances du groupe</SectionTitle>
        {planned.length === 0 ? (
          <AppCard>
            <AppEmptyState title="Aucune séance" message="Les cours planifiés pour ce groupe apparaîtront ici." />
          </AppCard>
        ) : (
          <AppCard style={styles.listCard}>
            {planned.map((item, index) => (
              <View key={item.id} style={[styles.row, index > 0 && styles.rowBorder]}>
                <View style={styles.flex}>
                  <Text style={styles.rowTitle}>{item.course}</Text>
                  <Text style={styles.rowMeta}>{formatWhen(item.date, item.start, item.end)} · {item.room}</Text>
                </View>
                {item.called ? <Text style={styles.state}>Appelée</Text> : (
                  <Pressable accessibilityRole="button" onPress={() => void cancel(item.id)} style={styles.cancel}>
                    <Text style={styles.cancelText}>Annuler</Text>
                  </Pressable>
                )}
              </View>
            ))}
          </AppCard>
        )}
      </View>
    </Screen>
  );
}

function Choice({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.choice, active && styles.choiceOn]}>
      <Text style={[styles.choiceText, active && styles.choiceTextOn]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  help: { color: colors.textSecondary, fontSize: 13, fontWeight: '700' },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  choice: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  choiceText: { color: colors.text, fontSize: 14, fontWeight: '700' },
  choiceTextOn: { color: colors.onPrimary },
  stack: { gap: spacing.sm },
  times: { flexDirection: 'row', gap: spacing.sm },
  time: { flex: 1 },
  block: { alignSelf: 'stretch' },
  error: { color: colors.error, fontSize: 14, lineHeight: 20, fontWeight: '700' },
  saved: { color: colors.success, fontSize: 14, lineHeight: 20, fontWeight: '700' },
  listCard: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  flex: { flex: 1 },
  rowTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  rowMeta: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  state: { color: colors.primary, fontSize: 13, fontWeight: '700' },
  cancel: { minHeight: 36, justifyContent: 'center', paddingHorizontal: spacing.sm },
  cancelText: { color: colors.error, fontSize: 13, fontWeight: '700' },
});
