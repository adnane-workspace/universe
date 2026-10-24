import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';

const navy = '#14243A';
const muted = '#718096';
const blue = '#3467EB';

const students = [
  { initials: 'AM', name: 'Aminata Mensah', detail: 'Génie logiciel · GL2', count: 2, color: '#EAF0FF' },
  { initials: 'YK', name: 'Yacouba Koné', detail: 'Génie logiciel · GL2', count: 1, color: '#FFF1E6' },
  { initials: 'FN', name: 'Fatou Ndiaye', detail: 'Génie logiciel · GL2', count: 0, color: '#E8F7F0' },
];

export default function TeacherScreen() {
  const [marked, setMarked] = useState(false);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.topline}>
        <View>
          <Text style={styles.eyebrow}>ESPACE ENSEIGNANT</Text>
          <Text style={styles.greeting}>Bonjour, Professeur</Text>
          <Text style={styles.subtitle}>Voici le suivi de vos groupes aujourd’hui.</Text>
        </View>
        <View style={styles.avatar}><Text style={styles.avatarText}>PR</Text></View>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { marginRight: 10 }]}>
          <Text style={styles.statLabel}>Absences du mois</Text>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statFoot}>dans vos groupes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>À justifier</Text>
          <Text style={[styles.statValue, { color: '#D97706' }]}>3</Text>
          <Text style={styles.statFoot}>demandent votre avis</Text>
        </View>
      </View>

      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>Votre prochain cours</Text>
        <Text style={styles.link}>Voir tout</Text>
      </View>
      <View style={styles.courseCard}>
        <View style={styles.courseTop}>
          <View style={styles.courseIcon}><Text style={{ fontSize: 20 }}>▦</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.courseTitle}>Développement mobile</Text>
            <Text style={styles.courseDetail}>Génie logiciel · Groupe GL2</Text>
          </View>
          <View style={styles.livePill}><Text style={styles.liveText}>À 10:30</Text></View>
        </View>
        <View style={styles.divider} />
        <View style={styles.courseBottom}>
          <Text style={styles.courseMeta}>◷  Salle B-204  ·  24 étudiants</Text>
          <Pressable style={[styles.primaryButton, marked && styles.doneButton]} onPress={() => setMarked(!marked)}>
            <Text style={styles.primaryButtonText}>{marked ? 'Appel enregistré ✓' : 'Faire l’appel'}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.sectionHeading}>
        <View>
          <Text style={styles.sectionTitle}>Étudiants à suivre</Text>
          <Text style={styles.sectionCaption}>Groupe GL2 · 3 étudiants affichés</Text>
        </View>
        <Text style={styles.link}>Tout voir</Text>
      </View>
      <View style={styles.listCard}>
        {students.map((student, index) => (
          <View key={student.initials} style={[styles.studentRow, index > 0 && styles.rowBorder]}>
            <View style={[styles.studentAvatar, { backgroundColor: student.color }]}><Text style={styles.studentInitials}>{student.initials}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.studentName}>{student.name}</Text>
              <Text style={styles.studentDetail}>{student.detail}</Text>
            </View>
            <View style={[styles.countPill, student.count === 0 && styles.clearPill]}>
              <Text style={[styles.countText, student.count === 0 && styles.clearText]}>{student.count} absence{student.count > 1 ? 's' : ''}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </View>
        ))}
      </View>
      <Text style={styles.footer}>Données de démonstration · Connectez votre API pour activer la synchronisation.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F5F7FB' },
  content: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 36 },
  topline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
  eyebrow: { color: blue, fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginBottom: 8 },
  greeting: { color: navy, fontSize: 25, lineHeight: 31, fontWeight: '800' },
  subtitle: { color: muted, fontSize: 13, marginTop: 5 },
  avatar: { width: 46, height: 46, borderRadius: 16, backgroundColor: '#E6ECFF', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: blue, fontSize: 14, fontWeight: '800' },
  statsRow: { flexDirection: 'row', marginBottom: 25 },
  statCard: { flex: 1, minHeight: 116, padding: 16, borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E9EDF4' },
  statLabel: { fontSize: 12, fontWeight: '600', color: muted },
  statValue: { color: navy, fontSize: 30, fontWeight: '800', marginTop: 8 },
  statFoot: { color: '#94A0B2', fontSize: 11, marginTop: 2 },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 2 },
  sectionTitle: { color: navy, fontSize: 17, fontWeight: '800' },
  sectionCaption: { color: muted, fontSize: 12, marginTop: 4 },
  link: { color: blue, fontSize: 12, fontWeight: '700' },
  courseCard: { backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#E9EDF4', padding: 16, marginBottom: 25 },
  courseTop: { flexDirection: 'row', alignItems: 'center' },
  courseIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  courseTitle: { color: navy, fontSize: 14, fontWeight: '800' },
  courseDetail: { color: muted, fontSize: 11, marginTop: 4 },
  livePill: { backgroundColor: '#EEF2FF', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 6 },
  liveText: { color: blue, fontWeight: '700', fontSize: 10 },
  divider: { height: 1, backgroundColor: '#EEF0F5', marginVertical: 14 },
  courseBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  courseMeta: { color: muted, fontSize: 10, flexShrink: 1 },
  primaryButton: { backgroundColor: blue, paddingHorizontal: 13, paddingVertical: 10, borderRadius: 11 },
  doneButton: { backgroundColor: '#15805D' },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 11 },
  listCard: { backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#E9EDF4', paddingHorizontal: 14 },
  studentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13 },
  rowBorder: { borderTopWidth: 1, borderTopColor: '#F0F2F6' },
  studentAvatar: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  studentInitials: { color: navy, fontSize: 11, fontWeight: '800' },
  studentName: { color: navy, fontSize: 12, fontWeight: '700' },
  studentDetail: { color: muted, fontSize: 10, marginTop: 4 },
  countPill: { backgroundColor: '#FFF4E5', borderRadius: 9, paddingHorizontal: 8, paddingVertical: 6 },
  countText: { color: '#C17712', fontSize: 9, fontWeight: '700' },
  clearPill: { backgroundColor: '#E9F7F0' },
  clearText: { color: '#15805D' },
  chevron: { color: '#A8B1BF', fontSize: 22, marginLeft: 7 },
  footer: { textAlign: 'center', color: '#A2ACBA', fontSize: 10, lineHeight: 16, marginTop: 18, paddingHorizontal: 10 },
});
