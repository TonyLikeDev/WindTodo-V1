# WindTodo — The Purified Kanban Workspace

A peaceful, sky-inspired collaborative task and project management system. Built with a glassmorphism-first philosophy, optimized for real-time collaboration, and hardened for performance.

## 🚀 Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 4, Custom Glassmorphism Design System
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma 6
- **Auth:** Supabase Authentication (SSR + Session Cookies)
- **Data Fetching:** SWR (Optimistic UI, Stale-While-Revalidate)
- **Charts:** Recharts (Analytics Dashboard)
- **Icons:** Lucide React
- **Deployment:** Vercel (Tokyo Region)

## ️ Project Structure

```
WindTodo-V1/
├── prisma/
│   ── schema.prisma              # Database schema (User, Task, Project, ProjectMember, BoardList)
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── actions/               # Server Actions (auth, tasks, projects, stats)
│   │   ├── dashboard/             # Authenticated workspace (overview, stats, users, settings)
│   │   ├── projects/[projectId]/  # Dynamic Kanban board per project
│   │   ├── login/ & signup/       # Auth pages
│   │   └── layout.tsx             # Root layout (Poppins font, metadata)
│   ├── components/
│   │   ├── ProjectBoard.tsx       # Full Kanban board with custom drag-and-drop
│   │   ├── BoardColumn.tsx        # Individual column with task cards
│   │   ├── BoardDragContext.tsx   # Custom DnD implementation (no external library)
│   │   ├── TaskDetailModal.tsx    # Task edit modal with properties panel
│   │   ├── StatsDashboard.tsx     # Analytics with pie, bar, and radial charts
│   │   ├── SkyBackground.tsx      # Animated sky/cloud background
│   │   ├── GlassCard.tsx          # Reusable glassmorphism card
│   │   └── Sidebar.tsx            # Dashboard navigation
│   ├── lib/
│   │   └── prisma.ts              # PrismaClient singleton (PgBouncer-aware)
│   └── utils/supabase/            # Supabase SSR client, browser client, middleware
├── next.config.ts                 # Image config, Prisma engine tracing
├── vercel.json                    # Deploy region configuration
└── package.json                   # Dependencies and scripts
```

## ⚙️ Core Principles

### Collaboration-First
- Role-based access control per project (ADMIN / MEMBER)
- Share boards by email or username
- Real-time member avatars in board headers
- Project creator is implicit ADMIN

### Performance Optimized
- Custom drag-and-drop implementation (zero external DnD dependencies)
- SWR with optimistic updates and deduping intervals
- `React.cache()` for auth user resolution to avoid redundant DB calls
- In-memory sync cache to skip redundant user syncs per server instance
- PgBouncer connection pooling for serverless environments

### Data Integrity
- Server Actions handle all mutations with authorization checks
- Cascade deletes: BoardList → Tasks, Project → ProjectMember
- Composite unique constraints on ProjectMember (projectId, userId)
- Indexed queries on frequently accessed fields (userId, listId, position)

### UI/UX
- Glassmorphism design system (`.glass`, `.glass-dark`, `.sidebar-glass`)
- Sky-themed animated background with cloud layers
- Poppins font family for clean typography
- Responsive design with mobile sidebar toggle
- Loading skeletons and smooth animations throughout

## ️ Getting Started

### Prerequisites
- Node.js 20+
- npm or pnpm
- Supabase project (for Auth + PostgreSQL)

### Installation

```bash
npm install
```

### Environment Setup

Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
DATABASE_URL=postgresql://<user>:<pass>@<pooler-host>:6543/<db>?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://<user>:<pass>@<pooler-host>:5432/<db>
```

### Database Management

```bash
npx prisma generate    # Generate Prisma Client
npx prisma db push     # Apply schema to database
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build    # Generates Prisma Client + builds Next.js
npm run start    # Starts production server
```

## 🧪 Quality Assurance

- **Typecheck:** `npx tsc --noEmit`
- **Lint:** `npm run lint`
- **Schema Validation:** `npx prisma validate`
- **Health Check:** `npx prisma db pull` to verify schema sync

##  Deployment

Deployed on Vercel in the Tokyo region (`hnd1`). Prisma engine binaries are included in output tracing for serverless compatibility.

```bash
vercel --prod
```
