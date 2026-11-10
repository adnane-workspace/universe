import { Application } from './api/Application.ts';
import { AuthService } from './services/AuthService.ts';
import { BaseDeDonnees } from './services/BaseDeDonnees.ts';

const base = new BaseDeDonnees();
await base.ouvrir();
const auth = new AuthService(base);
const port = Number(process.env.PORT ?? 3001);
new Application(base, auth).express().listen(port, '0.0.0.0', () => {
  console.log(`Presencia API sur http://localhost:${port}`);
});
