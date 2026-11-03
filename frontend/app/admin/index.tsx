import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SectionTitle } from '@/components/AppHeader';
import { RoleHeader } from '@/components/RoleHeader';
import { AppCard } from '@/components/ui/AppCard';
import { NextAction } from '@/components/ui/NextAction';
import { AppStatCard } from '@/components/ui/AppStatCard';
import { Screen } from '@/components/ui/Screen';
import { colors, spacing } from '@/constants/theme';
import { useAttendance } from '@/context/attendance';
import { formatRate, groupSummaries, overallRate, receivedJustifications } from '@/lib/domain';

export default function AdminHomeScreen() {
  const { data } = useAttendance();
  const summary = overallRate(data);
  const groups = groupSummaries(data);
  const highest = [...groups].sort((left, right) => right.rate - left.rate)[0];

  return (
    <Screen inTabs header={<RoleHeader eyebrow="Pilotage" />}>
      <View style={styles.grid}>
        <AppStatCard icon={{ ios: 'person.2.fill', android: 'groups' }} value={String(summary.people)} label="Étudiants" hint={`dans ${summary.groups} groupes`} />
        <AppStatCard icon={{ ios: 'person.wave.2.fill', android: 'co_present' }} value={String(summary.teachers)} label="Enseignants" hint="enregistrés" />
        <AppStatCard icon={{ ios: 'chart.bar.fill', android: 'monitoring' }} value={formatRate(summary.rate)} label="Taux d’absence" hint="séances déjà appelées" />
        <AppStatCard icon={{ ios: 'doc.text.fill', android: 'description' }} value={String(receivedJustifications(data))} label="Justificatifs" hint="reçus, à trancher par l’enseignant" tone="warning" />
      </View>
      <View style={styles.stack}>
        <SectionTitle>Taux par groupe</SectionTitle>
        <NextAction
          action="Voir les taux en détail"
          message={highest && highest.rate > 0 ? `${highest.name} a le taux le plus élevé (${highest.label}).` : 'Aucune absence enregistrée pour le moment.'}
          onPress={() => router.push('/admin/taux')}
          title="Taux le plus élevé"
        />
        <AppCard style={styles.listCard}>
          {groups.map((item, index) => (
            <Pressable key={item.id} accessibilityRole="button" onPress={() => router.push('/admin/taux')} style={[styles.row, index > 0 && styles.rowBorder]}>
              <View style={styles.flex}>
                <Text style={styles.rowTitle}>{item.name}</Text>
                <Text style={styles.rowMeta}>{item.students} étudiants</Text>
              </View>
              <Text style={styles.rate}>{item.label}</Text>
            </Pressable>
          ))}
        </AppCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  stack: { gap: spacing.sm },
  listCard: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, minHeight: 52 },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  flex: { flex: 1 },
  rowTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  rowMeta: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  rate: { color: colors.primary, fontSize: 15, fontWeight: '700' },
});
