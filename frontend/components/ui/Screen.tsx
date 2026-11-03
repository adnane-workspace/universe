import type { ReactNode } from 'react';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, layout, motion, spacing } from '@/constants/theme';

export function Screen({
  children,
  header,
  footer,
  keyboard = false,
  inTabs = false,
}: {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  keyboard?: boolean;
  inTabs?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion() === true;

  return (
    <KeyboardAvoidingView style={[styles.page, styles.clip]} behavior={Platform.OS === 'ios' ? 'padding' : undefined} enabled={keyboard}>
      <StatusBar style="dark" />
      {header ? (
        <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
          <View style={styles.frame}>{header}</View>
        </View>
      ) : null}
      <ScrollView
        style={styles.page}
        contentContainerStyle={[
          styles.frame,
          styles.content,
          { paddingTop: header ? spacing.lg : insets.top + spacing.lg, paddingBottom: inTabs ? spacing.xl : insets.bottom + spacing.lg },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={reduced ? undefined : FadeIn.duration(motion.enter)} style={styles.body}>
          {children}
        </Animated.View>
      </ScrollView>
      {footer ? (
        <View style={[styles.footer, { paddingBottom: inTabs ? spacing.sm : Math.max(insets.bottom, spacing.sm) }]}>
          <View style={styles.frame}>{footer}</View>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  clip: { overflow: 'hidden' },
  header: {
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingBottom: spacing.md,
    zIndex: 2,
  },
  frame: {
    width: '100%',
    maxWidth: layout.content,
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
  },
  content: { flexGrow: 1 },
  body: { width: '100%', gap: spacing.lg },
  footer: {
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
});
