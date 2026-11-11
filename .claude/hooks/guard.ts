/**
 * .claude/hooks/guard.ts
 * PreToolUse(Bash). Reads one tool call from stdin, refuses with exit 2.
 */
const RULES: [RegExp, string][] = [
  [/\brm\b(?=.*\s-\w*r)(?=.*\s-\w*f)/, "recursive delete. Delete files one by one, by name."],
  [/\bgit\s+push\b.*[\s:](main|master)\b/, "push to the main branch. Push a work branch, then open a pull request."],
  [/\bgit\s+push\b.*\s(--force|-f)\b/, "force push. Ask the repo owner to run it themselves."],
  [/\s--no-verify\b/, "skipping the pre-commit checks."],
  [/\.env(?!\.example)/, "touching a .env file. Variable names are in .env.example."],
];

let command = "";
try {
  const call = JSON.parse(await Bun.stdin.text());
  command = String(call.tool_input?.command ?? "");
} catch {
  console.error("[guard] BLOCKED: the tool call could not be read, so it cannot be checked.");
  process.exit(2);
}

for (const [pattern, reason] of RULES) {
  if (pattern.test(command)) {
    console.error(`[guard] BLOCKED: ${reason}`);
    process.exit(2);
  }
}
process.exit(0);
