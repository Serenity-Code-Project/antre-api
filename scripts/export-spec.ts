/* Writes openapi.json from the routes in src/app.ts. The file is generated: change a route, run
   `bun run spec:export`, and commit the result. antre-web copies it; nobody edits it by hand. */
import { SPEC_INFO, createApp } from '../src/app.ts';
import { openQueue } from '../src/queue.ts';

const app = createApp(openQueue(), 'http://localhost:3000');
const spec = app.getOpenAPI31Document(SPEC_INFO);
await Bun.write(new URL('../openapi.json', import.meta.url), `${JSON.stringify(spec, null, 2)}\n`);
console.log(`openapi.json: ${Object.keys(spec.paths ?? {}).length} path(s)`);
