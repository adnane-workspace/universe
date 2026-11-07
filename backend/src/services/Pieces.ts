import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const types = new Map([
  ['application/pdf', 'pdf'],
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
]);

const maximum = 2 * 1024 * 1024;

export type PieceRecue = { name: string; type: string; bytes: Buffer };

export function lirePiece(valeur: unknown): PieceRecue | { erreur: string } | null {
  if (valeur == null) return null;
  if (typeof valeur !== 'object') return { erreur: 'Le fichier joint est illisible.' };
  const brut = valeur as { name?: unknown; mime?: unknown; data?: unknown };
  const mime = typeof brut.mime === 'string' ? brut.mime : '';
  const extension = types.get(mime);
  if (!extension) return { erreur: 'Le fichier doit être un PDF, un JPEG ou un PNG.' };
  if (typeof brut.data !== 'string' || brut.data.length === 0) return { erreur: 'Le fichier joint est vide.' };
  const bytes = Buffer.from(brut.data, 'base64');
  if (bytes.length === 0 || bytes.length > maximum) return { erreur: 'Le fichier doit faire moins de 2 Mo.' };
  const recu = typeof brut.name === 'string' ? brut.name : '';
  const nom = recu.replace(/[^\w.\- ()]/g, '').slice(0, 80);
  return { name: nom || `justificatif.${extension}`, type: mime, bytes };
}

export class Pieces {
  private readonly dossier: string;

  constructor() {
    const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
    this.dossier = path.join(root, 'data', 'pieces');
  }

  ecrire(id: string, bytes: Buffer) {
    if (!/^[\w-]+$/.test(id)) return false;
    mkdirSync(this.dossier, { recursive: true });
    writeFileSync(path.join(this.dossier, id), bytes);
    return true;
  }

  lire(id: string) {
    if (!/^[\w-]+$/.test(id)) return null;
    try {
      return readFileSync(path.join(this.dossier, id));
    } catch {
      return null;
    }
  }
}
