import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import {
  getUserByUsername,
  getUserById,
  addFollow,
  removeFollow,
  isFollowing,
  isUserBlocked,
  createNotification,
  getUserPreferences,
  pushSSEEvent,
} from '@/lib/db';
import { sendEmail, notifyNewFollowerEmail } from '@/lib/email';

export async function POST(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Token không hợp lệ' }, { status: 401 });
    }

    const { username } = await params;
    const targetUser = await getUserByUsername(username);

    if (!targetUser) {
      return NextResponse.json({ error: 'Người dùng không tìm thấy' }, { status: 404 });
    }

    if (targetUser.id === payload.userId) {
      return NextResponse.json(
        { error: 'Không thể theo dõi chính mình' },
        { status: 400 }
      );
    }

    // Kiểm tra người dùng hiện tại có bị block bởi người được follow không
    const blockedByTarget = await isUserBlocked(targetUser.id, payload.userId);
    if (blockedByTarget) {
      return NextResponse.json(
        { error: 'Không thể theo dõi người dùng này' },
        { status: 403 }
      );
    }

    // Kiểm tra người dùng hiện tại có block người được follow không
    const blockedTarget = await isUserBlocked(payload.userId, targetUser.id);
    if (blockedTarget) {
      return NextResponse.json(
        { error: 'Bạn đã chặn người dùng này. Hãy bỏ chặn trước.' },
        { status: 400 }
      );
    }

    const following = await isFollowing(payload.userId, targetUser.id);
    if (following) {
      return NextResponse.json(
        { error: 'Đã theo dõi người dùng này' },
        { status: 400 }
      );
    }

    const result = await addFollow(payload.userId, targetUser.id);
    if (!result) {
      return NextResponse.json(
        { error: 'Đã theo dõi người dùng này' },
        { status: 400 }
      );
    }

    // Tạo thông báo follow cho người được follow
    const prefs = await getUserPreferences(targetUser.id);
    if (prefs?.notificationSettings.follows !== false) {
      await createNotification(targetUser.id, 'follow', payload.userId);
      try {
        await pushSSEEvent(targetUser.id, 'notification:follow', {
          actorId: payload.userId,
        });
      } catch (e) {
        console.error('SSE push failed:', e);
      }

      // Gửi email notification nếu người nhận có bật email_notifications
      if (prefs?.emailNotifications) {
        const follower = await getUserById(payload.userId);
        if (follower) {
          const emailContent = notifyNewFollowerEmail(follower.name, follower.username, targetUser.name);
          await sendEmail({ to: targetUser.email, ...emailContent });
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Đã theo dõi người dùng' });
  } catch (error) {
    console.error('Lỗi khi theo dõi người dùng:', error);
    return NextResponse.json(
      { error: 'Lỗi khi theo dõi người dùng' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Token không hợp lệ' }, { status: 401 });
    }

    const { username } = await params;
    const targetUser = await getUserByUsername(username);

    if (!targetUser) {
      return NextResponse.json({ error: 'Người dùng không tìm thấy' }, { status: 404 });
    }

    const following = await isFollowing(payload.userId, targetUser.id);
    if (!following) {
      return NextResponse.json(
        { error: 'Chưa theo dõi người dùng này' },
        { status: 400 }
      );
    }

    await removeFollow(payload.userId, targetUser.id);

    return NextResponse.json({ success: true, message: 'Đã hủy theo dõi' });
  } catch (error) {
    console.error('Lỗi khi hủy theo dõi người dùng:', error);
    return NextResponse.json(
      { error: 'Lỗi khi hủy theo dõi người dùng' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const { username } = await params;
    const targetUser = await getUserByUsername(username);

    if (!targetUser) {
      return NextResponse.json({ error: 'Người dùng không tìm thấy' }, { status: 404 });
    }

    let isUserFollowing = false;
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        isUserFollowing = await isFollowing(payload.userId, targetUser.id);
      }
    }

    return NextResponse.json({ following: isUserFollowing });
  } catch (error) {
    console.error('Lỗi khi kiểm tra trạng thái theo dõi:', error);
    return NextResponse.json(
      { error: 'Lỗi khi kiểm tra trạng thái theo dõi' },
      { status: 500 }
    );
  }
}