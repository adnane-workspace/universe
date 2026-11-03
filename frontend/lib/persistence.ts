import { Platform } from 'react-native';

if (Platform.OS !== 'web') {
  require('expo-sqlite/localStorage/install');
}

export function readJson<T>(key: string): T | null {
  try {
    const raw = globalThis.localStorage?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeJson(key: string, value: unknown) {
  try {
    globalThis.localStorage?.setItem(key, JSON.stringify(value));
  } catch {
    // L'état reste en mémoire si le stockage de l'appareil refuse l'écriture.
  }
}
