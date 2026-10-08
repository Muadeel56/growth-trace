import type { FastifyPluginCallbackTypebox } from '@fastify/type-provider-typebox';
import { Type, type Static } from 'typebox';

/**
 * Liveness payload. `source` tells the frontend which backend answered: the real API says
 * `api`, the Playwright stub (e2e/fixtures/routes/health.json) says `fixture`. Both must
 * validate against this schema; app.test.ts checks the fixture.
 */
export const HealthResponse = Type.Object(
  {
    status: Type.Literal('ok', { description: 'Always `ok` when the process can serve requests.' }),
    source: Type.Union([Type.Literal('api'), Type.Literal('fixture')], {
      description: 'Which backend answered: the real API or the Playwright stub.',
    }),
  },
  { description: 'The API process is up.', additionalProperties: false },
);

export const healthRoutes: FastifyPluginCallbackTypebox = (app, _options, done) => {
  app.get(
    '/health',
    {
      schema: {
        summary: 'Liveness check',
        description:
          'Returns `ok` when the API process is up. Does not check Postgres, Redis or Ollama.',
        tags: ['system'],
        response: { 200: HealthResponse },
      },
    },
    (): Static<typeof HealthResponse> => ({ status: 'ok', source: 'api' }),
  );
  done();
};
