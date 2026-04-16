import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import {
  getPostById,
  addComment,
  getCommentsByPostId,
  getUserById,
  createNotification,
  getUserPreferences,
} from '@/lib/db';
import { commentSchema } from '@/lib/schemas';
import { sendEmail, notifyNewCommentEmail } from '@/lib/email';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const post = await getPostById(id);

    if (!post) {
      return NextResponse.json({ error: 'Bài viết không tìm thấy' }, { status: 404 });
    }

    const comments = await getCommentsByPostId(id);

    // Lấy thông tin author cho mỗi comment
    const commentsWithAuthors = await Promise.all(
      comments.map(async (comment) => {
        const author = await getUserById(comment.userId);
        return {
          ...comment,
          author: author
            ? { id: author.id, name: author.name, username: author.username, avatar: author.avatar }
            : null,
        };
      })
    );

    return NextResponse.json(commentsWithAuthors);
  } catch (error) {
    console.error('Lỗi khi lấy bình luận:', error);
    return NextResponse.json(
      { error: 'Lỗi khi lấy bình luận' },
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

    const body = await request.json();
    const validation = commentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { content } = validation.data;
    const comment = await addComment(payload.userId, id, content);

    // Lấy thông tin author của comment
    const author = await getUserById(payload.userId);
    const commentWithAuthor = {
      ...comment,
      author: author
        ? { id: author.id, name: author.name, username: author.username, avatar: author.avatar }
        : null,
    };

    // Tạo thông báo cho chủ bài viết (không thông báo chính mình)
    if (post.userId !== payload.userId) {
      const prefs = await getUserPreferences(post.userId);
      if (prefs?.notificationSettings.comments !== false) {
        await createNotification(
          post.userId,
          'comment',
          payload.userId,
          id,
          content.length > 50 ? content.substring(0, 50) + '...' : content
        );

        // Gửi email notification nếu người nhận có bật email_notifications
        if (prefs?.emailNotifications && author) {
          const postAuthor = await getUserById(post.userId);
          if (postAuthor) {
            const emailContent = notifyNewCommentEmail(
              postAuthor.name,
              author.name,
              author.username,
              content,
              post.content
            );
            await sendEmail({ to: postAuthor.email, ...emailContent });
          }
        }
      }
    }

    return NextResponse.json(commentWithAuthor, { status: 201 });
  } catch (error) {
    console.error('Lỗi khi tạo bình luận:', error);
    return NextResponse.json(
      { error: 'Lỗi khi tạo bình luận' },
      { status: 500 }
    );
  }
}