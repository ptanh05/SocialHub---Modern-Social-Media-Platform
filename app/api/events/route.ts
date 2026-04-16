import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { consumeSSEEvents } from '@/lib/db';

export const dynamic = 'force-dynamic';

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

    const events = await consumeSSEEvents(payload.userId);

    return NextResponse.json(
      events.map(e => ({
        id:        e.id,
        eventType: e.eventType,
        payload:   e.payload,
        createdAt: e.createdAt,
      })),
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching SSE events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}