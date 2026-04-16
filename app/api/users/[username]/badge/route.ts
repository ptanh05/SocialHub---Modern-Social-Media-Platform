// POST - set a user's badge (admin only)
// GET - get available badges
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { setUserBadge, getUserByUsername } from '@/lib/db';

export const AVAILABLE_BADGES = [
  { id: 'creator', label: 'Creator', emoji: '✨', description: 'Content creator' },
  { id: 'early_adopter', label: 'Early Adopter', emoji: '🚀', description: 'Joined early' },
  { id: 'contributor', label: 'Contributor', emoji: '🏆', description: 'Top contributor' },
  { id: 'verified', label: 'Verified', emoji: '✅', description: 'Verified account' },
  { id: 'staff', label: 'Staff', emoji: '💼', description: 'SocialHub staff' },
];

export async function GET(request: NextRequest) {
  return NextResponse.json({ badges: AVAILABLE_BADGES });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (payload.userId !== '1') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { username } = await params;
    const user = await getUserByUsername(username);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await request.json();
    const { badge } = body;

    if (!AVAILABLE_BADGES.find(b => b.id === badge) && badge !== '') {
      return NextResponse.json({ error: 'Invalid badge' }, { status: 400 });
    }

    await setUserBadge(user.id, badge || '');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Set badge error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
