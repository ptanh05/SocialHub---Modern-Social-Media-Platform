import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getAllPosts, createPost, getUserById } from '@/lib/db';
import { createPostSchema } from '@/lib/schemas';

const PAGE_SIZE = 10;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || String(PAGE_SIZE), 10);
    const offset = (page - 1) * limit;

    const posts = await getAllPosts();
    const total = posts.length;
    const paginatedPosts = posts.slice(offset, offset + limit);

    // Attach author info to each post
    const postsWithAuthors = await Promise.all(
      paginatedPosts.map(async (post) => {
        const author = await getUserById(post.userId);
        return {
          ...post,
          author: author
            ? { id: author.id, name: author.name, username: author.username, avatar: author.avatar }
            : null,
        };
      })
    );

    return NextResponse.json({
      posts: postsWithAuthors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createPostSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { content, image } = validation.data;
    const post = await createPost(payload.userId, content, image);

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Failed to create post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
