# Staff stats

## Intent

Staff can see how many numbers were taken, called and are still waiting today, without counting
the board by hand.

## Done criteria

1. `GET /stats` without an `x-staff-key` header answers 401.
2. `GET /stats` with a wrong staff key answers 401.
3. If `STAFF_KEY` is not set on the server, every call answers 401.
4. With the right staff key, `GET /stats` answers 200 with `day`, `taken`, `called` and `waiting`.
5. `waiting` equals `taken` minus `called`.
6. `openapi.json` is regenerated with `bun run spec:export` and lists `/stats` with the staff key.

## Not in this round

- Stats for days other than today.
- A stats screen in antre-web.
- The day boundary: `dayOf` cuts the day from the UTC timestamp, so before 07:00 WIB it still
  counts yesterday. Fixing that changes every route and gets its own spec.
- Any change to the existing routes or to what the display board shows.

## Decisions

- Same staff key and same check as `POST /call-next`.
- The staff key is never written in the code. It comes only from `STAFF_KEY`.
- One SQL statement, so the three numbers always come from the same moment.
