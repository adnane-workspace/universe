import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { apiBase } from '@/lib/api';
import { readSessionId } from '@/lib/session-store';

export type PieceJointe = { name: string; mime: string; data: string };

const types = new Map([
  ['pdf', 'application/pdf'],
  ['jpg', 'image/jpeg'],
  ['jpeg', 'image/jpeg'],
  ['png', 'image/png'],
]);

const maximum = 2 * 1024 * 1024;

export async function choisirPiece(): Promise<PieceJointe | string | null> {
  const resultat = await DocumentPicker.getDocumentAsync({
    type: ['application/pdf', 'image/jpeg', 'image/png'],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (resultat.canceled || !resultat.assets[0]) return null;
  const fichier = resultat.assets[0];
  const mime = typeDuFichier(fichier.mimeType, fichier.name);
  if (!mime) return 'Le fichier doit être un PDF, un JPEG ou un PNG.';
  if ((fichier.size ?? 0) > maximum) return 'Le fichier doit faire moins de 2 Mo.';
  const octets = fichier.file ? new Uint8Array(await fichier.file.arrayBuffer()) : new Uint8Array(await (await fetch(fichier.uri)).arrayBuffer());
  if (octets.byteLength === 0 || octets.byteLength > maximum) return 'Le fichier doit faire moins de 2 Mo.';
  return { name: fichier.name, mime, data: versBase64(octets) };
}

export async function ouvrirPiece(absenceId: string, name: string) {
  const token = await readSessionId();
  const response = await fetch(`${apiBase()}/attendance/justifications/${encodeURIComponent(absenceId)}/file`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error('Le fichier est introuvable.');
  const mime = response.headers.get('Content-Type') ?? 'application/octet-stream';
  if (Platform.OS === 'web') {
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const lien = document.createElement('a');
    lien.href = url;
    lien.download = name;
    lien.target = '_blank';
    lien.rel = 'noopener';
    document.body.appendChild(lien);
    lien.click();
    lien.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    return;
  }
  const octets = new Uint8Array(await response.arrayBuffer());
  const fichier = new File(Paths.cache, nomSur(name));
  await fichier.write(octets);
  await Sharing.shareAsync(fichier.uri, { mimeType: mime, dialogTitle: name });
}

function typeDuFichier(mime: string | undefined, name: string) {
  if (mime === 'image/jpg') return 'image/jpeg';
  if (mime && [...types.values()].includes(mime)) return mime;
  const extension = name.split('.').pop()?.toLowerCase() ?? '';
  return types.get(extension) ?? '';
}

function versBase64(octets: Uint8Array) {
  let binaire = '';
  const pas = 0x8000;
  for (let index = 0; index < octets.length; index += pas) {
    binaire += String.fromCharCode(...octets.subarray(index, index + pas));
  }
  return btoa(binaire);
}

function nomSur(name: string) {
  const propre = name.replace(/[^\w.\- ()]/g, '').slice(0, 80);
  return propre || 'justificatif';
}
