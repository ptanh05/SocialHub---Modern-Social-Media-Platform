import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername, getFollowerCount, getFollowingCount } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await params;
    const user = await getUserByUsername(username);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const followers = await getFollowerCount(user.id);
    const following = await getFollowingCount(user.id);

    return NextResponse.json({
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      bio: user.bio,
      avatar: user.avatar,
      createdAt: user.createdAt,
      followers,
      following,
    });
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}