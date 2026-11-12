import type { Database } from 'bun:sqlite';
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { cors } from 'hono/cors';
import { requestId } from 'hono/request-id';

import { readState, takeNumber } from './queue.ts';

const TicketSchema = z
  .object({
    id: z.number().int(),
    number: z.number().int(),
    day: z.string(),
    status: z.enum(['waiting', 'called']),
    createdAt: z.string(),
  })
  .openapi('Ticket');

const QueueStateSchema = z
  .object({
    day: z.string(),
    current: z.number().int().nullable(),
    waiting: z.number().int(),
    next: z.array(z.number().int()).max(5),
  })
  .openapi('QueueState');

const healthRoute = createRoute({
  method: 'get',
  path: '/health',
  operationId: 'getHealth',
  responses: {
    200: { description: 'The service is up', content: { 'application/json': { schema: z.object({ ok: z.boolean() }) } } },
  },
});

/* A visitor takes a number. */
const takeNumberRoute = createRoute({
  method: 'post',
  path: '/tickets',
  operationId: 'takeNumber',
  responses: {
    201: { description: 'The ticket given to the visitor', content: { 'application/json': { schema: TicketSchema } } },
  },
});

/* The display board reads this every few seconds. */
const readStateRoute = createRoute({
  method: 'get',
  path: '/state',
  operationId: 'readState',
  responses: {
    200: { description: 'What the display board shows', content: { 'application/json': { schema: QueueStateSchema } } },
  },
});

export const SPEC_INFO = { openapi: '3.1.0', info: { title: 'Antre API', version: '0.1.0' } };

export function createApp(db: Database, webOrigin: string): OpenAPIHono {
  const app = new OpenAPIHono();
  /* Every request gets an id, or keeps the X-Request-Id the client sent, and the id goes back in the response header. */
  app.use('*', requestId());
  /* One JSON line per request. Never the body, and no header except the request id. */
  app.use('*', async (c, next) => {
    const start = performance.now();
    await next();
    console.log(
      JSON.stringify({
        requestId: c.get('requestId'),
        method: c.req.method,
        path: c.req.path,
        status: c.res.status,
        ms: Math.round(performance.now() - start),
      }),
    );
  });
  app.use('*', cors({ origin: webOrigin }));

  app.openapi(healthRoute, (c) => c.json({ ok: true }, 200));
  app.openapi(takeNumberRoute, (c) => c.json(takeNumber(db), 201));
  app.openapi(readStateRoute, (c) => c.json(readState(db), 200));
  app.doc31('/openapi.json', SPEC_INFO);

  return app;
}
