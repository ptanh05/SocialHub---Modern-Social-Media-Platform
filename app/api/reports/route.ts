import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { createReport } from '@/lib/db';
import { z } from 'zod';

const createReportSchema = z.object({
  reason: z.enum(['spam', 'harassment', 'abuse', 'inappropriate', 'misinformation', 'other']),
  description: z.string().min(10).max(1000),
  postId: z.string().optional(),
  userId: z.string().optional(),
});

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
    const { reason, description, postId, userId } = createReportSchema.parse(body);

    if (!postId && !userId) {
      return NextResponse.json({ error: 'Either postId or userId must be provided' }, { status: 400 });
    }

    const report = await createReport(payload.userId, reason, description, postId, userId);

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Error creating report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}