# WindTodo V1 — Final Project Report

**A modern, glassmorphism-inspired task manager built with Next.js and Supabase.**

---

## Document Purpose & Structure

This is the Final Project Report for **WindTodo V1**, submitted on **2026-05-17**. It documents the team, technical architecture, and implementation evidence across five major task categories: planning & teamwork, user interface, database integration, optimizations, and peer review.

## Project Identity

| Field | Value |
| --- | --- |
| **Application Name** | WindTodo V1 — Personal & Team Task Manager |
| **Philosophy** | Kanban-first — every task lives on a board, ordered, assignable, and shareable |
| **Live Deployment** | https://wind-todo-v1.vercel.app |
| **Source Repository** | https://github.com/TonyLikeDev/WindTodo-V1 |
| **Submission Date** | 2026-05-17 |

### Team

| # | Full name | GitHub | Student ID | Primary role |
| --- | --- | --- | --- | --- |
| 1 | **Nguyen Le Hoang** | [`TonyLikeDev`](https://github.com/TonyLikeDev) | 24020003 | **Team Lead — Full-Stack** (Frontend + Backend + Database + DevOps) |
| 2 | Phan Le Phuong Nam | [`PoNamVn`](https://github.com/PoNamVn) | 24020014 | Frontend — Dashboard (Branch 32) & Statistics (Branch 31) |
| 3 | Tran Le Xuan Mai | [`xuanmai171202-spec`](https://github.com/xuanmai171202-spec) | 24020011 | Frontend — Dashboard upgrade, Statistics charts, Calendar |
| 4 | Hoang Phuc Hung | [`GabTommy2006`](https://github.com/GabTommy2006) | 24020004 | Frontend — Task detail modal, member assignment + due dates, calendar |
| 5 | Le Van Cong Nguyen | [`nguyendangban0605-beep`](https://github.com/nguyendangban0605-beep) | 24020006 | Frontend / UI/UX — Glassmorphism polish |

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, SWR, Recharts, lucide-react |
| Backend | Next.js Route Handlers (Node.js runtime) |
| Database | Supabase PostgreSQL via Prisma 6.19.3 ORM |
| Auth | Supabase Auth (`@supabase/ssr` + `@supabase/supabase-js`) |
| Deploy | Vercel (frontend + serverless API routes) |
| Tooling | ESLint 9, eslint-config-next, pnpm |

**Main features:**

- Project + member management with **Admin / Member** roles
- Kanban board with reorderable columns and drag-and-drop tasks
- Task detail with status / priority / type, assignee, start & end dates
- Statistics dashboard (Workload chart, Member progress)
- Calendar view for tasks
- Sky-themed glassmorphism design (Tony & Nguyen)
- Real-time-ish UX via SWR stale-while-revalidate

---

## Installation Guide

**Requirements:**

| Tool | Version |
| --- | --- |
| Node.js | >= 18.x |
| pnpm (or npm) | latest |
| PostgreSQL | Supabase (managed) |

**Steps:**

```bash
# 1. Clone repository
git clone https://github.com/TonyLikeDev/WindTodo-V1.git
cd WindTodo-V1

# 2. Install dependencies (prisma generate runs on postinstall)
pnpm install

# 3. Configure environment
cp .env.example .env
# Fill in:
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
#   SUPABASE_SERVICE_ROLE_KEY
#   DATABASE_URL   (Supabase pooler)
#   DIRECT_URL     (direct Postgres URL for migrations)

# 4. Push the Prisma schema to the database
npx prisma db push

# 5. Run the dev server
pnpm dev
# → http://localhost:3000
```

---

## Task 1 — Project Planning & Teamwork

### 1.1 Role Assignment

| Member | Area owned |
| --- | --- |
| Nguyen Le Hoang (`TonyLikeDev`) — Team Lead | Project bootstrap, layout system, login UI, **Kanban board + drag-and-drop**, sky-themed light design, **Supabase + Prisma migration**, **schema + member/admin roles**, **share modal**, **SWR + loading skeletons**, **Supabase pooler + Prisma engine fixes on Vercel**, code review queue |
| Phan Le Phuong Nam | Dashboard upgrade (Branch 32) + Statistics page (Branch 31) |
| Tran Le Xuan Mai | Dashboard redesign, Workload pie chart + Members progress table, Calendar view (initial), schema design contributions |
| Hoang Phuc Hung | Task detail modal, member assignment + due dates, Calendar rebuild, drag-and-drop (initial) |
| Le Van Cong Nguyen | Celestial design, Glassmorphism polish |

In short: **Tony owned the full-stack core**; the rest of the team built feature areas on top of it (statistics, dashboard, calendar, theming & polish).

### 1.2 Wireframes & Design

- **Tool:** Figma
- **Scope:** wireframes for landing, sign-in / sign-up, projects dashboard, project board (Kanban), task detail modal, and share modal
- **Design system:** sky-themed light palette with glassmorphism surfaces; translucent panels, soft blue gradients, subtle borders, and depth via blur

### 1.3 Project Plan — Milestones

The team agreed on eight milestones at the start of the project. The first two slipped past their original deadlines; the team caught up by milestone 3 and every remaining milestone shipped on time.

| # | Milestone | Deadline | Status |
| --- | --- | --- | --- |
| 1 | Complete wireframe &amp; Figma design | 10/04/2026 | ⚠️ Late |
| 2 | Setup GitHub repo &amp; Prisma schema | 15/04/2026 | ⚠️ Late |
| 3 | Complete Authentication (Supabase Auth + SSR) | 18/04/2026 | ✅ On time |
| 4 | Basic UI (Landing, Auth, Projects dashboard) | 22/04/2026 | ✅ On time |
| 5 | Database integration &amp; CRUD APIs (projects / lists / tasks) | 28/04/2026 | ✅ On time |
| 6 | Kanban board, drag-and-drop, task detail | 05/05/2026 | ✅ On time |
| 7 | Members &amp; roles, share modal, performance tuning | 12/05/2026 | ✅ On time |
| 8 | Sky-themed light design polish &amp; submission | 17/05/2026 | ✅ On time |

### 1.4 Git Workflow

- **Branching model:** trunk-based with short-lived feature branches
- **Pull Requests:** every change goes through a PR; at least one teammate reviews before merge
- **Commit style:** Conventional Commits where practical (e.g. `feat: share modal redesign`, `fix: tune Supabase latency`)
- **Issue tracking:** GitHub Issues, used to record follow-up work and bugs

### 1.5 Repository

- Public GitHub repo: [TonyLikeDev/WindTodo-V1](https://github.com/TonyLikeDev/WindTodo-V1)
- **69 commits** across mid-April → 2026-05-17
- Contributors:
  - `TonyLikeDev` — 19 commits
  - `PoNamVN` — 16 commits
  - `GabTommy2006` — 9 commits
  - `xuanmai171202-spec` — 3 commits

---

## Task 2 — User Interface Implementation

### 2.1 Pages

| Page | Route | Purpose | Implemented by |
| --- | --- | --- | --- |
| Landing | `/` | Hero, tagline, CTAs (Join Now / Sign In) | Nguyen Le Hoang |
| Sign up / Sign in | `/signup`, `/login` | Supabase Auth forms with simulated loading state | Nguyen Le Hoang |
| Projects dashboard | `/dashboard` | Grid of project cards (color + name + member count) | Phan Le Phuong Nam (Branch 32) + Tran Le Xuan Mai |
| Project board (Kanban) | `/projects/[id]` | Horizontal Kanban with reorderable columns and tasks | Nguyen Le Hoang (board + DnD), Hoang Phuc Hung (task detail) |
| Task detail | modal | Edit title, description, status, priority, type, assignee, dates | Hoang Phuc Hung + Nguyen Le Hoang |
| Share modal | modal | Invite by email, set role, list members | Nguyen Le Hoang |
| Statistics | `/dashboard/stats` | Workload pie chart + member progress table | Phan Le Phuong Nam (Branch 31) + Tran Le Xuan Mai |
| Calendar | `/dashboard/calendar` | Week / month / year view | Tran Le Xuan Mai (initial) + Hoang Phuc Hung (rebuild) |
| Settings | `/dashboard/settings` | Profile, sign-out | Le Van Cong Nguyen (ui), Nguyen Le Hoang (auth) |

### 2.2 Styling

- **Tailwind CSS v4** with `@tailwindcss/postcss`
- **Custom palette:** sky-50 → sky-900 plus translucent white surfaces for the glassmorphism look
- **Typography:** Poppins font family loaded via `next/font` for layout-stable text
- **Icons:** `lucide-react` for a unified line-icon look
- **Theme:** sky-themed glassmorphism design

### 2.3 Components

The `src/components/` tree is organized by feature:

- **Board** — column container, draggable list, drop targets
- **Lists** — list header, reorder handle, add-list button
- **Tasks** — task card, badge stack (status / priority / type), assignee avatar
- **Modals** — task detail, share, confirm-delete; all share the glass panel pattern
- **Layout & nav** — sidebar, brand mark, sign-out
- **Theming** — color tokens, glass panel, soft gradients

### 2.4 Interactive Elements

| Feature | Description | Implemented by |
| --- | --- | --- |
| Drag-and-drop tasks | Reorder within / across columns; persisted via `position` integer | Nguyen Le Hoang (final), Hoang Phuc Hung (initial) |
| Drag-and-drop columns | Reorder board lists themselves | Nguyen Le Hoang |
| Inline list creation + color picker | Rename-or-cancel UX + per-list color | Nguyen Le Hoang |
| Share modal (redesigned) | Invite by email, promote/demote, remove members | Nguyen Le Hoang |
| Task detail modal | Inline edit of every field | Hoang Phuc Hung + Nguyen Le Hoang |
| Assign member + due date | Pick assignee, set start/end date when creating a task | Hoang Phuc Hung |
| SWR-powered lists | Background revalidation after mutations | Nguyen Le Hoang |
| Loading skeletons | Skeleton placeholders during data fetches | Nguyen Le Hoang |
| Statistics charts | Workload pie chart + member-progress table | Phan Le Phuong Nam + Tran Le Xuan Mai |
| Calendar view | Week / month / year | Tran Le Xuan Mai (initial) + Hoang Phuc Hung (rebuild) |

### 2.5 Responsiveness

Verified across Chrome DevTools mobile (< 768px), tablet (768–1024px), and desktop (> 1024px). The board switches from a horizontal scroller (desktop) to a stacked vertical layout (mobile), and modals expand to full-screen sheets below `md`.

---

## Task 3 — Database Integration

### 3.1 Connection Architecture

```
Browser (Next.js client + SWR + Supabase JS)
        │
        ▼
Next.js App Router on Vercel
  ├─ RSC for project / board pages
  ├─ Route handlers (/api/*)
  └─ Supabase SSR session helper + syncUser cache
        │
        ▼
Prisma Client → Supabase PostgreSQL (pooler, region-pinned)
```

- **Frontend → API:** SWR + native `fetch` against Next.js route handlers
- **API → DB:** Prisma 6 client
- **Auth:** Supabase Auth on the browser (`@supabase/supabase-js`) + cookies on the server (`@supabase/ssr`)

### 3.2 Schema (`prisma/schema.prisma`)

**Enums**

- `TaskStatus`: `TODO`, `IN_PROGRESS`, `DONE`
- `TaskPriority`: `LOW`, `MEDIUM`, `HIGH`, `URGENT`
- `TaskType`: `TASK`, `STORY`, `BUG`
- `ProjectRole`: `ADMIN`, `MEMBER`

**Models (5)**

| Model | Key columns | Constraints / indexes |
| --- | --- | --- |
| **User** | `id` (PK, supplied), `email` (unique), `name`, `avatarUrl`, `createdAt` | `id` matches Supabase Auth `user.id` |
| **Project** | `id` (uuid), `name`, `color`, `userId` (creator), `createdAt` | Index on `userId` |
| **ProjectMember** | `id`, `projectId`, `userId`, `role`, `createdAt` | Unique `(projectId, userId)`; cascade on both FKs |
| **BoardList** | `id`, `name`, `color`, `userId`, `projectId`, `position`, `createdAt` | Cascade on `projectId`; index `(projectId, position)` |
| **Task** | `id`, `title`, `description`, `userId`, `assigneeId?`, `listId`, `position`, `status`, `priority`, `type`, `startDate?`, `endDate?`, `createdAt` | Cascade on `listId`; indexes `(userId, listId)`, `(listId, position)` |

### 3.3 Authentication Flow

1. User signs in with Supabase Auth (browser).
2. Session cookie is set; the `proxy.ts` middleware refreshes it on the edge.
3. On the first authenticated request, the server runs `syncUser`, which upserts a row into the `User` table so Prisma foreign keys are valid.
4. `syncUser` results are cached server-side to avoid repeated round-trips.
5. Every project-scoped query verifies that the current user is the project creator or a member; `ProjectRole` decides admin-only actions.

### 3.4 CRUD Operations

Full Create / Read / Update / Delete coverage for every model, exposed via typed route handlers under `/api`:

- **Projects:** create with color, rename, delete (cascades to lists, tasks, members)
- **ProjectMembers:** invite by email, change role, remove (Admin-only)
- **BoardLists:** create, rename, recolor, reorder via `position`, delete
- **Tasks:** create, edit any field, move within / across lists via `position` + `listId`, delete

---

## Task 4 — Optimizations Applied

### 4.1 Performance

- **Supabase pooler + region pinning.** Production `DATABASE_URL` points at the Supabase connection pooler and is pinned to the same region as the Vercel deployment, cutting cold-start latency. (Commit: *"Tune Supabase latency: pooler, region, syncUser cache."*)
- **`syncUser` server-side cache.** First-request user upsert is cached so most requests skip the round-trip entirely.
- **Index design that matches access patterns.** `(listId, position)` for ordered task reads, `(projectId, position)` for ordered column reads, `(userId, listId)` for "my tasks in this list."
- **SWR caching.** Project, board, and member lists are stale-while-revalidate, so repeat navigation is instant.

### 4.2 Reliability

- **Cascade deletes** on `projectId` and `listId` keep the database free of orphans.
- **Unique constraint** `@@unique([projectId, userId])` on `ProjectMember` prevents accidental double-adds at the DB layer.
- **Position-based ordering** with a single update per drop avoids race-prone client logic.

### 4.3 Build &amp; Deploy

- **Prisma binary targets.** `binaryTargets = ["native", "rhel-openssl-3.0.x"]` so the Prisma engine works on Vercel's serverless runtime.
- **`prisma generate` in two places.** Runs on `postinstall` and again as the first step of `build`, so the client is always up to date when Vercel deploys.
- **Migrations via direct connection.** `DIRECT_URL` is used by `prisma migrate`; `DATABASE_URL` (pooler) is used at runtime.

### 4.4 Developer Experience

- **TypeScript everywhere** — Prisma generates models, route handlers consume them directly.
- **ESLint 9 + `eslint-config-next`** for consistent style.
- **Server-side type safety** via Prisma; client-side via SWR generics.

### 4.5 Security

- **Server-only secrets** (Supabase service-role key, `DATABASE_URL`) are never exposed to the client.
- **Authorization at the data layer** — every project query checks membership, not just the URL.
- **Cascade deletes** ensure a removed member cannot leave dangling rows.

---

## Task 5 — Peer Review & Feedback

_No review yet._

---

## Deliverables Checklist

- [x] **Source code on GitHub** — public repository at [TonyLikeDev/WindTodo-V1](https://github.com/TonyLikeDev/WindTodo-V1)
- [x] **README.md** — setup instructions, project overview, screenshots, ERD
- [x] **Live Vercel deployment** — [wind-todo-v1.vercel.app](https://wind-todo-v1.vercel.app)
- [x] **`prisma/schema.prisma`** — database source of truth (5 models, 4 enums)
- [x] **Final report** — this file (`REPORT.md`) and web version (`index.html`)
- [x] **Self-reports** — one per team member in `personal_report/`
- [ ] **Video demo on YouTube** — max 10 minutes, ≥ 720p *(pending upload)*

---

## Self-Reports

| Member | Student ID | Self-report file |
| --- | --- | --- |
| Nguyen Le Hoang | 24020003 | [`personal_report/Self-report-NguyenLeHoang-24020003.md`](personal_report/Self-report-NguyenLeHoang-24020003.md) |
| Phan Le Phuong Nam | 24020014 | [`personal_report/Self-report-Phanlephuongnam-24020014.md`](personal_report/Self-report-Phanlephuongnam-24020014.md) |
| Tran Le Xuan Mai | 24020011 | [`personal_report/Self-report-TranLeXuanMai-24020011.md`](personal_report/Self-report-TranLeXuanMai-24020011.md) |
| Hoang Phuc Hung | 24020004 | [`personal_report/self-report-phuc-hung.md`](personal_report/self-report-phuc-hung.md) |
| Le Van Cong Nguyen | 24020006 | [`personal_report/Self-report-LeVanCongNguyen-24020006.md`](personal_report/Self-report-LeVanCongNguyen-24020006.md) |

---

## Conclusion

WindTodo V1 is a complete, deployed Kanban task manager built on a modern, type-safe stack: Next.js 16 + React 19 on the front, Prisma 6 over Supabase PostgreSQL on the back, all hosted on Vercel. The schema is small but expressive enough to model multi-user projects with roles, reorderable columns, and rich tasks. The visual identity — sky-themed glassmorphism — gives the product a recognizable look, and the performance pass (pooler, region pinning, `syncUser` cache, Prisma engine targeting) makes the deployed app feel snappy on Vercel's serverless runtime.

The team slipped on the first two milestones but recovered, met every milestone from week 3 onward, shipped a working URL, and ended the project with a clean, focused codebase that is ready to grow into V2.

---

## Appendix A — Links

- Live app: https://wind-todo-v1.vercel.app
- Source code: https://github.com/TonyLikeDev/WindTodo-V1

## Appendix B — Required environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (browser + server) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key for privileged server operations |
| `DATABASE_URL` | Postgres connection string (Supabase pooler) used by Prisma at runtime |
| `DIRECT_URL` | Direct Postgres URL used by Prisma migrations |

## Appendix C — Key dependencies

```
next                  16.2.6
react / react-dom     19.2.4
typescript            ^5
tailwindcss           ^4
@tailwindcss/postcss  ^4
prisma                ^6.19.3
@prisma/client        ^6.19.3
@supabase/ssr         ^0.10.3
@supabase/supabase-js ^2.105.4
swr                   ^2.4.1
recharts              ^3.8.1
lucide-react          ^1.14.0
eslint                ^9
eslint-config-next    16.2.6
```
