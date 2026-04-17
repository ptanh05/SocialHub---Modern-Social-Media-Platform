import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getBookmarkedPosts, getUserById } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const posts = await getBookmarkedPosts(payload.userId);
    const postsWithAuthors = await Promise.all(
      posts.map(async (post) => {
        const author = await getUserById(post.user_id);
        return {
          ...post,
          author: author
            ? { id: author.id, name: author.name, username: author.username, avatar: author.avatar }
            : null,
        };
      }),
    );

    return NextResponse.json(postsWithAuthors);
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
