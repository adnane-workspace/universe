import { StyleSheet, View } from 'react-native';

import { Icon, type SymbolName } from '@/components/Icon';
import { colors, radius } from '@/constants/theme';

export function CourseMark({ course, onPrimary = false }: { course: string; onPrimary?: boolean }) {
  return (
    <View style={[styles.mark, onPrimary && styles.onPrimary]}>
      <Icon name={iconForCourse(course)} color={onPrimary ? colors.onPrimary : colors.primary} size={18} />
    </View>
  );
}

function iconForCourse(course: string): SymbolName {
  const name = course.toLowerCase();
  if (name.includes('réseau') || name.includes('reseau')) return { ios: 'wifi', android: 'wifi' };
  if (name.includes('donnée') || name.includes('donnee') || name.includes('base')) return { ios: 'externaldrive', android: 'storage' };
  if (name.includes('algo')) return { ios: 'function', android: 'function' };
  return { ios: 'chevron.left.forwardslash.chevron.right', android: 'code' };
}

const styles = StyleSheet.create({
  mark: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onPrimary: { backgroundColor: 'rgba(255,255,255,0.18)' },
});
