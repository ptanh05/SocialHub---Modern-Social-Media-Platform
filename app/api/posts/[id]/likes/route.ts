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
  getUserById,
  pushSSEEvent,
} from '@/lib/db';
import { sendEmail, notifyNewLikeEmail } from '@/lib/email';

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
        try {
          await pushSSEEvent(post.userId, 'notification:like', {
            postId: id,
            actorId: payload.userId,
          });
        } catch (e) {
          console.error('SSE push failed:', e);
        }

        // Gửi email notification nếu người nhận có bật email_notifications
        if (prefs?.emailNotifications) {
          const [postAuthor, liker] = await Promise.all([
            getUserById(post.userId),
            getUserById(payload.userId),
          ]);
          if (postAuthor && liker) {
            const emailContent = notifyNewLikeEmail(
              postAuthor.name,
              liker.name,
              liker.username,
              post.content,
              id
            );
            await sendEmail({ to: postAuthor.email, ...emailContent });
          }
        }
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