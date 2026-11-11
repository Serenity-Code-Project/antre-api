/**
 * scripts/check/guard-probes.ts
 * Proves the guard both ways. Each row of guard-probes.tsv is sent to the hook
 * exactly as the agent sends it, JSON on stdin, then judged by the exit code.
 */
const HOOK = ".claude/hooks/guard.ts";
const rows = (await Bun.file("scripts/check/guard-probes.tsv").text())
  .split("\n")
  .filter((line) => line.trim() && !line.startsWith("#"))
  .map((line) => line.split("\t"));

let failed = 0;
for (const [expect = "", command = ""] of rows) {
  const call = { hook_event_name: "PreToolUse", tool_name: "Bash", tool_input: { command } };
  const run = Bun.spawnSync(["bun", HOOK], { stdin: Buffer.from(JSON.stringify(call)) });
  const got = run.exitCode === 2 ? "block" : run.exitCode === 0 ? "allow" : "error";
  const ok = got === expect;
  if (!ok) failed += 1;
  console.log(`${ok ? "ok  " : "FAIL"}  ${expect.padEnd(5)}  ${command}${ok ? "" : `   (got ${got})`}`);
}
console.log(`\n${rows.length} probes, ${failed} failed`);
process.exit(failed ? 1 : 0);

/** Makes this file a module, so top-level await passes the type check. */
export {};
