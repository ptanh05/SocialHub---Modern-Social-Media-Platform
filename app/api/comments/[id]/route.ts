import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { deleteComment, getCommentById } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const comment = await getCommentById(id);

    if (!comment) {
      return NextResponse.json({ error: 'Bình luận không tìm thấy' }, { status: 404 });
    }

    // Kiểm tra quyền sở hữu — chỉ người tạo bình luận hoặc chủ bài viết mới được xóa
    if (comment.user_id !== payload.userId) {
      return NextResponse.json({ error: 'Không có quyền xóa bình luận này' }, { status: 403 });
    }

    const success = await deleteComment(id);
    if (!success) {
      return NextResponse.json({ error: 'Xóa bình luận thất bại' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Bình luận đã được xóa' });
  } catch (error) {
    console.error('Lỗi khi xóa bình luận:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}