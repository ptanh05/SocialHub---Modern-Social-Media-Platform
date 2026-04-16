import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { setUserVerified, getUserByUsername } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Check if admin - for demo, just check if userId is 1 (first user is admin)
    if (payload.userId !== '1') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { username } = await params;
    const user = await getUserByUsername(username);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await request.json();
    const { verified } = body;

    await setUserVerified(user.id, verified ?? true);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Verify user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
