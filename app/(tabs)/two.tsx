import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const navy = '#14243A';
const muted = '#718096';
const blue = '#3467EB';

export default function StudentScreen() {
  const [submitted, setSubmitted] = useState(false);
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>ESPACE ÉTUDIANT</Text>
      <Text style={styles.title}>Bonjour, Aminata 👋</Text>
      <Text style={styles.subtitle}>Retrouvez ici votre emploi du temps et vos absences.</Text>
      <View style={styles.summary}>
        <View style={styles.summaryItem}><Text style={styles.number}>2</Text><Text style={styles.summaryLabel}>Absences</Text></View>
        <View style={styles.verticalLine} />
        <View style={styles.summaryItem}><Text style={[styles.number, { color: '#D97706' }]}>1</Text><Text style={styles.summaryLabel}>À justifier</Text></View>
        <View style={styles.verticalLine} />
        <View style={styles.summaryItem}><Text style={[styles.number, { color: '#15805D' }]}>94%</Text><Text style={styles.summaryLabel}>Présence</Text></View>
      </View>
      <View style={styles.heading}><Text style={styles.sectionTitle}>Mes absences</Text><Text style={styles.link}>Historique</Text></View>
      <View style={styles.card}>
        <View style={styles.cardHeader}><View style={styles.dateBox}><Text style={styles.month}>OCT</Text><Text style={styles.day}>21</Text></View><View style={{ flex: 1 }}><Text style={styles.course}>Développement mobile</Text><Text style={styles.meta}>Mardi · 10:30–12:30 · GL2</Text></View><View style={styles.pending}><Text style={styles.pendingText}>À justifier</Text></View></View>
        <View style={styles.line} />
        <Text style={styles.description}>Une absence a été enregistrée pour cette séance. Déposez un justificatif pour expliquer votre absence.</Text>
        <Pressable onPress={() => setSubmitted(true)} style={[styles.button, submitted && styles.buttonDone]}><Text style={styles.buttonText}>{submitted ? 'Justificatif envoyé ✓' : 'Déposer un justificatif'}</Text></Pressable>
        {submitted && <Text style={styles.confirmation}>Votre document est en attente de validation par l’enseignant.</Text>}
      </View>
      <View style={styles.card}>
        <View style={styles.cardHeader}><View style={[styles.dateBox, { backgroundColor: '#E9F7F0' }]}><Text style={[styles.month, { color: '#15805D' }]}>OCT</Text><Text style={styles.day}>08</Text></View><View style={{ flex: 1 }}><Text style={styles.course}>Bases de données</Text><Text style={styles.meta}>Jeudi · 08:00–10:00 · GL2</Text></View><View style={styles.approved}><Text style={styles.approvedText}>Justifiée</Text></View></View>
        <View style={styles.line} /><Text style={styles.description}>Votre justificatif a été accepté le 10 octobre.</Text>
      </View>
      <Text style={styles.footer}>Données de démonstration · Votre espace sera relié à votre compte étudiant.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F5F7FB' }, content: { padding: 20, paddingTop: 25, paddingBottom: 36 },
  eyebrow: { color: blue, fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginBottom: 8 }, title: { color: navy, fontSize: 25, fontWeight: '800' }, subtitle: { color: muted, fontSize: 13, lineHeight: 19, marginTop: 6 },
  summary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#E9EDF4', paddingVertical: 17, marginTop: 21, marginBottom: 26 }, summaryItem: { alignItems: 'center', minWidth: 60 }, number: { fontSize: 21, fontWeight: '800', color: navy }, summaryLabel: { color: muted, fontSize: 10, marginTop: 5 }, verticalLine: { height: 35, width: 1, backgroundColor: '#E9EDF4' },
  heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }, sectionTitle: { color: navy, fontSize: 17, fontWeight: '800' }, link: { color: blue, fontSize: 12, fontWeight: '700' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#E9EDF4', padding: 15, marginBottom: 12 }, cardHeader: { flexDirection: 'row', alignItems: 'center' }, dateBox: { width: 44, height: 48, borderRadius: 12, backgroundColor: '#FFF1E6', alignItems: 'center', justifyContent: 'center', marginRight: 11 }, month: { fontSize: 9, color: '#C17712', fontWeight: '800' }, day: { color: navy, fontSize: 17, fontWeight: '800', marginTop: 1 }, course: { color: navy, fontSize: 12, fontWeight: '800' }, meta: { color: muted, fontSize: 10, marginTop: 4 }, pending: { backgroundColor: '#FFF4E5', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8 }, pendingText: { color: '#C17712', fontSize: 9, fontWeight: '700' }, approved: { backgroundColor: '#E9F7F0', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8 }, approvedText: { color: '#15805D', fontSize: 9, fontWeight: '700' }, line: { height: 1, backgroundColor: '#EEF0F5', marginVertical: 13 }, description: { color: muted, fontSize: 11, lineHeight: 17 }, button: { alignItems: 'center', backgroundColor: blue, paddingVertical: 11, borderRadius: 11, marginTop: 13 }, buttonDone: { backgroundColor: '#15805D' }, buttonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' }, confirmation: { color: '#15805D', textAlign: 'center', fontSize: 10, marginTop: 9 }, footer: { textAlign: 'center', color: '#A2ACBA', fontSize: 10, lineHeight: 16, marginTop: 8, paddingHorizontal: 10 },
});
