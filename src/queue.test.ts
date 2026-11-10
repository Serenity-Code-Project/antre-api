import { describe, expect, test } from 'bun:test';

import { createApp } from './app.ts';
import { openQueue, readState, takeNumber } from './queue.ts';

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
