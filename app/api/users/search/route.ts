import { NextRequest, NextResponse } from 'next/server';
import { searchUsers } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get('q')?.toLowerCase() || '';

    if (!query) {
      return NextResponse.json([]);
    }

    const users = await searchUsers(query);
    const results = users.map((user) => ({
      id: user.id,
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error('Failed to search users:', error);
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    );
  }
}
