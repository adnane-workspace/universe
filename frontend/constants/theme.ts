import type { TextStyle, ViewStyle } from 'react-native';

export const colors = {
  primary: '#800020',
  primaryDark: '#5C0017',
  primaryLight: '#F8E8EE',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  onPrimary: '#FFFFFF',
  successSoft: '#ECFDF5',
  warningSoft: '#FFFBEB',
  errorSoft: '#FEF2F2',
  warningText: '#92400E',
} as const;

/** Noms déjà utilisés dans les écrans, alignés sur la palette. */
export const theme = {
  ...colors,
  page: colors.background,
  card: colors.surface,
  ink: colors.text,
  muted: colors.textSecondary,
  faint: '#94A3B8',
  line: colors.border,
  primarySoft: colors.primaryLight,
  navy: colors.primaryDark,
  green: colors.success,
  greenSoft: colors.successSoft,
  amber: colors.warning,
  amberSoft: colors.warningSoft,
  red: colors.error,
  redSoft: colors.errorSoft,
  shadow: colors.text,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

export const type = {
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700', letterSpacing: -0.4, color: colors.text },
  section: { fontSize: 18, lineHeight: 24, fontWeight: '600', letterSpacing: -0.2, color: colors.text },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400', color: colors.text },
  bodyStrong: { fontSize: 16, lineHeight: 24, fontWeight: '600', color: colors.text },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '600', color: colors.text },
  secondary: { fontSize: 14, lineHeight: 20, fontWeight: '400', color: colors.textSecondary },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500', color: colors.textSecondary },
} as const satisfies Record<string, TextStyle>;

export const shadows = {
  card: {
    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
  },
  raised: {
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
  },
  header: {
    boxShadow: 'none',
  },
  bar: {
    boxShadow: '0 -1px 0 rgba(15, 23, 42, 0.04)',
  },
} as const satisfies Record<string, ViewStyle>;

export const motion = {
  press: 120,
  enter: 180,
} as const;

/** Largeur de la colonne de contenu, partagée par le bandeau et le corps. */
export const layout = {
  content: 560,
} as const;
