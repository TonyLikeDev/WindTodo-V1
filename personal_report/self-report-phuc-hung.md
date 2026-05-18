# Self-Report — Hoang Phuc Hung

## Personal Information

|                |                                                       |
| -------------- | ----------------------------------------------------- |
| **Full name**  | Hoang Phuc Hung                                       |
| **Student ID** | 24020004                                              |
| **Team**       | WindToDo                                              |
| **Role**       | Frontend — Task detail modal, member + due-date assignment, Calendar |
| **GitHub**     | [GabTommy2006](https://github.com/GabTommy2006)       |
| **Commits**    | 1 on `main` (Initial commit) + ~10 on feature branches `phung`, `phung02`, `add-calendar`, `nam-bel` |

---

## Task 1 — Planning & Setup

**Week:** 15/04/2026 – 01/05/2026

**Work:**

- Opened the very first commit on the repo (`Initial commit`, 2026-05-07) before Tony bootstrapped Next.js.
- Took part in the early brainstorming sessions: the team first explored a restaurant-reservation site, then pivoted to a to-do list app after the class on April 29.
- Joined the in-person meetings in Room 403 at VN-UK and at The Cozy Cafe on Duong Khue Street.
- Helped redraw the UX/UI sketches from the whiteboard onto a drawing tablet so the team could iterate on a cleaner visual before moving to Figma.

**Evidence of contribution:**

- `264ea37` — Initial commit (2026-05-07, very first commit of the repo)
- Shared Google Docs design notes ([link](https://docs.google.com/document/d/1jsn78MfRzRtSypJJ78kivTvWFwRcyxbSAgHTDbM6Xyc/edit?usp=sharing))

**Problems:**

The restaurant-reservation pitch never gained traction — proposed several extras (in-app chat between users and owners, prepayment to prevent fake bookings) but nothing stuck. The pivot to a to-do list on 29 April cost the team about two weeks of upfront design effort.

**Self-Assessment:** 7/10

---

## Task 2 — UI Implementation

**Week:** 02/05/2026 – 17/05/2026

**Work:**

- **Task detail modal / page** — built the first version of the per-task detail view on the `phung02` branch. Tony later refactored it into the main branch's task-detail modal.
- **Drag-and-drop (initial)** — implemented the first drag-and-drop reordering for board tasks on `phung02`; later replaced by Tony's final implementation on `main`.
- **Member assignment + due dates** — added the ability to assign a team member to a task and set a specific due date and time on task creation.
- **Calendar (rebuild)** — added the Calendar to the page on the `add-calendar` branch, building on Mai's earlier Notion-style calendar work.

**Evidence of contribution:**

- `5d433c8` — Improve loading performances in dashboard and stats (branch `phung02`, 2026-05-15)
- `87ffcc0` — Adding task detail page, improve loading performance, fixing board drag (branch `phung02`, 2026-05-15)
- `0731d1c` — Adding add mem and due date (branch `phung02`, 2026-05-16)
- `d7078b5` — Fixing some problems in task detail modal (branch `phung02`, 2026-05-16)
- `08ab835` — Fix some problems (branch `phung02`, 2026-05-16)
- `8ca14b3` — Adding calendar to page (branch `add-calendar`, 2026-05-17)

**Problems:**

Most of my conflicts were with `.env` / `.env.local` files or wrong base URLs. One major incident: a teammate merged a feature branch directly into `main` and broke the Supabase database — fixing it required reverting and re-running `prisma db push` against `DIRECT_URL`.

**Self-Assessment:** 8/10

---

## Task 3 — Database Integration

**Week:** 13/05/2026 – 17/05/2026

**Work:**

- **User-display query** — wrote the first query to list users on the website (later revised by Tony to use the `syncUser` server cache).
- **Task-detail schema** — designed the shape of the data the Task Detail modal expects (status, priority, assignee, start/end dates) so it lined up with the Prisma model on the backend.

**Evidence of contribution:**

- `56555e2` — Fix the tab and error (branch `phung`, 2026-05-14)
- `5d433c8` / `87ffcc0` — improved performance and task-detail integration (branch `phung02`)

**Problems:**

The user-display query was rewritten by Tony after the `syncUser` cache landed, because my version was firing a fresh DB call on every render.

**Self-Assessment:** 6/10

---

## Task 4 — Optimization

**Week:** 15/05/2026

**Work:**

- **Loading performance in Dashboard / Stats** — improved the loading state and reduced redundant fetches on the dashboard before Tony's SWR refactor on `main`.
- Several `Fix env.local file` / `Fix some problems` commits cleaning up the branch before merging back.

**Evidence of contribution:**

- `5d433c8` — Improve loading performances in dashboard and stats (2026-05-15)
- `60c8df5` — Fix env.local file (2026-05-15)

**Self-Assessment:** 6/10

---

## Task 5 — Peer Review

**Week:** Limited involvement.

**Work:**

Participated in internal team review discussions on the task-detail modal and calendar work but did not lead an external peer review.

**Self-Assessment:** 5/10

---

## Personal Contribution Summary

I owned the **Task Detail modal**, the **assign member + due date** flow, and the **Calendar rebuild**, plus the early **drag-and-drop prototype** that Tony later replaced with the final implementation on `main`. Most of my code lives on the `phung` / `phung02` / `add-calendar` feature branches; some of it was kept and refactored in `main`, some was replaced. The biggest thing I learned was that branching too far from `main` makes it expensive to come back — next project I'd rebase more often.

**Estimated % contribution to the team:** ~15%

**Overall Self-Assessment Score:** 7/10
