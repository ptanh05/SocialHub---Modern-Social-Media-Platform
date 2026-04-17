import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { consumeSSEEvents } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
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
  } catch (e) {
    // sse_events table may not exist in some environments
    console.error('SSE events error:', e);
    return NextResponse.json([], {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
    });
  }
}
