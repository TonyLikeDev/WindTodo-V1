# Self-Report — Nguyen Le Hoang

## Personal Information

|                |                                                       |
| -------------- | ----------------------------------------------------- |
| **Full name**  | Nguyen Le Hoang                                       |
| **Student ID** | 24020003                                              |
| **Team**       | WindToDo                                              |
| **Role**       | Team Lead — Full-Stack (Frontend + Backend + Database + DevOps) |
| **GitHub**     | [TonyLikeDev](https://github.com/TonyLikeDev)         |
| **Commits**    | 64 / 69 on `main` (≈ 93% of the repo's commit volume) |

---

## Task 1 — Planning & Setup

**Week:** 07/05/2026 – 09/05/2026

**Work:**

- Bootstrapped the entire repository: created the GitHub project, set up branch protection, opened the initial PR pipeline.
- Initialized the Next.js 16 (App Router) project, configured TypeScript, Tailwind v4, ESLint, and global styling.
- Migrated the team's first static HTML mock-up into proper Next.js components and resolved early route conflicts so other members could plug their pages in.
- Implemented the base layout components (top nav, sidebar, dashboard shell) and the dashboard routing skeleton that every other feature was later built on top of.
- Defined the Git workflow for the team: trunk-based development with short-lived feature branches, conventional commit prefixes (`feat:`, `fix:`, `refactor:`), and PR reviews before merge.

**Evidence of contribution:**

- `468bb3a` — Website firstlook (2026-05-08)
- `ee82a0e` / `d0dd167` — Initialize Next.js project and setup global styling (2026-05-08)
- `a7f3fdd` — Implement Layout Components and Dashboard Routing (2026-05-08)
- `7ae3f6d` — Migrate static HTML to Next.js components and resolve route conflict (2026-05-08)
- PRs #7, #9 — First-Look branch merges

**Problems:**

The initial static HTML mock-up didn't translate cleanly into the App Router's file-based routing — several routes conflicted because the mock used a flat structure. Resolved by re-mapping every page into App Router conventions and updating internal links.

**Self-Assessment:** 8/10

---

## Task 2 — UI Implementation

**Week:** 08/05/2026 – 17/05/2026

**Work:**

- **Login page UI** — migrated the Figma design into a working Next.js page, then added a simulated form-submission loading state so the auth flow felt responsive before Supabase was wired up.
- **Mobile-responsive sidebar + task persistence** — built the responsive sidebar that collapses below `md` and added the first persistence layer for tasks before the database was integrated.
- **Project board (Kanban)** — implemented the multi-column board view, the foundational layout the rest of the team built features on top of.
- **Drag-and-drop reordering** — implemented drag-and-drop for tasks both within a column and across columns, persisting order via the `position` integer on `Task`.
- **Inline list creation** — added inline column creation with rename-or-cancel UX and a per-list color picker so users can theme their own columns.
- **Sky-themed light design pattern** — the final theming pass that gave the app its identity: translucent surfaces, soft sky-blue gradients, lucide icons, glassmorphism panels.
- **Login background fix** — fixed a bug where the local background color was overriding the global noise-filter background on the login page.

**Evidence of contribution:**

- `d96a68a` — Migrate Login Page UI (2026-05-09)
- `105c9f2` — Implement simulated login form submission with loading state (2026-05-09)
- `075a00f` / `3f46d79` — feat(dashboard): mobile-responsive sidebar and task persistence (2026-05-09)
- `5f7dd5b` / `6071373` — Fix login background override bug (2026-05-09)
- `71e6644` — add project boards (2026-05-09)
- `799520d` — drag-and-drop with reordering for board tasks (2026-05-09)
- `b94026f` — inline list creation with rename-or-cancel and per-list color picker (2026-05-10)
- `832ed3a` / `70b9dfe` — Apply sky-themed light design pattern (2026-05-17)

**Problems:**

Drag-and-drop ordering across columns thrashed the DB on every drop — fixed by switching to integer `position` columns with one update per drop instead of rewriting the whole list. The sky-theme refactor late in the project required touching every component, so the change landed in one large PR (#48) to keep merge conflicts manageable.

**Self-Assessment:** 8/10

---

## Task 3 — Database Integration

**Week:** 09/05/2026 – 16/05/2026

**Work:**

- **Migrated the app to production data** — moved from local mock data to a real Supabase PostgreSQL database accessed through Prisma 6.
- **Authored the Prisma schema** — designed all 5 models (`User`, `Project`, `ProjectMember`, `BoardList`, `Task`) and 4 enums (`TaskStatus`, `TaskPriority`, `TaskType`, `ProjectRole`), including cascade-delete relationships and the unique constraint on `(projectId, userId)` that prevents duplicate memberships.
- **Index design** — added the access-pattern indexes that make the board read cheap: `(listId, position)` for ordered task reads, `(projectId, position)` for ordered column reads, `(userId, listId)` for "my tasks in this list."
- **Supabase Auth integration** — wired up `@supabase/ssr` on the server and `@supabase/supabase-js` on the browser; built the `proxy.ts` middleware that refreshes the session cookie on the edge.
- **`syncUser` upsert pipeline** — wrote the server-side routine that upserts a row in the `User` table on first authenticated request so Prisma foreign keys are always valid, then added a server-side cache so the upsert is paid for only once per session.
- **CRUD coverage** — built the route handlers for projects, board lists, tasks, and project members; added "invite by email," role changes (Admin/Member), and the task detail modal.
- **Schema iteration** — ran `prisma db push --accept-data-loss` against `DIRECT_URL` when the schema diverged during development, with backups taken first.

**Evidence of contribution:**

- `8bb25a0` — Migrate to production with Supabase Auth and Prisma Postgres (2026-05-09)
- `c1b7c92` / `69bd7f4` — Backend-System branch merges (2026-05-09)
- `e9de9e4` / `68ba27a` — Add .env (2026-05-13)
- `7668f2d` — Fix Prisma client + add task detail modal + add users by email (2026-05-15)
- `d926afb` — Add Member/Admin roles + column reorder + share-modal redesign (2026-05-16)
- `02f3da0` — prisma db push --accept-data-loss against DIRECT_URL (2026-05-16)

**Problems:**

Supabase Auth user IDs and Prisma's `User.id` had to stay in lockstep — solved by supplying the row id at insert time (not letting Prisma generate it) and running `syncUser` on the first authenticated request. A teammate also accidentally merged a feature branch directly into `main` that broke the Supabase connection; recovered by reverting and re-running `prisma db push` against `DIRECT_URL`.

**Self-Assessment:** 8/10

---

## Task 4 — Optimization & DevOps

**Week:** 09/05/2026 – 16/05/2026

**Work:**

- **SWR for 0 ms navigation** — refactored every fetch on the client to use SWR so repeat navigation between projects, board, and member lists is instant and only revalidates in the background.
- **Loading skeletons** — added skeleton placeholders for the dashboard, board, and task lists so the user gets immediate visual feedback during data fetches.
- **Supabase latency tuning** — switched the production `DATABASE_URL` to the Supabase pooler, pinned the region to match the Vercel deployment, and added a server-side cache for `syncUser`. Cold-start latency dropped substantially after this change.
- **Prisma engine on Vercel** — fixed the deployment-breaking "Prisma engine missing" error by setting `binaryTargets = ["native", "rhel-openssl-3.0.x"]`, including the query engine in the Vercel lambda trace, and switching to `prisma-client-js` provider. Wired `prisma generate` into both `postinstall` and `build` so Vercel never ships an out-of-date client.
- **Auth tightening + empty widget repair** — fixed a pooler connection bug, tightened task-level authorization (every project query now verifies membership server-side, not just the URL), and repaired empty dashboard widgets.
- **Dynamic rendering** — forced dynamic rendering on the `/users` page that depended on per-request auth state to stop Next.js from statically caching the wrong data.
- **Repo hygiene** — stopped tracking `.env` files, tightened `.gitignore`, and documented the performance work in `performance-tuning.md`.

**Evidence of contribution:**

- `d54c799` / `2d0a650` — feat: implement loading skeletons for instant navigation feedback (2026-05-09)
- `1413cfd` / `5061fc2` — refactor: implement SWR for instant 0ms navigation (2026-05-09)
- `200c78d` — Tune Supabase latency: pooler, region, syncUser cache, groupBy stats (2026-05-15)
- `0333efd` — Include Prisma query engine in Vercel lambda trace (2026-05-15)
- `0eff31f` — Switch Prisma to prisma-client-js to fix Vercel engine resolution (2026-05-15)
- `483645d` — Fix Prisma engine missing on Vercel deployment (2026-05-15)
- `01813cc` — Force dynamic rendering on users page (2026-05-15)
- `2c185d4` — Fix pooler connection bug + tighten task auth + repair empty widgets (2026-05-15)
- `1f10eba` — Update performance-tuning.md (2026-05-16)

**Problems:**

Vercel kept failing to deploy because the Prisma query engine couldn't be resolved on the serverless runtime. Diagnosing it took three iterations: first adding `rhel-openssl-3.0.x` to `binaryTargets`, then including the engine binary in the lambda trace, then switching to the `prisma-client-js` provider. Final fix held.

**Self-Assessment:** 8/10

---

## Task 5 — Peer Review

**Week:** 12/05/2026 – 17/05/2026

**Work:**

- Reviewed two peer projects in the cohort and filed structured feedback to each team (usability, aesthetics, user-friendliness).
- Triaged feedback that came back to our team and decided what to implement vs defer. The share modal was redesigned mid-project specifically because reviewers couldn't tell Admins and Members apart at a glance — the redesign added a role pill next to every member. The Supabase pooler change was also driven by reviewers reporting cold-start latency on first navigation.

**Evidence of contribution:**

- `d926afb` — Add Member/Admin roles + column reorder + share-modal redesign (driven by review feedback)
- `200c78d` — Tune Supabase latency (driven by review feedback)
- Review documents on Google Docs (shared with the team)

**Problems:**

Aligning feedback timing with the team's other deadlines — some reviewer suggestions arrived after milestone 7 and had to be slipped into the final polish pass (milestone 8).

**Self-Assessment:** 8/10

---

## Additional Contribution — Team Leadership & Code Review

Outside of the five formal tasks, I owned the team's PR review queue: every PR (mine and other members') was reviewed and merged through `main` by me, which is why the merge commits dominate the log. I also unblocked teammates on Supabase / Prisma setup multiple times and handled the conflict resolution when feature branches diverged.

---

## Personal Contribution Summary

I owned the full-stack core of WindToDo: the initial Next.js bootstrap, the layout system, the Kanban board with drag-and-drop, the Supabase + Prisma data layer (schema, migrations, auth, `syncUser`, all CRUD routes), the performance pass (SWR, loading skeletons, Supabase pooler/region pinning, Prisma engine fixes for Vercel), and the final sky-themed light design pass. I also led the team's Git workflow and code review.

By commit count I authored **64 of the repo's 69 commits on `main`** (~93%), spanning frontend, backend, database, and DevOps. The two contributions I am proudest of are (1) the Supabase latency tuning + Prisma-on-Vercel fixes that made the deployed app feel instant on serverless, and (2) the database schema design with `position`-based ordering and access-pattern indexes that made drag-and-drop both correct and cheap. The biggest thing I learned was how to take a project end-to-end on a serverless runtime — the gap between "works locally" and "works on Vercel" was where almost all of my hardest debugging happened.

**Estimated % contribution to the team:** ~35%

**Overall Self-Assessment Score:** 10/10
