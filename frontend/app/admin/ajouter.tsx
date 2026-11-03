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

type Kind = 'etudiant' | 'enseignant';

export default function AdminAddScreen() {
  const { createStudent, createTeacher } = useAttendance();
  const [kind, setKind] = useState<Kind>('etudiant');
  const [name, setName] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [group, setGroup] = useState('GL2');
  const [added, setAdded] = useState<string[]>([]);
  const [formError, setFormError] = useState('');
  const [pending, setPending] = useState(false);
  const student = kind === 'etudiant';

  async function submit() {
    if (pending) return;
    setPending(true);
    const error = student
      ? await createStudent(name, group.trim() || 'GL2', login, password)
      : await createTeacher(name, login, password);
    setPending(false);
    if (error) {
      setFormError(error);
      return;
    }
    const label = student ? `${name.trim()} · ${group.trim() || 'GL2'}` : name.trim();
    setAdded((current) => [`${label} · ${login.trim()}`, ...current]);
    setName('');
    setLogin('');
    setPassword('');
    setFormError('');
  }

  return (
    <Screen inTabs keyboard header={<RoleHeader eyebrow="Ajouter" subtitle={student ? 'Nouvel étudiant' : 'Nouvel enseignant'} />}>
      <SectionTitle>Qui créer</SectionTitle>
      <View style={styles.switch}>
        <Choice active={student} label="Étudiant" onPress={() => setKind('etudiant')} />
        <Choice active={!student} label="Enseignant" onPress={() => setKind('enseignant')} />
      </View>
      <AppCard style={styles.stack}>
        <AppInput autoCapitalize="words" error={formError} label="Nom et prénom" onChangeText={setName} placeholder={student ? 'Aminata Mensah' : 'Claire Bernard'} value={name} />
        <AppInput autoCapitalize="none" autoCorrect={false} label="Identifiant" onChangeText={setLogin} placeholder={student ? '22105001' : 'c.bernard@univ-lumiere.fr'} value={login} />
        <AppInput autoCapitalize="none" label="Mot de passe" onChangeText={setPassword} placeholder="6 caractères minimum" secure value={password} />
        {student ? <AppInput autoCapitalize="characters" label="Groupe" onChangeText={setGroup} placeholder="GL2" value={group} /> : null}
        <Text style={styles.help}>
          {student
            ? 'Groupes existants : GL1, GL2 ou GL3. Le compte permet à l’étudiant de se connecter et d’apparaître à l’appel.'
            : 'Le compte permet à l’enseignant de se connecter. Il verra ses séances dès qu’elles lui seront associées.'}
        </Text>
        <AppButton disabled={pending} onPress={() => void submit()} style={styles.block} title={pending ? 'Création…' : student ? 'Créer l’étudiant' : 'Créer l’enseignant'} />
        {added.length === 0 ? (
          <AppEmptyState title="Aucune création" message="Les comptes créés apparaîtront ici. Transmettez l’identifiant et le mot de passe à la personne." />
        ) : (
          added.map((item) => (
            <Text key={item} style={styles.added}>{item} a été créé.</Text>
          ))
        )}
      </AppCard>
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
  switch: { flexDirection: 'row', gap: spacing.sm },
  choice: { flex: 1, minHeight: 44, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  choiceOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  choiceText: { color: colors.text, fontSize: 15, fontWeight: '700' },
  choiceTextOn: { color: colors.onPrimary },
  stack: { gap: spacing.sm },
  block: { alignSelf: 'stretch' },
  help: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
  added: { color: colors.success, fontSize: 13, fontWeight: '700' },
});
