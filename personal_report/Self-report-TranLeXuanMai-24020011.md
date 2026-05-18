# Self-Report — Tran Le Xuan Mai

## Personal Information

|                |                                                       |
| -------------- | ----------------------------------------------------- |
| **Full name**  | Tran Le Xuan Mai                                      |
| **Student ID** | 24020011                                              |
| **Team**       | WindToDo                                              |
| **Role**       | Frontend — Dashboard scaling, Statistics charts, Notion-style Calendar |
| **GitHub**     | [xuanmai171202-spec](https://github.com/xuanmai171202-spec) |
| **Commits**    | 3 on feature branch `Change-Dashboard` (no commits on `main` — work merged in via Tony's PR pipeline) |

---

## Task 1 — Planning & Setup

**Week:** 08/05/2026 – 12/05/2026

**Work:**

- Joined the team meetings that decided the project pivot to a to-do list app.
- Helped sketch the dashboard UI on the whiteboard during the in-person session in Room 403, then translated those sketches into the metrics list that drove the Statistics page.
- Discussed schema design with the team (especially around how member progress and workload would be stored / computed).

**Evidence of contribution:**

- Design discussions captured in the team's shared Google Docs (linked in Hung's self-report).
- Branch setup on `Change-Dashboard`.

**Problems:**

The first two weeks were spent on the restaurant-reservation idea that the team eventually pivoted away from, so a lot of the early design work didn't carry forward.

**Self-Assessment:** 7/10

---

## Task 2 — UI Implementation

**Week:** 16/05/2026 – 17/05/2026

**Work:**

- **Dashboard layout scaling** — upgraded the dashboard layout so it scales well across breakpoints; added the **Members Progress Table** and the **Workload Pie/Donut Chart** on top of Nam's Statistics scaffolding.
- **Notion-style Calendar** — built the first Calendar view that lets the team see tasks and events week / month / year; integrated drag-and-drop for events. (Hung later rebuilt parts of this on the `add-calendar` branch.)
- **README update** — updated the project README with the premium SkyTodo feature set and a local access link.

**Evidence of contribution:**

- `0ce2ad4` — feat: upgrade SkyTodo to Enterprise Suite with Notion-style Calendar and add-ons (2026-05-16)
- `b9517b9` — feat: upgrade dashboard layout scaling, add members progress table, pie-donut chart (2026-05-17)
- `2a1d9d2` — docs: update README with premium SkyTodo features and local access link (2026-05-17)

**Problems:**

Coordinating with Nam's parallel dashboard work on Branch 32 caused merge conflicts in shared dashboard files; resolving them required reading Nam's commits carefully and rebasing.

**Self-Assessment:** 8/10

---

## Task 3 — Database Integration

**Week:** 13/05/2026 – 15/05/2026 (limited)

**Work:**

- Helped define the **schema fields** needed for the Members Progress Table and Workload pie chart (task counts grouped by assignee and status).
- The actual DB queries that feed these charts were implemented inside the dashboard components by me on the `Change-Dashboard` branch.

**Evidence of contribution:**

- Members-progress and workload computation included in `b9517b9` (2026-05-17).

**Problems:**

Computing per-member progress correctly took more iteration than expected, especially when the same task was reassigned mid-cycle — ended up grouping by current assignee and ignoring historical reassignments.

**Self-Assessment:** 7/10

---

## Task 4 — Optimization

**Week:** 17/05/2026

**Work:**

- Re-laid out the dashboard so it scales smoothly down to mobile widths (part of `b9517b9`).
- Smaller polish work on the pie chart legend and members-progress table responsiveness.

**Self-Assessment:** 7/10

---

## Task 5 — Peer Review

**Week:** 15/05/2026 – 17/05/2026

**Work:**

- Reviewed the dashboard / statistics work inside the team and gave feedback to Nam on the metrics layout.
- Did not lead an external peer review.

**Self-Assessment:** 6/10

---

## Personal Contribution Summary

I built the **Notion-style Calendar (initial)**, the **Members Progress Table**, and the **Workload pie/donut chart** that make the Statistics page useful, plus the **dashboard layout-scaling pass** that fixed the layout on smaller screens. Most of my work lives on the `Change-Dashboard` branch and was merged into `main` via Tony's PR pipeline, so my GitHub author stats undersell what I shipped. The biggest lesson was learning to coordinate parallel branches when two people are editing the same dashboard area.

**Estimated % contribution to the team:** ~15%

**Overall Self-Assessment Score:** 7/10
