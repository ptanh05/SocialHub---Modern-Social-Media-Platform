import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getPostById, addRepost, removeRepost, isPostRepostedByUser, getRepostCount } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const post = await getPostById(id);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const count = await getRepostCount(id);
    const token = request.cookies.get('auth_token')?.value;
    let reposted = false;

    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        reposted = await isPostRepostedByUser(payload.userId, id);
      }
    }

    return NextResponse.json({ reposted, count });
  } catch (error) {
    console.error('Failed to fetch repost status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch repost status' },
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

    const alreadyReposted = await isPostRepostedByUser(payload.userId, id);
    if (alreadyReposted) {
      return NextResponse.json({ error: 'Already reposted' }, { status: 400 });
    }

    await addRepost(payload.userId, id);
    const count = await getRepostCount(id);

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Failed to repost:', error);
    return NextResponse.json(
      { error: 'Failed to repost' },
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

    const isReposted = await isPostRepostedByUser(payload.userId, id);
    if (!isReposted) {
      return NextResponse.json({ error: 'Not reposted' }, { status: 400 });
    }

    await removeRepost(payload.userId, id);
    const count = await getRepostCount(id);

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Failed to remove repost:', error);
    return NextResponse.json(
      { error: 'Failed to remove repost' },
      { status: 500 }
    );
  }
}
