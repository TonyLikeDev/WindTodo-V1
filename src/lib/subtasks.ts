// Subtasks live inside a task's `description` as Markdown-style checklist lines,
// so they persist through the normal `updateTask({ description })` path with no
// schema change. A line counts as a subtask when it looks like one of:
//   []  buy milk        ← what the user types first
//   [ ] buy milk        ← unchecked
//   [x] buy milk        ← checked (also [X])
//   - [ ] buy milk      ← optional leading bullet
// Toggling rewrites just the bracket on that line; everything else is preserved.

export type Subtask = {
  // Index into description.split('\n') — the stable handle used to toggle.
  lineIndex: number;
  checked: boolean;
  label: string;
};

// prefix (indent + optional bullet) | bracket body | rest-of-line (label)
const SUBTASK_RE = /^(\s*(?:[-*]\s+)?)\[([ xX]?)\](.*)$/;
const BRACKET_RE = /\[([ xX]?)\]/;

export function parseSubtasks(description: string | null | undefined): Subtask[] {
  if (!description) return [];
  const lines = description.split('\n');
  const out: Subtask[] = [];
  for (let i = 0; i < lines.length; i++) {
    const m = SUBTASK_RE.exec(lines[i]);
    if (!m) continue;
    out.push({
      lineIndex: i,
      checked: m[2].trim().toLowerCase() === 'x',
      label: m[3].trim(),
    });
  }
  return out;
}

export function subtaskProgress(
  description: string | null | undefined,
): { done: number; total: number } {
  const subs = parseSubtasks(description);
  return { done: subs.filter((s) => s.checked).length, total: subs.length };
}

// Returns a new description string with the checkbox on `lineIndex` flipped to
// `checked`. No-op (returns input) if the line is out of range.
export function toggleSubtask(
  description: string,
  lineIndex: number,
  checked: boolean,
): string {
  const lines = description.split('\n');
  if (lineIndex < 0 || lineIndex >= lines.length) return description;
  lines[lineIndex] = lines[lineIndex].replace(BRACKET_RE, checked ? '[x]' : '[ ]');
  return lines.join('\n');
}

// Appends a fresh unchecked subtask line, keeping any existing description text.
export function addSubtask(
  description: string | null | undefined,
  label: string,
): string {
  const trimmed = label.trim();
  const base = description ?? '';
  if (!trimmed) return base;
  const line = `[ ] ${trimmed}`;
  if (!base) return line;
  return base.endsWith('\n') ? `${base}${line}` : `${base}\n${line}`;
}
