import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { createMessage, getConversations, getUnreadMessagesCount, getUserById, getUserPreferences } from '@/lib/db';
import { z } from 'zod';
import { sendEmail, notifyNewMessageEmail } from '@/lib/email';

const createMessageSchema = z.object({
  receiverId: z.string().min(1),
  content: z.string().min(1).max(1000),
});

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversations = await getConversations(payload.userId);
    const unreadCount = await getUnreadMessagesCount(payload.userId);

    return NextResponse.json({ conversations, unreadCount });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { receiverId, content } = createMessageSchema.parse(body);

    const message = await createMessage(payload.userId, receiverId, content);

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
