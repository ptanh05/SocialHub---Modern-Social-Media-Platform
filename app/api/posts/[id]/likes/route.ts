import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import {
  getPostById,
  addLike,
  removeLike,
  isPostLikedByUser,
  getLikeCount,
  createNotification,
  getUserPreferences,
} from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const post = await getPostById(id);

    if (!post) {
      return NextResponse.json({ error: 'Bài viết không tìm thấy' }, { status: 404 });
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
    console.error('Lỗi khi lấy lượt thích:', error);
    return NextResponse.json(
      { error: 'Lỗi khi lấy lượt thích' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Token không hợp lệ' }, { status: 401 });
    }

    const { id } = await params;
    const post = await getPostById(id);

    if (!post) {
      return NextResponse.json({ error: 'Bài viết không tìm thấy' }, { status: 404 });
    }

    const alreadyLiked = await isPostLikedByUser(payload.userId, id);
    if (alreadyLiked) {
      return NextResponse.json(
        { error: 'Đã thích bài viết này' },
        { status: 400 }
      );
    }

    await addLike(payload.userId, id);
    const likeCount = await getLikeCount(id);

    // Tạo thông báo cho chủ bài viết (không thông báo chính mình)
    if (post.userId !== payload.userId) {
      const prefs = await getUserPreferences(post.userId);
      if (prefs?.notificationSettings.likes !== false) {
        await createNotification(post.userId, 'like', payload.userId, id);
      }
    }

    return NextResponse.json({ likeCount });
  } catch (error) {
    console.error('Lỗi khi thích bài viết:', error);
    return NextResponse.json(
      { error: 'Lỗi khi thích bài viết' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Token không hợp lệ' }, { status: 401 });
    }

    const { id } = await params;
    const post = await getPostById(id);

    if (!post) {
      return NextResponse.json({ error: 'Bài viết không tìm thấy' }, { status: 404 });
    }

    const isLiked = await isPostLikedByUser(payload.userId, id);
    if (!isLiked) {
      return NextResponse.json(
        { error: 'Chưa thích bài viết này' },
        { status: 400 }
      );
    }

    await removeLike(payload.userId, id);
    const likeCount = await getLikeCount(id);

    return NextResponse.json({ likeCount });
  } catch (error) {
    console.error('Lỗi khi bỏ thích bài viết:', error);
    return NextResponse.json(
      { error: 'Lỗi khi bỏ thích bài viết' },
      { status: 500 }
    );
  }
}