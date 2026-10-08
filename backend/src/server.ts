import { buildApp } from './app.js';

/** Local entrypoint: `npm run dev -w @growthtrace/backend`. Port matches API_BASE_URL in .env.example. */
const app = await buildApp({ logger: true });
await app.listen({ host: '0.0.0.0', port: Number(process.env.PORT ?? 4000) });
