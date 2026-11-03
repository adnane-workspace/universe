import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SectionTitle } from '@/components/AppHeader';
import { RoleHeader } from '@/components/RoleHeader';
import { AppCard } from '@/components/ui/AppCard';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppSearchBar } from '@/components/ui/AppSearchBar';
import { Screen } from '@/components/ui/Screen';
import { colors, spacing } from '@/constants/theme';
import { useAttendance } from '@/context/attendance';
import { groupSummaries } from '@/lib/domain';

export default function AdminGroupsScreen() {
  const { data } = useAttendance();
  const [query, setQuery] = useState('');
  const visible = groupSummaries(data).filter((item) => item.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <Screen inTabs header={<RoleHeader eyebrow="Groupes" subtitle="Effectifs et taux" />}>
      <View style={styles.stack}>
        <SectionTitle>Groupes</SectionTitle>
        <AppSearchBar onChangeText={setQuery} placeholder="Rechercher un groupe" value={query} />
        <AppCard style={styles.listCard}>
          {visible.length === 0 ? (
            <AppEmptyState title="Aucun groupe" message="Aucun groupe ne correspond à cette recherche." />
          ) : (
            visible.map((item, index) => (
              <View key={item.id} style={[styles.row, index > 0 && styles.rowBorder]}>
                <View style={styles.flex}>
                  <Text style={styles.rowTitle}>{item.name}</Text>
                  <Text style={styles.rowMeta}>{item.students} étudiants</Text>
                </View>
                <Text style={styles.rate}>{item.label}</Text>
              </View>
            ))
          )}
        </AppCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.sm },
  listCard: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  flex: { flex: 1 },
  rowTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  rowMeta: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  rate: { color: colors.primary, fontSize: 15, fontWeight: '700' },
});
