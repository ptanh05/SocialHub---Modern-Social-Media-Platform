import { NextRequest, NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase() || '';

    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
    }

    const results: { posts: unknown[]; users: unknown[] } = {
      posts: [],
      users: [],
    };

    // Fetch posts matching query
    const allPosts = await getAllPosts();
    results.posts = allPosts.filter(
      (post) =>
        post.content.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(`#${query}`)
    );

    // Search users with LIKE
    const db = (await import('@/lib/db')).getDb();
    // We need to do a direct query since there's no searchUsers helper exported
    // Use a helper query inline
    // Actually we can use the db.ts pattern - let's do direct SQL via getDb
    // Since we can't import getDb directly, we'll use a workaround
    // Actually let's check if we can do this differently
    // The search route should be able to do SQL LIKE for users
    // We'll need to call getDb inline
    // Since db.ts uses async getDb, we need to handle this
    // Let's just do a direct getDb call
    const { getDb } = await import('@/lib/db');
    const database = await getDb();
    const likePattern = `%${query}%`;
    const userRows = database.prepare(
      'SELECT * FROM users WHERE username LIKE ? OR name LIKE ? LIMIT 10'
    ).all(likePattern, likePattern) as unknown[];
    results.users = userRows.map((r: Record<string, unknown>) => ({
      id: r.id,
      name: r.name,
      username: r.username,
      avatar: r.avatar,
      bio: r.bio,
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}