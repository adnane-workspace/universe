import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEY = 'unipresence.user';

export async function readSessionId() {
  try {
    if (Platform.OS === 'web') {
      return globalThis.localStorage?.getItem(KEY) ?? null;
    }
    return await SecureStore.getItemAsync(KEY);
  } catch {
    return null;
  }
}

export async function writeSessionId(id: string) {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(KEY, id);
    return;
  }
  await SecureStore.setItemAsync(KEY, id);
}

export async function clearSessionId() {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(KEY);
    return;
  }
  await SecureStore.deleteItemAsync(KEY);
}
