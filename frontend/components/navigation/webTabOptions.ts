import { createElement } from 'react';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, shadows } from '@/constants/theme';

function TabLabel({
  color,
  children,
}: {
  focused: boolean;
  color: unknown;
  position: 'beside-icon' | 'below-icon';
  children: string;
}) {
  const long = children.length > 10;
  const tint = typeof color === 'string' ? color : colors.textSecondary;

  return createElement(
    Text,
    {
      allowFontScaling: false,
      numberOfLines: 1,
      style: {
        color: tint,
        fontSize: long ? 10 : 11,
        lineHeight: 13,
        fontWeight: '600',
        letterSpacing: long ? -0.4 : 0,
        textAlign: 'center',
        width: '100%',
      },
    },
    children,
  );
}

export function useWebTabOptions() {
  const bottom = useSafeAreaInsets().bottom;

  return {
    headerShown: false as const,
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.textSecondary,
    sceneStyle: {
      paddingBottom: 64 + bottom,
    },
    tabBarStyle: {
      position: 'absolute' as const,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      height: 64 + bottom,
      paddingTop: 6,
      paddingBottom: 8 + bottom,
      paddingHorizontal: 0,
      ...shadows.bar,
    },
    tabBarLabel: TabLabel,
    tabBarItemStyle: {
      paddingTop: 0,
      paddingBottom: 0,
      paddingHorizontal: 2,
      minWidth: 0,
    },
    tabBarBadgeStyle: {
      backgroundColor: colors.error,
      color: colors.onPrimary,
      fontSize: 11,
      fontWeight: '700' as const,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 2,
      borderColor: colors.surface,
      top: 4,
    },
  };
}
