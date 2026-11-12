import { afterEach, describe, expect, spyOn, test } from 'bun:test';

import { createApp } from './app.ts';
import { openQueue } from './queue.ts';

const app = () => createApp(openQueue(), 'http://localhost:3000');

describe('request id', () => {
  test('answers with an X-Request-Id header that is not empty', async () => {
    const res = await app().request('/health');
    expect(res.headers.get('X-Request-Id')).toBeTruthy();
  });

  test('gives two requests two different ids', async () => {
    const a = app();
    const first = await a.request('/health');
    const second = await a.request('/health');
    expect(first.headers.get('X-Request-Id')).not.toBe(second.headers.get('X-Request-Id'));
  });

  test('sends back the id the client sent', async () => {
    const res = await app().request('/health', { headers: { 'X-Request-Id': 'test-123' } });
    expect(res.headers.get('X-Request-Id')).toBe('test-123');
  });
});

describe('request log', () => {
  let log: ReturnType<typeof spyOn> | undefined;
  afterEach(() => log?.mockRestore());

  test('writes one JSON line with the same id as the response header', async () => {
    log = spyOn(console, 'log').mockImplementation(() => {});
    const res = await app().request('/health');
    expect(log).toHaveBeenCalledTimes(1);
    const line = JSON.parse(String(log.mock.calls[0]?.[0]));
    expect(line).toEqual({
      requestId: res.headers.get('X-Request-Id'),
      method: 'GET',
      path: '/health',
      status: 200,
      ms: expect.any(Number),
    });
  });
});
