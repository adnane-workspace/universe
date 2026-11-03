import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import { colors, motion, radius, spacing } from '@/constants/theme';

const variants = {
  primary: { backgroundColor: colors.primary, color: colors.onPrimary, borderColor: colors.primary },
  secondary: { backgroundColor: colors.primaryLight, color: colors.primary, borderColor: colors.primaryLight },
  ghost: { backgroundColor: colors.surface, color: colors.primary, borderColor: colors.border },
  outline: { backgroundColor: colors.surface, color: colors.primary, borderColor: colors.border },
  success: { backgroundColor: colors.success, color: colors.onPrimary, borderColor: colors.success },
} as const;

const sizes = {
  sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, fontSize: 13 },
  md: { paddingVertical: 14, paddingHorizontal: spacing.md, fontSize: 15 },
} as const;

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading = false,
  icon,
  style,
}: {
  title: string;
  onPress?: () => void;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const [pressed, setPressed] = useState(false);
  const reduced = useReducedMotion() === true;
  const palette = variants[variant];
  const metrics = sizes[size];
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      hitSlop={size === 'sm' ? 8 : 0}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      pressRetentionOffset={16}
      style={style}
    >
      <Animated.View
        style={[
          styles.base,
          {
            backgroundColor: palette.backgroundColor,
            borderColor: palette.borderColor,
            paddingVertical: metrics.paddingVertical,
            paddingHorizontal: metrics.paddingHorizontal,
            opacity: inactive ? 0.45 : 1,
          },
          pressMotion,
          pressed && !reduced && !inactive ? { transform: [{ scale: 0.98 }], backgroundColor: variant === 'primary' ? colors.primaryDark : palette.backgroundColor } : null,
          pressed && reduced ? styles.pressedReduced : null,
        ]}
      >
        {loading ? <ActivityIndicator color={palette.color} size="small" /> : null}
        <Text style={{ color: palette.color, fontSize: metrics.fontSize, fontWeight: '600' }}>{title}</Text>
        {loading ? null : icon}
      </Animated.View>
    </Pressable>
  );
}

const pressMotion = {
  transform: [{ scale: 1 }],
  transitionProperty: 'transform',
  transitionDuration: `${motion.press}ms`,
};

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  pressedReduced: { opacity: 0.72 },
});
