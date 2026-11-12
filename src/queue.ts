import { Database } from 'bun:sqlite';

export type TicketStatus = 'waiting' | 'called';

export interface Ticket {
  id: number;
  number: number;
  day: string;
  status: TicketStatus;
  createdAt: string;
}

export interface QueueState {
  day: string;
  /** The number on the board now, or null before the first call of the day. */
  current: number | null;
  waiting: number;
  /** The next numbers in line, at most five. */
  next: number[];
}

interface TicketRow {
  id: number;
  number: number;
  day: string;
  status: TicketStatus;
  created_at: string;
}

/** The queue day a moment belongs to, as YYYY-MM-DD. */
export function dayOf(now: Date): string {
  return now.toISOString().slice(0, 10);
}

export function openQueue(path = ':memory:'): Database {
  const db = new Database(path);
  db.run(`create table if not exists tickets (
    id integer primary key autoincrement,
    number integer not null,
    day text not null,
    status text not null default 'waiting',
    created_at text not null,
    unique (day, number)
  )`);
  return db;
}

const toTicket = (row: TicketRow): Ticket => ({
  id: row.id,
  number: row.number,
  day: row.day,
  status: row.status,
  createdAt: row.created_at,
});

/** Gives out the next number of the day. Numbers start again at 1 each day. */
export function takeNumber(db: Database, now = new Date()): Ticket {
  const day = dayOf(now);
  const last = db.query<{ n: number | null }, [string]>('select max(number) as n from tickets where day = ?').get(day);
  const number = (last?.n ?? 0) + 1;
  const row = db
    .query<TicketRow, [number, string, string]>(
      'insert into tickets (number, day, created_at) values (?, ?, ?) returning *',
    )
    .get(number, day, now.toISOString());
  if (!row) throw new Error('ticket was not stored');
  return toTicket(row);
}

/** Calls the smallest waiting number of the day. Returns null when nobody is waiting.
 *  One statement picks and marks the ticket, so two calls can never take the same number. */
export function callNext(db: Database, now = new Date()): Ticket | null {
  const row = db
    .query<TicketRow, [string]>(
      `update tickets set status = 'called'
       where id = (select id from tickets where day = ? and status = 'waiting' order by number limit 1)
       returning *`,
    )
    .get(dayOf(now));
  return row ? toTicket(row) : null;
}

/** What the display board shows for the day. */
export function readState(db: Database, now = new Date()): QueueState {
  const day = dayOf(now);
  const current = db
    .query<{ n: number | null }, [string]>("select max(number) as n from tickets where day = ? and status = 'called'")
    .get(day);
  const waiting = db
    .query<{ number: number }, [string]>("select number from tickets where day = ? and status = 'waiting' order by number")
    .all(day);
  return {
    day,
    current: current?.n ?? null,
    waiting: waiting.length,
    next: waiting.slice(0, 5).map((row) => row.number),
  };
}

export interface QueueStats {
  day: string;
  taken: number;
  called: number;
  waiting: number;
}

/** Today's counts for staff: how many numbers were taken, called and are still waiting. */
export function readStats(db: Database, now = new Date()): QueueStats {
  const day = dayOf(now);
  const row = db
    .query<{ taken: number; called: number | null }, [string]>(
      "select count(*) as taken, sum(status = 'called') as called from tickets where day = ?",
    )
    .get(day);
  const taken = row?.taken ?? 0;
  const called = row?.called ?? 0;
  return { day, taken, called, waiting: taken - called };
}
