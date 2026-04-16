import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getUserByUsername, blockUser, unblockUser, isUserBlocked } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { username } = await params;
    const targetUser = await getUserByUsername(username);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (targetUser.id === payload.userId) {
      return NextResponse.json({ error: 'Cannot block yourself' }, { status: 400 });
    }

    const alreadyBlocked = await isUserBlocked(payload.userId, targetUser.id);
    if (alreadyBlocked) {
      return NextResponse.json({ error: 'User already blocked' }, { status: 400 });
    }

    await blockUser(payload.userId, targetUser.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error blocking user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { username } = await params;
    const targetUser = await getUserByUsername(username);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const success = await unblockUser(payload.userId, targetUser.id);

    if (!success) {
      return NextResponse.json({ error: 'User not blocked' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unblocking user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}