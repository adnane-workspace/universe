import { ScrollView, StyleSheet, Text, View } from 'react-native';

const navy = '#14243A';
const muted = '#718096';
const blue = '#3467EB';

export default function AdminScreen() {
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>ESPACE ADMINISTRATION</Text>
      <Text style={styles.title}>Vue d’ensemble</Text>
      <Text style={styles.subtitle}>Les indicateurs de présence de l’établissement.</Text>
      <View style={styles.grid}>
        <View style={styles.metric}><Text style={styles.metricIcon}>♙</Text><Text style={styles.metricValue}>248</Text><Text style={styles.metricLabel}>Étudiants</Text><Text style={styles.metricHint}>dans 12 groupes</Text></View>
        <View style={styles.metric}><Text style={[styles.metricIcon, { color: '#15805D' }]}>▦</Text><Text style={styles.metricValue}>18</Text><Text style={styles.metricLabel}>Enseignants</Text><Text style={styles.metricHint}>actifs ce semestre</Text></View>
        <View style={styles.metric}><Text style={[styles.metricIcon, { color: '#D97706' }]}>◷</Text><Text style={styles.metricValue}>7.2%</Text><Text style={styles.metricLabel}>Taux d’absence</Text><Text style={styles.metricHint}>depuis la rentrée</Text></View>
        <View style={styles.metric}><Text style={[styles.metricIcon, { color: '#7C3AED' }]}>▤</Text><Text style={styles.metricValue}>14</Text><Text style={styles.metricLabel}>À traiter</Text><Text style={styles.metricHint}>justificatifs reçus</Text></View>
      </View>
      <Text style={styles.sectionTitle}>Raccourcis</Text>
      <View style={styles.actions}>
        <View style={styles.actionRow}><View style={styles.actionIcon}><Text style={{ color: blue, fontWeight: '800' }}>＋</Text></View><View style={{ flex: 1 }}><Text style={styles.actionTitle}>Ajouter un étudiant</Text><Text style={styles.actionDesc}>Créer un compte et l’affecter à un groupe</Text></View><Text style={styles.arrow}>›</Text></View>
        <View style={styles.actionRow}><View style={[styles.actionIcon, { backgroundColor: '#E9F7F0' }]}><Text style={{ color: '#15805D', fontWeight: '800' }}>▦</Text></View><View style={{ flex: 1 }}><Text style={styles.actionTitle}>Gérer les groupes</Text><Text style={styles.actionDesc}>Consulter les groupes et leurs membres</Text></View><Text style={styles.arrow}>›</Text></View>
        <View style={styles.actionRow}><View style={[styles.actionIcon, { backgroundColor: '#FFF4E5' }]}><Text style={{ color: '#D97706', fontWeight: '800' }}>▤</Text></View><View style={{ flex: 1 }}><Text style={styles.actionTitle}>Voir les statistiques</Text><Text style={styles.actionDesc}>Comparer les absences par groupe</Text></View><Text style={styles.arrow}>›</Text></View>
      </View>
      <View style={styles.notice}><Text style={styles.noticeTitle}>Suivi hebdomadaire</Text><Text style={styles.noticeText}>Les absences sont en hausse de 1,4 % cette semaine par rapport à la précédente.</Text><View style={styles.barTrack}><View style={styles.barFill} /></View><View style={styles.barLabels}><Text style={styles.barLabel}>Semaine précédente</Text><Text style={styles.barLabel}>7,2 %</Text></View></View>
      <Text style={styles.footer}>Données de démonstration · La gestion sera reliée au service d’administration.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F5F7FB' }, content: { padding: 20, paddingTop: 25, paddingBottom: 36 }, eyebrow: { color: blue, fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginBottom: 8 }, title: { color: navy, fontSize: 25, fontWeight: '800' }, subtitle: { color: muted, fontSize: 13, marginTop: 6, marginBottom: 21 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 }, metric: { width: '48%', minHeight: 132, backgroundColor: '#FFFFFF', borderRadius: 17, borderWidth: 1, borderColor: '#E9EDF4', padding: 14, marginBottom: 10 }, metricIcon: { color: blue, fontSize: 17, fontWeight: '800' }, metricValue: { color: navy, fontSize: 23, fontWeight: '800', marginTop: 8 }, metricLabel: { color: navy, fontSize: 11, fontWeight: '700', marginTop: 2 }, metricHint: { color: muted, fontSize: 9, marginTop: 4 },
  sectionTitle: { color: navy, fontSize: 17, fontWeight: '800', marginBottom: 12 }, actions: { backgroundColor: '#FFFFFF', borderRadius: 17, borderWidth: 1, borderColor: '#E9EDF4', paddingHorizontal: 13, marginBottom: 18 }, actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#F0F2F6' }, actionIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginRight: 10 }, actionTitle: { color: navy, fontSize: 11, fontWeight: '800' }, actionDesc: { color: muted, fontSize: 9, marginTop: 4 }, arrow: { color: '#A8B1BF', fontSize: 22, marginLeft: 7 },
  notice: { backgroundColor: '#EAF0FF', borderRadius: 16, padding: 15 }, noticeTitle: { color: navy, fontSize: 12, fontWeight: '800' }, noticeText: { color: '#536682', fontSize: 10, lineHeight: 16, marginTop: 6 }, barTrack: { height: 6, backgroundColor: '#D0DAF7', borderRadius: 6, marginTop: 13 }, barFill: { width: '72%', height: 6, backgroundColor: blue, borderRadius: 6 }, barLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }, barLabel: { color: '#6B7D9A', fontSize: 9 }, footer: { textAlign: 'center', color: '#A2ACBA', fontSize: 10, lineHeight: 16, marginTop: 16, paddingHorizontal: 10 },
});
