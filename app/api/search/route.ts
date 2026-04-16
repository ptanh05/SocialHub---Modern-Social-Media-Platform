import { NextRequest, NextResponse } from 'next/server';
import { getAllPosts, searchUsers } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase() || '';

    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
    }

    // Fetch posts matching query
    const allPosts = await getAllPosts();
    const matchedPosts = allPosts.filter(
      (post) =>
        post.content.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(`#${query}`)
    );

    // Search users
    const users = await searchUsers(query);
    const matchedUsers = users.map((u) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      avatar: u.avatar,
      bio: u.bio,
    }));

    return NextResponse.json({ posts: matchedPosts, users: matchedUsers });
  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
