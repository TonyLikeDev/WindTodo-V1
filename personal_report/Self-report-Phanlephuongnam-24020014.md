# Self-Report — Phan Le Phuong Nam

## Personal Information

|                |                                                       |
| -------------- | ----------------------------------------------------- |
| **Full name**  | Phan Le Phuong Nam                                    |
| **Student ID** | 24020014                                              |
| **Team**       | WindToDo                                              |
| **Role**       | Frontend — Dashboard (Branch 32) & Statistics (Branch 31) |
| **GitHub**     | [PoNamVN](https://github.com/PoNamVN)                 |
| **Commits**    | 4 on `main` + 19+ on feature branches `32-change-dashboard-to-new-one`, `31-make-changes-in-statistic`, `nam-bel` |

---

## Task 1 — Planning & Setup

**Week:** 08/05/2026 – 12/05/2026

**Work:**

- Attended the team meetings on UI/UX structure for the new Dashboard.
- Helped define the metrics shown on the Statistics page (per-member workload, task counts, completion ratio).
- Set up my own feature branches (`nam-bel`, `31-make-changes-in-statistic`, `32-change-dashboard-to-new-one`) and added early scaffolding for the dashboard and statistics work.

**Evidence of contribution:**

- `5131b06` — Update task (branch `nam-bel`, 2026-05-09)
- `791d51e` — Fix và thêm các feature vào trong web (branch `nam-bel`, 2026-05-10)
- `12faf11` — Cải thiện thêm (branch `nam-bel`, 2026-05-10)

**Problems:**

Getting an isolated feature branch to stay in sync with `main` while Tony was pushing rapid changes was tricky early on. Resolved by rebasing onto `main` more often and using `chore: resolve merge conflicts and unify dashboard-team features` commits to keep the branch buildable.

**Self-Assessment:** 7/10

---

## Task 2 — UI Implementation

**Week:** 09/05/2026 – 16/05/2026

**Work:**

- **Dashboard upgrade (Branch 32, PR #41 area)** — built a new dashboard layout: clearer Kanban board summary, task priorities and due-date badges, and a more visual layout that scaled better across screen sizes.
- **Statistics page (Branch 31, merged via PR #35)** — built the first version of the Statistics page that displays per-team and per-member task progress; this was later upgraded with Mai's pie/donut chart and members progress table.
- **Member management** — finalised UI for managing members alongside the dashboard.

**Evidence of contribution:**

- `499b907` — Update phần statistics và Project (branch `31-make-changes-in-statistic`, 2026-05-13)
- `c0bf503` — Update Dashboard (branch `32-change-dashboard-to-new-one`, 2026-05-15)
- `4dfe193` — Update .gitignore (2026-05-13)
- `456deb8` — Fix (2026-05-15)
- `4ddd9f5` — Merge PR #35 into main (2026-05-15)

**Problems:**

The Dashboard branch (32) and Tony's main branch diverged several times; merging required resolving conflicts in shared layout files. The hydration warnings caused by Next.js 16 server/client mismatches took a few iterations to track down.

**Self-Assessment:** 8/10

---

## Task 3 — Database Integration

**Week:** 14/05/2026 – 16/05/2026

**Work:**

- **Database connection hardening (Branch 32)** — updated the database connection to use the Supabase **pooler over IPv4** so the Dashboard's data fetches stopped failing on Vercel. Also hardened task update queries against race conditions discovered during dashboard testing.
- **Schema/hydration fix-ups** — resolved hydration issues and schema mismatches that appeared after merging Tony's main into Branch 32.

**Evidence of contribution:**

- `ca3cd9c` — update database connection to pooler (IPv4) and harden task updates (2026-05-16)
- `506991a` — chore: resolve conflicts and fix database schema/hydration issues (2026-05-14)
- `c5c0d9d` — chore: resolve merge conflicts and unify dashboard-team features (2026-05-13)
- Multiple `fix` commits on `32-change-dashboard-to-new-one` (2026-05-15 → 2026-05-16)

**Problems:**

The pooler vs direct-connection mismatch caused intermittent "too many connections" errors before the IPv4 pooler switch landed. After the change, dashboard data fetches became stable.

**Self-Assessment:** 8/10

---

## Task 4 — Optimization

**Week:** 15/05/2026 – 17/05/2026

**Work:**

- Smaller fix-ups on the Dashboard branch to reduce hydration warnings and tighten task updates (`fix`, `Cải thiện thêm`, several follow-ups).
- Cooperated with Tony on the pooler / region-pinning change that landed on `main` (`200c78d` — Tune Supabase latency).

**Evidence of contribution:**

- Multiple `fix` commits on branch `32-change-dashboard-to-new-one` (2026-05-15 → 2026-05-16)

**Problems:**

Hard to measure performance impact directly without a Lighthouse run — most of the improvement was qualitative (fewer hydration warnings, fewer connection errors).

**Self-Assessment:** 7/10

---

## Task 5 — Peer Review

**Week:** Limited involvement.

**Work:**

Participated in team review discussions for the share-modal redesign and the Statistics layout, but did not lead a peer review of an outside team.

**Self-Assessment:** 6/10

---

## Personal Contribution Summary

I owned the **Dashboard redesign (Branch 32)** and the **Statistics page (Branch 31)** — the two pages most users land on after signing in. I also did the **database connection pooler/IPv4 hardening** that stabilised production data fetches, and fixed several hydration issues that surfaced when my branches merged back into `main`. Most of my work lives on feature branches (`32-change-dashboard-to-new-one`, `31-make-changes-in-statistic`, `nam-bel`) rather than directly on `main`, so the contribution is bigger than the `main`-only commit count suggests.

**Estimated % contribution to the team:** ~20%

**Overall Self-Assessment Score:** 8/10
