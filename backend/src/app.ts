import swagger from '@fastify/swagger';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import Fastify, { type FastifyServerOptions } from 'fastify';

import pkg from '../package.json' with { type: 'json' };
import { healthRoutes } from './routes/health.js';

/**
 * Builds the Fastify app without listening, so tests (`app.inject`) and the API-docs
 * generator (`app.swagger()`) get exactly the routes the server serves.
 *
 * Every route must declare `schema.response`: the OpenAPI document and
 * docs/api/endpoints.md are generated from those schemas, so a route without one would be
 * undocumented. Registration throws instead of letting that slip through.
 */
export async function buildApp(options: FastifyServerOptions = {}) {
  const app = Fastify(options).withTypeProvider<TypeBoxTypeProvider>();

  app.addHook('onRoute', (route) => {
    if (route.schema?.hide) return;
    if (!route.schema?.response) {
      const methods = Array.isArray(route.method) ? route.method.join(',') : route.method;
      throw new Error(`Route ${methods} ${route.url} has no schema.response; see docs/api.`);
    }
  });

  await app.register(swagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'GrowthTrace API',
        version: pkg.version,
        description: 'Generated from the Fastify route schemas by `npm run docs:api`.',
      },
      tags: [{ name: 'system', description: 'Process health and metadata' }],
    },
  });

  await app.register(healthRoutes);

  return app;
}
