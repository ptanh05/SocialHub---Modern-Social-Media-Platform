import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername, getPostsByUserId } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await params;
    const user = await getUserByUsername(username);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const posts = await getPostsByUserId(user.id);
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Failed to fetch user posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user posts' },
      { status: 500 }
    );
  }
}