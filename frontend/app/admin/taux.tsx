import { StyleSheet, Text, View } from 'react-native';

import { SectionTitle } from '@/components/AppHeader';
import { RoleHeader } from '@/components/RoleHeader';
import { AppCard } from '@/components/ui/AppCard';
import { Screen } from '@/components/ui/Screen';
import { colors, spacing } from '@/constants/theme';
import { useAttendance } from '@/context/attendance';
import { groupSummaries } from '@/lib/domain';

export default function AdminRatesScreen() {
  const { data } = useAttendance();
  const groups = groupSummaries(data);
  const highest = [...groups].sort((left, right) => right.rate - left.rate)[0];

  return (
    <Screen inTabs header={<RoleHeader eyebrow="Taux" subtitle="Absences sur les séances appelées" />}>
      <View style={styles.stack}>
        <SectionTitle>Par groupe</SectionTitle>
        <AppCard style={styles.stack}>
          {groups.map((item) => (
            <View key={item.id} style={styles.statLine}>
              <View style={styles.statHead}>
                <Text style={styles.rowTitle}>{item.name}</Text>
                <Text style={styles.rate}>{item.label}</Text>
              </View>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${Math.min(100, Math.max(item.rate, item.rate > 0 ? 6 : 0))}%` }]} />
              </View>
            </View>
          ))}
          <Text style={styles.note}>
            {highest && highest.rate > 0 ? `${highest.name} a le taux le plus élevé (${highest.label}).` : 'Aucune absence enregistrée pour le moment.'}
          </Text>
        </AppCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.sm },
  statLine: { gap: spacing.sm },
  statHead: { flexDirection: 'row', justifyContent: 'space-between' },
  rowTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  rate: { color: colors.primary, fontSize: 15, fontWeight: '700' },
  track: { height: 8, borderRadius: 8, backgroundColor: colors.primaryLight, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 8, backgroundColor: colors.primary },
  note: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
});
