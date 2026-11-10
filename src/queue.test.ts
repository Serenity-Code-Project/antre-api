import { describe, expect, test } from 'bun:test';

import { createApp } from './app.ts';
import { callNext, openQueue, readState, takeNumber } from './queue.ts';

describe('takeNumber', () => {
  test('gives out a ticket', () => {
    const db = openQueue();
    const ticket = takeNumber(db);
    expect(ticket).toBeTruthy();
  });

  test('counts up within a day', () => {
    const db = openQueue();
    const noon = new Date('2026-03-02T05:00:00.000Z');
    expect(takeNumber(db, noon).number).toBe(1);
    expect(takeNumber(db, noon).number).toBe(2);
  });
});

describe('readState', () => {
  test('lists who is waiting', () => {
    const db = openQueue();
    const noon = new Date('2026-03-02T05:00:00.000Z');
    takeNumber(db, noon);
    takeNumber(db, noon);
    expect(readState(db, noon)).toEqual({ day: '2026-03-02', current: null, waiting: 2, next: [1, 2] });
  });
});

describe('callNext', () => {
  const noon = new Date('2026-03-02T05:00:00.000Z');

  test('calls the smallest waiting number and moves the board', () => {
    const db = openQueue();
    takeNumber(db, noon);
    takeNumber(db, noon);
    expect(callNext(db, noon)?.number).toBe(1);
    expect(readState(db, noon)).toEqual({ day: '2026-03-02', current: 1, waiting: 1, next: [2] });
  });

  test('never calls the same number twice', () => {
    const db = openQueue();
    takeNumber(db, noon);
    takeNumber(db, noon);
    const called = [callNext(db, noon)?.number, callNext(db, noon)?.number];
    expect(called).toEqual([1, 2]);
  });

  test('returns null and changes nothing when nobody is waiting', () => {
    const db = openQueue();
    expect(callNext(db, noon)).toBeNull();
    expect(readState(db, noon)).toEqual({ day: '2026-03-02', current: null, waiting: 0, next: [] });
  });
});

describe('POST /call-next', () => {
  const KEY = 'test-staff-key';
  const call = (app: ReturnType<typeof createApp>, key?: string) =>
    app.request('/call-next', { method: 'POST', headers: key ? { 'x-staff-key': key } : {} });

  test('answers 401 without a staff key', async () => {
    const app = createApp(openQueue(), 'http://localhost:3000', KEY);
    expect((await call(app)).status).toBe(401);
  });

  test('answers 401 with a wrong staff key', async () => {
    const app = createApp(openQueue(), 'http://localhost:3000', KEY);
    expect((await call(app, 'wrong-key')).status).toBe(401);
  });

  test('answers 401 for every key when no staff key is configured', async () => {
    const app = createApp(openQueue(), 'http://localhost:3000');
    expect((await call(app, KEY)).status).toBe(401);
  });

  test('calls the next number with the right key', async () => {
    const app = createApp(openQueue(), 'http://localhost:3000', KEY);
    await app.request('/tickets', { method: 'POST' });
    const response = await call(app, KEY);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ number: 1, status: 'called' });
  });

  test('answers 409 when nobody is waiting', async () => {
    const app = createApp(openQueue(), 'http://localhost:3000', KEY);
    expect((await call(app, KEY)).status).toBe(409);
  });

  test('two calls at the same moment get two different numbers', async () => {
    const app = createApp(openQueue(), 'http://localhost:3000', KEY);
    await app.request('/tickets', { method: 'POST' });
    await app.request('/tickets', { method: 'POST' });
    const [first, second] = await Promise.all([call(app, KEY), call(app, KEY)]);
    const numbers = [((await first.json()) as { number: number }).number, ((await second.json()) as { number: number }).number];
    expect(numbers.sort()).toEqual([1, 2]);
  });
});

describe('http', () => {
  test('POST /tickets answers 201', async () => {
    const app = createApp(openQueue(), 'http://localhost:3000');
    const response = await app.request('/tickets', { method: 'POST' });
    expect(response.status).toBe(201);
  });

  test('GET /health names the service', async () => {
    const app = createApp(openQueue(), 'http://localhost:3000');
    const response = await app.request('/health');
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, service: 'antre-api' });
  });
});
