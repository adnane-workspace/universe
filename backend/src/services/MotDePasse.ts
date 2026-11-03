import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export class MotDePasse {
  empreinte(clair: string) {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(clair, salt, 32).toString('hex');
    return `${salt}:${hash}`;
  }

  verifie(clair: string, stocke: string) {
    const [salt, hash] = stocke.split(':');
    if (!salt || !hash) return false;
    const actuel = scryptSync(clair, salt, 32);
    const attendu = Buffer.from(hash, 'hex');
    if (attendu.length !== actuel.length) return false;
    return timingSafeEqual(attendu, actuel);
  }

  jeton() {
    return randomBytes(32).toString('hex');
  }
}
