import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { Icon } from '@/components/Icon';
import { colors, radius, spacing, type } from '@/constants/theme';

export function AppInput({
  label,
  error,
  secure,
  style,
  ...props
}: TextInputProps & {
  label: string;
  error?: string;
  secure?: boolean;
}) {
  const [hidden, setHidden] = useState(true);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.wrap, props.multiline ? styles.wrapMulti : null, focused && !error ? styles.wrapFocus : null, error ? styles.wrapError : null]}>
        <TextInput
          placeholderTextColor={colors.textSecondary}
          {...props}
          onBlur={(event) => {
            setFocused(false);
            props.onBlur?.(event);
          }}
          onFocus={(event) => {
            setFocused(true);
            props.onFocus?.(event);
          }}
          secureTextEntry={secure ? hidden : props.secureTextEntry}
          style={[styles.input, secure ? styles.inputSecure : null, props.multiline ? styles.inputMulti : null, style]}
        />
        {secure ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Afficher le mot de passe' : 'Masquer le mot de passe'}
            hitSlop={8}
            onPress={() => setHidden((current) => !current)}
            style={styles.eye}
          >
            <Icon
              name={hidden ? { ios: 'eye', android: 'visibility' } : { ios: 'eye.slash', android: 'visibility_off' }}
              color={colors.textSecondary}
              size={18}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.sm },
  label: type.label,
  wrap: {
    minHeight: 52,
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderCurve: 'continuous',
  },
  wrapFocus: { borderColor: colors.primary },
  wrapError: { borderColor: colors.error },
  wrapMulti: { minHeight: 96, alignItems: 'stretch' },
  input: {
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  inputSecure: { paddingRight: 48 },
  inputMulti: { minHeight: 96, textAlignVertical: 'top' },
  eye: { position: 'absolute', right: spacing.sm, padding: spacing.sm },
  error: { color: colors.error, fontSize: 13, lineHeight: 18 },
});
