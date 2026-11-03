import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SectionTitle } from '@/components/AppHeader';
import { RoleHeader } from '@/components/RoleHeader';
import { AppAvatar } from '@/components/ui/AppAvatar';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppCard } from '@/components/ui/AppCard';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppSearchBar } from '@/components/ui/AppSearchBar';
import { Screen } from '@/components/ui/Screen';
import { colors, spacing } from '@/constants/theme';
import { useAttendance } from '@/context/attendance';
import { useSession } from '@/context/session';
import { absenceCountForStudent, groupsForTeacher, studentsInGroup } from '@/lib/domain';

export default function TeacherGroupScreen() {
  const { user } = useSession();
  const { data } = useAttendance();
  const groups = groupsForTeacher(data, user?.teacherId ?? '');
  const [groupId, setGroupId] = useState('');
  const selected = groups.some((item) => item.id === groupId) ? groupId : groups[0]?.id ?? '';
  const roster = studentsInGroup(data, selected);
  const groupName = groups.find((item) => item.id === selected)?.name ?? 'Groupe';
  const [query, setQuery] = useState('');
  const visible = roster.filter((item) => item.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <Screen inTabs header={<RoleHeader eyebrow="Groupe" subtitle={`${groupName} · ${roster.length} étudiants`} />}>
      <View style={styles.stack}>
        {groups.length > 1 ? (
          <View style={styles.choices}>
            {groups.map((item) => (
              <Pressable key={item.id} accessibilityRole="button" onPress={() => setGroupId(item.id)} style={[styles.choice, selected === item.id && styles.choiceOn]}>
                <Text style={[styles.choiceText, selected === item.id && styles.choiceTextOn]}>{item.name}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        <SectionTitle>Étudiants</SectionTitle>
        <AppSearchBar onChangeText={setQuery} placeholder="Rechercher un étudiant" value={query} />
        <AppCard style={styles.listCard}>
          {visible.length === 0 ? (
            <AppEmptyState title="Aucun étudiant" message="Aucun nom ne correspond à cette recherche." />
          ) : (
            visible.map((item, index) => {
              const total = absenceCountForStudent(data, item.id);
              return (
                <View key={item.id} style={[styles.row, index > 0 && styles.rowBorder]}>
                  <AppAvatar initials={item.initials} size={42} />
                  <View style={styles.flex}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.detail}>{groupName}</Text>
                  </View>
                  <AppBadge label={total === 0 ? 'À jour' : `${total} abs.`} tone={total === 0 ? 'success' : 'warning'} />
                </View>
              );
            })
          )}
        </AppCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.sm },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  choice: { minHeight: 40, paddingHorizontal: spacing.md, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  choiceOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  choiceText: { color: colors.text, fontSize: 14, fontWeight: '700' },
  choiceTextOn: { color: colors.onPrimary },
  listCard: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  flex: { flex: 1 },
  name: { color: colors.text, fontSize: 15, fontWeight: '700' },
  detail: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
});
