import { View, type ColorValue } from 'react-native';

import { Icon, type SymbolName } from '@/components/Icon';
import { colors } from '@/constants/theme';

export function TabIcon({ color, name, focused = false, size = 20 }: { color: ColorValue; name: SymbolName; focused?: boolean; size?: number }) {
  const tint = focused ? colors.primary : colors.textSecondary;
  const passed = typeof color === 'string' ? color : tint;

  return (
    <View
      style={{
        width: 44,
        height: 26,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: focused ? colors.primaryLight : 'transparent',
      }}
    >
      <Icon color={focused ? colors.primary : passed} name={name} size={size} />
    </View>
  );
}
