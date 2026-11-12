# antre-api

Starter project for the Serenity Code class **AI-Assisted Development: End-to-End Efficient
Workflow**. Antre is the practice product of the class: a queue-number app for a small clinic or
shop. A visitor takes a number, and a display board shows who is next. You practise on Antre, then
apply each skill to a product of your own.

This repository is the API. The web side is [antre-web](https://github.com/Serenity-Code-Project/antre-web).
Bun, Hono and SQLite, so there is nothing to install besides [Bun](https://bun.sh).

## Run

```sh
git clone https://github.com/Serenity-Code-Project/antre-api.git
cd antre-api
bun install
bun run dev      # http://localhost:4000
bun test
bun run type-check
```

Settings come from the environment and all have defaults: `PORT` (4000), `WEB_ORIGIN`
(`http://localhost:3000`, the only origin the browser may call from) and `DB_PATH` (`antre.sqlite`).

## What works

| Route | Does |
| --- | --- |
| `GET /health` | answers `{ "ok": true }` |
| `POST /tickets` | gives out the next number of the day |
| `GET /state` | the number on the board, how many are waiting, the next five |
| `GET /openapi.json` | the OpenAPI 3.1 spec, generated from the routes |
| `GET /docs` | an API reference page built from `/openapi.json` by Scalar |

`openapi.json` is the contract `antre-web` is written against. It is generated from the routes in
`src/app.ts`. After changing a route, run `bun run spec:export` and commit the result. Do not edit
the file by hand. The running service also serves it at `/openapi.json`.

The `/docs` page loads its script from a CDN without a pinned version, so its look can change while
this repo does not.

## What is missing

Nothing calls the next number yet, so the board never moves. There is no staff sign-in, no agent
configuration and no CI. The starter is small and imperfect on purpose. You find the gaps and add
the missing parts during the class.

## Branches

| Branch | Holds |
| --- | --- |
| `main` | The starter. Begin every exercise from here, or from your own previous exercise. |
| `answer/health-service` | Answer key for "Latihan Satu Putaran Pertama". |
| `answer/call-next` | Answer key for "Latihan Satu Putaran AIM di Antre". |
| `answer/hunt-mutant` | Answer key for "Latihan Buru Mutan di Antre". |
| `answer/guardrails` | Answer key for "Latihan Cari Celah dan Pasang Guardrail di Antre". |
| `answer/api-docs` | Answer key for "Latihan Memasang Scalar di Antre". |

Each answer branch builds on the one before it and carries a `KUNCI.md` that explains what changed,
why, and how to check it. Read an answer only after your own attempt. An answer key shows one way
that passes the checks, and yours may differ and still be right.

```sh
git fetch origin
git diff main origin/answer/health-service
```

## Licence

MIT. See `LICENSE`.
