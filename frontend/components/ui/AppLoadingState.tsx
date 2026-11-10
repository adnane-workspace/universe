import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { colors, layout, radius, spacing, type } from '@/constants/theme';

export function AppLoadingState({ message = 'Ouverture de votre espace' }: { message?: string }) {
  const reduced = useReducedMotion() === true;

  return (
    <View style={styles.page}>
      <View style={styles.column}>
        <Text style={styles.brand}>Presencia</Text>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.stack}>
          <Bar reduced={reduced} width="72%" />
          <Bar reduced={reduced} width="100%" />
          <Bar reduced={reduced} width="100%" tall />
        </View>
      </View>
    </View>
  );
}

function Bar({ reduced, width, tall }: { reduced: boolean; width: `${number}%`; tall?: boolean }) {
  const opacity = useSharedValue(reduced ? 1 : 0.45);

  useEffect(() => {
    if (reduced) return;
    opacity.set(withRepeat(withTiming(1, { duration: 700, easing: Easing.linear }), -1, true));
  }, [opacity, reduced]);

  const animated = useAnimatedStyle(() => ({ opacity: opacity.get() }));

  return <Animated.View style={[styles.bar, { width, height: tall ? 96 : 18 }, animated]} />;
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  column: {
    width: '100%',
    maxWidth: layout.content,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  brand: { ...type.section, color: colors.primary },
  message: type.secondary,
  stack: { marginTop: spacing.md, gap: spacing.md },
  bar: { borderRadius: radius.md, backgroundColor: colors.primaryLight },
});
