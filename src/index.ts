import { createApp } from './app.ts';
import { openQueue } from './queue.ts';

const port = Number(process.env.PORT ?? 4000);
const webOrigin = process.env.WEB_ORIGIN ?? 'http://localhost:3000';
const db = openQueue(process.env.DB_PATH ?? 'antre.sqlite');

/* Without STAFF_KEY set, every call to POST /call-next is refused. */
const app = createApp(db, webOrigin, process.env.STAFF_KEY);

export default { port, fetch: app.fetch };
console.log(`antre-api listening on http://localhost:${port}`);
