import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { Icon } from '@/components/Icon';
import { colors, radius } from '@/constants/theme';
import { useSession } from '@/context/session';

export function SignOutButton() {
  const { signOut } = useSession();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Se déconnecter"
      hitSlop={8}
      onPress={() => {
        signOut();
        router.replace('/');
      }}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Icon name={{ ios: 'rectangle.portrait.and.arrow.right', android: 'logout' }} color={colors.textSecondary} size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderCurve: 'continuous',
  },
  pressed: { backgroundColor: colors.primaryLight },
});
