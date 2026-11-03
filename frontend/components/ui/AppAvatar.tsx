import { StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '@/constants/theme';

export function AppAvatar({ initials, size = 44, onDark = false }: { initials: string; size?: number; onDark?: boolean }) {
  return (
    <View style={[styles.avatar, onDark && styles.onDark, { width: size, height: size, borderRadius: onDark ? size / 2 : radius.md }]}>
      <Text style={[styles.text, { fontSize: size > 40 ? 15 : 13 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  onDark: { backgroundColor: '#FFFFFF' },
  text: { color: colors.primary, fontWeight: '700' },
});
