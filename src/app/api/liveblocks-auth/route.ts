import { Liveblocks } from '@liveblocks/node';
import { getAuthUser } from '@/app/actions/userActions';

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY || 'mock-secret',
});

export async function POST(request: Request) {
  if (!process.env.LIVEBLOCKS_SECRET_KEY) {
    return new Response(JSON.stringify({ error: 'Liveblocks is not configured' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const user = await getAuthUser();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Generate a consistent color index based on the user's ID
  const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#06b6d4', '#a855f7'];
  const colorIndex =
    Math.abs(
      user.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    ) % colors.length;
  const color = colors[colorIndex];

  // Set up the session with user metadata
  const session = liveblocks.prepareSession(user.id, {
    userInfo: {
      name: user.name,
      image: user.image,
      color: color,
    },
  });

  try {
    const { room } = await request.json();
    if (room) {
      // Grant full access to the specified project room
      session.allow(room, session.FULL_ACCESS);
    }
  } catch (e) {
    // If request has no JSON body or room is not provided, do nothing
  }

  const { status, body } = await session.authorize();
  return new Response(body, { status });
}
