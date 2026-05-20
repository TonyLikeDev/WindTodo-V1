const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const OWNER_EMAIL = 'aividmaking1@gmail.com';
const PROJECT_NAME = 'Welcome To WindTodo';
const PROJECT_COLOR = 'rgba(56, 189, 248, 0.18)';

const DEFAULT_COLUMNS = [
  { name: 'To Do',       color: 'rgba(100, 116, 139, 0.15)', position: 0 },
  { name: 'In Progress', color: 'rgba(59, 130, 246, 0.15)',  position: 1 },
  { name: 'Done',        color: 'rgba(34, 197, 94, 0.15)',   position: 2 },
];

const d = (iso) => new Date(`${iso}T09:00:00.000Z`);

const TASKS_BY_LIST = {
  'Done': [
    { title: 'Sign up for WindTodo',                 description: 'Create your WindTodo account to get started.',                  startDate: d('2026-04-01'), endDate: d('2026-04-01'), status: 'DONE', priority: 'MEDIUM', type: 'TASK' },
    { title: 'Verify your email address',            description: 'Click the confirmation link in your inbox.',                    startDate: d('2026-04-02'), endDate: d('2026-04-02'), status: 'DONE', priority: 'LOW',    type: 'TASK' },
    { title: 'Open your first board',                description: 'Land on the dashboard and explore the layout.',                 startDate: d('2026-04-05'), endDate: d('2026-04-06'), status: 'DONE', priority: 'MEDIUM', type: 'TASK' },
    { title: 'Read the welcome message',             description: 'Skim the project tips bubble in the bottom corner.',            startDate: d('2026-04-10'), endDate: d('2026-04-11'), status: 'DONE', priority: 'LOW',    type: 'STORY' },
    { title: 'Pick a theme color for this board',    description: 'Choose a color that fits your project vibe.',                   startDate: d('2026-04-18'), endDate: d('2026-04-20'), status: 'DONE', priority: 'LOW',    type: 'TASK' },
    { title: 'Complete the first onboarding task',   description: 'Move this card from In Progress to Done by dragging it.',       startDate: d('2026-04-25'), endDate: d('2026-04-28'), status: 'DONE', priority: 'MEDIUM', type: 'TASK' },
  ],
  'In Progress': [
    { title: 'Explore the Board view',               description: 'Get familiar with columns, drag-and-drop, and quick add.',       startDate: d('2026-05-04'), endDate: d('2026-05-22'), status: 'IN_PROGRESS', priority: 'MEDIUM', type: 'TASK' },
    { title: 'Write task descriptions',              description: 'Open a task and add some context in the description editor.',    startDate: d('2026-05-06'), endDate: d('2026-05-24'), status: 'IN_PROGRESS', priority: 'LOW',    type: 'TASK' },
    { title: 'Set priorities on your tasks',         description: 'Mark anything urgent so it stands out on the board.',            startDate: d('2026-05-08'), endDate: d('2026-05-26'), status: 'IN_PROGRESS', priority: 'HIGH',   type: 'TASK' },
    { title: 'Try the Calendar view',                description: 'Switch to the calendar to see tasks laid out by date.',          startDate: d('2026-05-10'), endDate: d('2026-05-28'), status: 'IN_PROGRESS', priority: 'MEDIUM', type: 'STORY' },
    { title: 'Try the Roadmap view',                 description: 'See start and end dates as bars across a timeline.',             startDate: d('2026-05-12'), endDate: d('2026-05-30'), status: 'IN_PROGRESS', priority: 'MEDIUM', type: 'STORY' },
    { title: 'Test the mobile layout',               description: 'Resize the window or open WindTodo on your phone.',              startDate: d('2026-05-14'), endDate: d('2026-06-01'), status: 'IN_PROGRESS', priority: 'MEDIUM', type: 'TASK' },
    { title: 'Reorder columns on the board',         description: 'Drag a column header to a new position.',                        startDate: d('2026-05-16'), endDate: d('2026-06-03'), status: 'IN_PROGRESS', priority: 'LOW',    type: 'TASK' },
  ],
  'To Do': [
    { title: 'Create your first sprint',             description: 'Group related tasks into a time-boxed sprint.',                  startDate: d('2026-05-22'), endDate: d('2026-06-05'), status: 'TODO', priority: 'HIGH',   type: 'STORY' },
    { title: 'Invite a teammate to this board',      description: 'Share the board and assign a role.',                             startDate: d('2026-05-25'), endDate: d('2026-05-28'), status: 'TODO', priority: 'MEDIUM', type: 'TASK' },
    { title: 'Assign a task to someone',             description: 'Open any task and pick an assignee from your team.',             startDate: d('2026-05-30'), endDate: d('2026-06-02'), status: 'TODO', priority: 'MEDIUM', type: 'TASK' },
    { title: 'Customize column colors',              description: 'Use the column menu to make the board your own.',                startDate: d('2026-06-03'), endDate: d('2026-06-05'), status: 'TODO', priority: 'LOW',    type: 'TASK' },
    { title: 'Add a fourth column to this board',    description: 'Click "Add list" to extend your workflow.',                      startDate: d('2026-06-08'), endDate: d('2026-06-10'), status: 'TODO', priority: 'LOW',    type: 'TASK' },
    { title: 'Report a bug you found',               description: 'Create a BUG-type task so it stands out.',                       startDate: d('2026-06-12'), endDate: d('2026-06-14'), status: 'TODO', priority: 'HIGH',   type: 'BUG' },
    { title: 'Plan your next project',               description: 'Head back to the dashboard and create a brand-new board.',       startDate: d('2026-06-20'), endDate: d('2026-06-25'), status: 'TODO', priority: 'MEDIUM', type: 'STORY' },
  ],
};

async function main() {
  const owner = await prisma.user.findUnique({ where: { email: OWNER_EMAIL } });
  if (!owner) {
    throw new Error(`User ${OWNER_EMAIL} not found. Sign in once so the account is provisioned, then re-run.`);
  }
  console.log(`Owner: ${owner.name || owner.email} (${owner.id})`);

  const project = await prisma.project.create({
    data: {
      name: PROJECT_NAME,
      color: PROJECT_COLOR,
      userId: owner.id,
      members: {
        create: { userId: owner.id, role: 'ADMIN' },
      },
    },
  });
  console.log(`Created project: ${project.name} (${project.id})`);

  await prisma.boardList.createMany({
    data: DEFAULT_COLUMNS.map((c) => ({
      name: c.name,
      color: c.color,
      userId: owner.id,
      projectId: project.id,
      position: c.position,
    })),
  });

  const lists = await prisma.boardList.findMany({
    where: { projectId: project.id },
    orderBy: { position: 'asc' },
  });
  const listByName = Object.fromEntries(lists.map((l) => [l.name, l]));

  let total = 0;
  for (const [listName, tasks] of Object.entries(TASKS_BY_LIST)) {
    const list = listByName[listName];
    if (!list) throw new Error(`Missing list: ${listName}`);

    await prisma.task.createMany({
      data: tasks.map((t, i) => ({
        title: t.title,
        description: t.description,
        userId: owner.id,
        assigneeId: owner.id,
        listId: list.id,
        position: i,
        status: t.status,
        priority: t.priority,
        type: t.type,
        startDate: t.startDate,
        endDate: t.endDate,
      })),
    });
    total += tasks.length;
    console.log(`  ${listName}: +${tasks.length} tasks`);
  }

  console.log(`Seeded ${total} tasks across ${lists.length} lists.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
