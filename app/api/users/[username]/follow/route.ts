import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getUserByUsername, addFollow, removeFollow, isFollowing } from '@/lib/db';

export async function POST(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { username } = await params;
    const targetUser = await getUserByUsername(username);

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (targetUser.id === payload.userId) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      );
    }

    const following = await isFollowing(payload.userId, targetUser.id);
    if (following) {
      return NextResponse.json(
        { error: 'Already following' },
        { status: 400 }
      );
    }

    await addFollow(payload.userId, targetUser.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to follow user:', error);
    return NextResponse.json(
      { error: 'Failed to follow user' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { username } = await params;
    const targetUser = await getUserByUsername(username);

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const following = await isFollowing(payload.userId, targetUser.id);
    if (!following) {
      return NextResponse.json(
        { error: 'Not following' },
        { status: 400 }
      );
    }

    await removeFollow(payload.userId, targetUser.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to unfollow user:', error);
    return NextResponse.json(
      { error: 'Failed to unfollow user' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const { username } = await params;
    const targetUser = await getUserByUsername(username);

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let isUserFollowing = false;
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        isUserFollowing = await isFollowing(payload.userId, targetUser.id);
      }
    }

    return NextResponse.json({ following: isUserFollowing });
  } catch (error) {
    console.error('Failed to check follow status:', error);
    return NextResponse.json(
      { error: 'Failed to check follow status' },
      { status: 500 }
    );
  }
}