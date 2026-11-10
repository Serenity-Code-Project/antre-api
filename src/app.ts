import type { Database } from 'bun:sqlite';
import { timingSafeEqual } from 'node:crypto';
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { cors } from 'hono/cors';

import { callNext, readState, takeNumber } from './queue.ts';

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
    200: { description: 'The service is up', content: { 'application/json': { schema: z.object({ ok: z.boolean(), service: z.string() }) } } },
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

const ErrorSchema = z.object({ error: z.string() }).openapi('Error');

/* Staff call the next number. The key travels in a header and is never part of the code. */
const callNextRoute = createRoute({
  method: 'post',
  path: '/call-next',
  operationId: 'callNext',
  security: [{ staffKey: [] }],
  responses: {
    200: { description: 'The ticket that is now on the board', content: { 'application/json': { schema: TicketSchema } } },
    401: { description: 'The staff key is missing or wrong', content: { 'application/json': { schema: ErrorSchema } } },
    409: { description: 'Nobody is waiting', content: { 'application/json': { schema: ErrorSchema } } },
  },
});

/** True only when a staff key is configured and the given key matches it. */
function isStaff(given: string | undefined, staffKey: string | undefined): boolean {
  if (!staffKey || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(staffKey);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const SPEC_INFO = { openapi: '3.1.0', info: { title: 'Antre API', version: '0.1.0' } };

export function createApp(db: Database, webOrigin: string, staffKey?: string): OpenAPIHono {
  const app = new OpenAPIHono();
  app.use('*', cors({ origin: webOrigin }));

  app.openapi(healthRoute, (c) => c.json({ ok: true, service: 'antre-api' }, 200));
  app.openapi(takeNumberRoute, (c) => c.json(takeNumber(db), 201));
  app.openapi(readStateRoute, (c) => c.json(readState(db), 200));
  app.openAPIRegistry.registerComponent('securitySchemes', 'staffKey', { type: 'apiKey', in: 'header', name: 'x-staff-key' });
  app.openapi(callNextRoute, (c) => {
    if (!isStaff(c.req.header('x-staff-key'), staffKey)) return c.json({ error: 'staff key required' }, 401);
    const ticket = callNext(db);
    if (!ticket) return c.json({ error: 'nobody is waiting' }, 409);
    return c.json(ticket, 200);
  });
  app.doc31('/openapi.json', SPEC_INFO);

  return app;
}
