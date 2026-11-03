import { router, usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { AppModal } from '@/components/ui/AppModal';
import { colors, layout, radius, spacing } from '@/constants/theme';
import { useSession } from '@/context/session';
import { developmentLogins, homeForRole } from '@/lib/auth';

const notices = {
  forgot: {
    title: 'Mot de passe oublié',
    message: 'Contactez la direction des systèmes d’information : support@univ-lumiere.fr, du lundi au vendredi, 8h–18h.',
  },
  register: {
    title: 'Inscription',
    message: 'Les comptes UniPresence sont créés par la direction des études. Utilisez l’identifiant qui vous a été remis.',
  },
} as const;

export default function LoginScreen() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { user, signIn } = useSession();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [hidden, setHidden] = useState(true);
  const [focused, setFocused] = useState<'identifier' | 'password' | null>(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<keyof typeof notices | null>(null);

  useEffect(() => {
    if (user && pathname === '/') {
      router.replace(homeForRole[user.role]);
    }
  }, [pathname, user]);

  async function enter(login = identifier, secret = password) {
    if (pending) return;
    if (!login.trim() || !secret) {
      setError('Renseignez l’identifiant et le mot de passe.');
      return;
    }
    setPending(true);
    const result = await signIn(login, secret);
    setPending(false);
    if (!result.user) {
      setError(result.message);
      return;
    }
    setError('');
    router.replace(homeForRole[result.user.role]);
  }

  if (user) {
    return null;
  }

  const currentNotice = notice ? notices[notice] : null;

  return (
    <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 28 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.brand}>UniPresence</Text>
        <Text style={styles.title}>Connexion</Text>

        <Text style={styles.label}>Identifiant</Text>
        <View style={[styles.field, focused === 'identifier' && styles.fieldOn]}>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onBlur={() => setFocused((current) => (current === 'identifier' ? null : current))}
            onChangeText={setIdentifier}
            onFocus={() => setFocused('identifier')}
            onSubmitEditing={() => void enter()}
            placeholder="identifiant universitaire"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
            textContentType="username"
            value={identifier}
          />
        </View>

        <Text style={styles.label}>Mot de passe</Text>
        <View style={[styles.field, focused === 'password' && styles.fieldOn]}>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onBlur={() => setFocused((current) => (current === 'password' ? null : current))}
            onChangeText={setPassword}
            onFocus={() => setFocused('password')}
            onSubmitEditing={() => void enter()}
            placeholder="••••••••"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry={hidden}
            style={styles.input}
            textContentType="password"
            value={password}
          />
          <Pressable accessibilityRole="button" accessibilityLabel={hidden ? 'Afficher le mot de passe' : 'Masquer le mot de passe'} hitSlop={8} onPress={() => setHidden((current) => !current)}>
            <Icon name={hidden ? { ios: 'eye', android: 'visibility' } : { ios: 'eye.slash', android: 'visibility_off' }} color={colors.textSecondary} size={18} />
          </Pressable>
        </View>

        <Pressable accessibilityRole="link" onPress={() => setNotice('forgot')} style={styles.forgot}>
          <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
        </Pressable>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable accessibilityRole="button" disabled={pending} onPress={() => void enter()} style={({ pressed }) => [styles.login, pressed && styles.pressed, pending && styles.pressed]}>
          <Text style={styles.loginText}>{pending ? 'Connexion…' : 'Se connecter'}</Text>
        </Pressable>

        <Text style={styles.account}>
          Pas encore de compte ?{' '}
          <Text onPress={() => setNotice('register')} style={styles.register}>Inscription</Text>
        </Text>

        <View style={styles.dev}>
          <Text style={styles.devTitle}>Comptes de démonstration</Text>
          {developmentLogins.map((item) => (
            <Pressable
              accessibilityRole="button"
              key={item.login}
              onPress={() => {
                setIdentifier(item.login);
                setPassword(item.password);
                void enter(item.login, item.password);
              }}
              style={({ pressed }) => [styles.devButton, pressed && styles.pressed]}
            >
              <Text style={styles.devRole}>{item.role}</Text>
              <Text style={styles.devCredential}>{item.login} · {item.password}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <AppModal message={currentNotice?.message ?? ''} onClose={() => setNotice(null)} title={currentNotice?.title ?? ''} visible={notice !== null} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background, overflow: 'hidden' },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: layout.content,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
  },
  brand: { marginTop: spacing.lg, textAlign: 'center', color: colors.textSecondary, fontSize: 13, lineHeight: 18, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  title: { marginTop: spacing.sm, marginBottom: spacing.xl, textAlign: 'center', color: colors.text, fontSize: 32, lineHeight: 38, fontWeight: '700', letterSpacing: -0.5 },
  label: { color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: spacing.sm },
  field: {
    minHeight: 52,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  input: { flex: 1, color: colors.text, fontSize: 15, paddingVertical: 14 },
  fieldOn: { borderColor: colors.primary },
  forgot: { alignSelf: 'flex-end', marginTop: -4, marginBottom: spacing.lg },
  forgotText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  error: { color: colors.error, fontSize: 13, lineHeight: 18, marginTop: -8, marginBottom: spacing.md },
  login: {
    minHeight: 54,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: { color: colors.onPrimary, fontSize: 17, fontWeight: '700' },
  pressed: { opacity: 0.85 },
  account: { marginTop: spacing.lg, textAlign: 'center', color: colors.textSecondary, fontSize: 14 },
  register: { color: colors.primary, fontWeight: '700' },
  dev: { marginTop: spacing.lg, gap: spacing.sm },
  devTitle: { color: colors.textSecondary, fontSize: 12, fontWeight: '700', textAlign: 'center', marginBottom: spacing.xs },
  devButton: { borderRadius: radius.md, borderCurve: 'continuous', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, gap: 2 },
  devRole: { color: colors.text, fontSize: 14, fontWeight: '700' },
  devCredential: { color: colors.textSecondary, fontSize: 12 },
});
