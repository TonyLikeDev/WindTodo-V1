# Self-Report — Le Van Cong Nguyen

## Personal Information

|                |                                                       |
| -------------- | ----------------------------------------------------- |
| **Full name**  | Le Van Cong Nguyen                                    |
| **Student ID** | 24020006                                              |
| **Team**       | WindToDo                                              |
| **Role**       | UI/UX Design + Frontend — Celestial Theme, Light/Dark Mode, Gamification |
| **GitHub**     | [nguyendangban0605-beep](https://github.com/nguyendangban0605-beep) |
| **Commits**    | 4 on branch `theme-celestial-darkmode` (all on 2026-05-17) |

---

## Task 1 — Planning & Design (off-GitHub)

**Week:** 29/04/2026 – 17/05/2026

**Work:**

A large part of my contribution lived **outside the repo**: I led the UI/UX ideation for the project's visual identity.

- **Theme research and concept** — proposed the *Celestial* theme: sun + moon + clouds against soft sky gradients, paired with glassmorphism surfaces. Sketched the vector layouts in Figma before any code was written.
- **Accessibility colour palette** — chose contrast-safe combinations so text stays legible on both the light sky-blue background and the dark indigo background. (Used WCAG contrast targets.)
- **Light/Dark interaction model** — designed the toggle behaviour and decided which surfaces should switch and which should stay (e.g. inputs stay white in light mode but become translucent dark glass in dark mode).
- **Gamification concept** — designed the "task completed" celebration: star confetti animation paired with a soft celestial bell chime.

**Evidence of contribution:**

- Figma design files (shared with the team).
- Branch name `theme-celestial-darkmode` (created to land the code that implements the design).

**Problems:**

A lot of the ideation work isn't reflected in commit history because it happened in Figma and meetings, not in code. Translating the design into Tailwind v4 + `next-themes` later took longer than expected because of incompatibilities between the two.

**Self-Assessment:** 8/10

---

## Task 2 — UI Implementation

**Week:** 17/05/2026

**Work:**

- **Celestial Theme + Light/Dark Mode** — implemented the design in code: light-mode shows a static sky gradient with a rising sun and clouds; dark-mode shows a deep-indigo "moonlight" surface. Integrated `next-themes` with Tailwind v4 using a `@custom-variant dark` to fix a known compatibility issue (where Tailwind v4's CSS-first config doesn't pair cleanly with `next-themes`' class strategy out of the box).
- **Input contrast fix** — found and fixed a "white text on white background" bug in dark mode inputs by switching the affected surfaces (inputs, settings cards, task cards) to `dark:bg-black/25` glass.
- **Star confetti + celestial chime** — implemented the gamification: a canvas-based star particle animation paired with a sound generated on the fly via the Web Audio API (no external audio file, avoids load latency). The animation + sound fire when a task is marked Done from either the list view or the Kanban "Done" column.
- **Login page polish** — restored the static sky-gradient styling on the login page after a regression in the global background.
- **Autofill style override** — overrode the browser's dark-autofill yellow input fill so the Celestial theme stays consistent.

**Evidence of contribution:**

- `2b4dc3c` — feat: implement celestial theme light/dark mode and fix input text contrast (2026-05-17)
- `8ea84cb` — feat: implement immersive task gamification (celestial bell chime and star confetti) (2026-05-17)
- `d61a21c` — style: restore static sky gradient and beautiful light-theme styling to login (2026-05-17)
- `e86995f` — fix: override browser dark-autofill styles inside LightSkyBackground (2026-05-17)

**Problems:**

- Tailwind v4 + `next-themes` did not pair cleanly until I added the `@custom-variant dark` configuration.
- Browser dark-mode autofill kept overriding the input styling and required a vendor-prefixed override.

**Self-Assessment:** 8/10

---

## Task 3 — Database Integration

Not directly involved. My branch only touched UI / theming code.

**Self-Assessment:** —

---

## Task 4 — Optimization

**Week:** 17/05/2026

**Work:**

- Generated the chime sound at runtime via Web Audio API instead of loading an audio file, eliminating audio-load latency.
- Made sure the confetti canvas doesn't keep running after the animation completes (avoids a needless render loop).

**Evidence of contribution:**

- `8ea84cb` — gamification commit (audio is synthesised, not fetched).

**Self-Assessment:** 7/10

---

## Task 5 — Peer Review

**Week:** 17/05/2026

**Work:**

- Reviewed the team's PRs (especially Tony's `theme-layout` PR) to make sure my Celestial theme work composed cleanly with the sky-themed light design Tony was shipping.
- Coordinated the merge of `theme-celestial-darkmode` so it didn't conflict with `main`.

**Self-Assessment:** 7/10

---

## Personal Contribution Summary

I owned the **visual identity** of WindToDo: the Celestial theme concept, the colour-palette decisions for both light and dark modes, the input contrast fixes, and the **gamification flourish** (star confetti + celestial chime on task completion). A significant part of my contribution was design work in Figma and team discussions that don't show in `git log`. The four commits on `theme-celestial-darkmode` are where that design became code. The biggest thing I learned was how to make Tailwind v4 cooperate with `next-themes` — and how much polish a small audio + animation flourish can add to an otherwise functional app.

**Estimated % contribution to the team:** ~15%

**Overall Self-Assessment Score:** 6/10
