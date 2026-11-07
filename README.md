# UniPresence — Gestion des absences

Application mobile (Expo) + API REST (Express, SQLite) pour la gestion des absences universitaires.

## Structure

| Dossier | Rôle |
| --- | --- |
| `frontend/` | Expo SDK 58, Expo Router, interface par rôle |
| `backend/` | API sur le port **3001**, données SQLite (`backend/data/`, ignoré par git) |

Documentation technique : [STACK.md](./STACK.md).

## Prérequis

- Node.js **≥ 22.13**
- [pnpm](https://pnpm.io/) via Corepack : `corepack enable`

## Lancer (Expo Go)

Depuis la racine du dépôt :

```bash
pnpm server   # terminal 1 — API
pnpm start    # terminal 2 — Metro / QR code
```

**Ne pas** utiliser `npx expo start` à la racine : l’app Expo est dans `frontend/`. Utilisez toujours `pnpm start`.

Sur le téléphone : **Expo Go**, même réseau Wi‑Fi que le PC, scanner le QR ou ouvrir *Gestion des absences* dans *Development servers*.

Si le réseau bloque la connexion, dans le terminal Expo : touche **`s`** (tunnel), puis rescanner.

## Comptes de démonstration

Les boutons *Accès de développement* sur l’écran de connexion remplissent identifiant et mot de passe (phase dev).

## Scripts

| Commande | Action |
| --- | --- |
| `pnpm start` | Dev server Expo |
| `pnpm server` | API backend |
| `pnpm test` | Tests domaine (`frontend/lib/domain.test.ts`) |
| `pnpm typecheck` | TypeScript frontend |
| `pnpm lint` | ESLint (`frontend/`) |

## Livrables académiques

Diagrammes UML, TP Scrum et présentation PowerPoint à la racine du dépôt.
