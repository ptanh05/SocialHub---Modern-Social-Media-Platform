import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getUserById, updateUser } from '@/lib/db';
import { updateProfileSchema } from '@/lib/schemas';

export async function PUT(request: NextRequest) {
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
    const validation = updateProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { name, bio, avatar } = validation.data;

    const updated = await updateUser(payload.userId, { name, bio, avatar });

    return NextResponse.json({
      id: updated?.id,
      email: updated?.email,
      username: updated?.username,
      name: updated?.name,
      bio: updated?.bio,
      avatar: updated?.avatar,
    });
  } catch (error) {
    console.error('Failed to update profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}