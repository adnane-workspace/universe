# Stack — UniPresence

Application mobile de gestion des absences. L’interface et l’API sont deux projets dans le même dépôt, lancés avec pnpm.

## Frontend

| | |
| --- | --- |
| Application | Expo SDK 58, React Native 0.88 |
| Interface | React 19.3, React Native Web |
| Navigation | Expo Router 58 (fichiers dans `frontend/app/`) |
| Langage | TypeScript 6 |
| Animation | React Native Reanimated |
| Session | Expo Secure Store |
| Tests | `node:test` sur `frontend/lib/domain.test.ts` |

Écrans par rôle : étudiant, enseignant, administration. Le thème est dans `frontend/constants/theme.ts`.

## Backend

| | |
| --- | --- |
| Runtime | Node.js, modules ES, TypeScript exécuté avec `--experimental-strip-types` |
| API | Express 4, CORS, port **3001** |
| Données | SQLite (`backend/data/unipresence.db`) via Drizzle ORM et libSQL |
| Modèle | Classes dans `backend/src/modeles/` |
| Mots de passe | scrypt (`node:crypto`), sel et empreinte stockés ensemble |
| Session | jeton opaque en base (`auth_tokens`) |

L’API écoute sur `0.0.0.0`. Le frontend appelle `EXPO_PUBLIC_API_URL`, sinon `http://localhost:3001` sur le web, ou l’hôte Metro sur le téléphone.

## Lancer

```bash
pnpm server
pnpm start
```

Utiliser **`pnpm start`** (CLI Expo locale dans `frontend/`). Éviter `npx expo start` à la racine : l’ancien `expo-cli` global et le mauvais dossier provoquent des erreurs.

`pnpm test` exécute les tests du domaine côté frontend. `pnpm typecheck` vérifie le TypeScript frontend.
s   