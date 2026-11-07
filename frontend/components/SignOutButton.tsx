import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { Icon } from '@/components/Icon';
import { colors } from '@/constants/theme';
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
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.6 },
});
