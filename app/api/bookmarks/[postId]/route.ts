import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { addBookmark, removeBookmark, isPostBookmarked, getPostById } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Token không hợp lệ' }, { status: 401 });
    }

    const { postId } = await params;
    const post = await getPostById(postId);

    if (!post) {
      return NextResponse.json({ error: 'Bài viết không tìm thấy' }, { status: 404 });
    }

    const alreadyBookmarked = await isPostBookmarked(payload.userId, postId);
    if (alreadyBookmarked) {
      return NextResponse.json({ error: 'Bài viết đã được lưu rồi' }, { status: 400 });
    }

    const bookmark = await addBookmark(payload.userId, postId);
    if (!bookmark) {
      return NextResponse.json({ error: 'Lưu bài viết thất bại' }, { status: 500 });
    }

    return NextResponse.json({ success: true, bookmark }, { status: 201 });
  } catch (error) {
    console.error('Lỗi khi lưu bài viết:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Token không hợp lệ' }, { status: 401 });
    }

    const { postId } = await params;

    const isBookmarked = await isPostBookmarked(payload.userId, postId);
    if (!isBookmarked) {
      return NextResponse.json({ error: 'Bài viết chưa được lưu' }, { status: 400 });
    }

    const success = await removeBookmark(payload.userId, postId);
    if (!success) {
      return NextResponse.json({ error: 'Xóa bài viết đã lưu thất bại' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Đã xóa bài viết khỏi danh sách đã lưu' });
  } catch (error) {
    console.error('Lỗi khi xóa bài viết đã lưu:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}

// GET: Kiểm tra trạng thái bookmark của bài viết
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ bookmarked: false });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ bookmarked: false });
    }

    const { postId } = await params;
    const bookmarked = await isPostBookmarked(payload.userId, postId);

    return NextResponse.json({ bookmarked });
  } catch (error) {
    console.error('Lỗi khi kiểm tra bookmark:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}