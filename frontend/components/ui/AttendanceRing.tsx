import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/theme';

export function AttendanceRing({
  value,
  size = 92,
  onPrimary = false,
}: {
  value: number;
  size?: number;
  onPrimary?: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const stroke = Math.max(7, Math.round(size * 0.09));
  const track = onPrimary ? 'rgba(255,255,255,0.28)' : colors.primaryLight;
  const ink = onPrimary ? colors.onPrimary : colors.primary;
  const filled = Math.round((clamped / 100) * 4);

  return (
    <View accessibilityLabel={`Assiduité ${clamped} pour cent`} style={[styles.wrap, { width: size, height: size }]}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: stroke,
          borderColor: track,
          borderTopColor: filled > 0 ? ink : track,
          borderRightColor: filled > 1 ? ink : track,
          borderBottomColor: filled > 2 ? ink : track,
          borderLeftColor: filled > 3 ? ink : track,
          transform: [{ rotate: '45deg' }],
        }}
      />
      <View style={styles.center}>
        <Text style={[styles.value, { color: ink, fontSize: Math.round(size * 0.26) }]}>{clamped}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  center: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  value: { fontWeight: '700', letterSpacing: -0.4 },
});
