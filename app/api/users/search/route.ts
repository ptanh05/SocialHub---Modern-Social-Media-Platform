import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get('q')?.toLowerCase() || '';

    if (!query) {
      return NextResponse.json([]);
    }

    const db = await getDb();
    const likePattern = `%${query}%`;
    const rows = db.prepare(
      'SELECT * FROM users WHERE username LIKE ? OR name LIKE ? LIMIT 10'
    ).all(likePattern, likePattern) as Record<string, unknown>[];

    const results = rows.map((user) => ({
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