import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getPostById, addLike, removeLike, isPostLikedByUser, getLikeCount } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const post = await getPostById(id);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const likeCount = await getLikeCount(id);
    const token = request.cookies.get('auth_token')?.value;
    let liked = false;

    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        liked = await isPostLikedByUser(payload.userId, id);
      }
    }

    return NextResponse.json({ likeCount, liked });
  } catch (error) {
    console.error('Failed to fetch likes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch likes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { id } = await params;
    const post = await getPostById(id);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if already liked
    const alreadyLiked = await isPostLikedByUser(payload.userId, id);
    if (alreadyLiked) {
      return NextResponse.json(
        { error: 'Already liked' },
        { status: 400 }
      );
    }

    await addLike(payload.userId, id);
    const likeCount = await getLikeCount(id);

    return NextResponse.json({ likeCount });
  } catch (error) {
    console.error('Failed to like post:', error);
    return NextResponse.json(
      { error: 'Failed to like post' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { id } = await params;
    const post = await getPostById(id);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if liked
    const isLiked = await isPostLikedByUser(payload.userId, id);
    if (!isLiked) {
      return NextResponse.json(
        { error: 'Not liked' },
        { status: 400 }
      );
    }

    await removeLike(payload.userId, id);
    const likeCount = await getLikeCount(id);

    return NextResponse.json({ likeCount });
  } catch (error) {
    console.error('Failed to unlike post:', error);
    return NextResponse.json(
      { error: 'Failed to unlike post' },
      { status: 500 }
    );
  }
}