import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getDb } from '@/lib/db';

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

    const userId = payload.userId;
    const db = await getDb();

    // Gather counts
    const postCount = (db.prepare('SELECT COUNT(*) as c FROM posts WHERE user_id = ?').get(userId) as { c: number }).c;
    const likeCount = (db.prepare('SELECT COUNT(*) as c FROM likes WHERE user_id = ?').get(userId) as { c: number }).c;
    const commentCount = (db.prepare('SELECT COUNT(*) as c FROM comments WHERE user_id = ?').get(userId) as { c: number }).c;
    const followerCount = (db.prepare('SELECT COUNT(*) as c FROM follows WHERE following_id = ?').get(userId) as { c: number }).c;
    const followingCount = (db.prepare('SELECT COUNT(*) as c FROM follows WHERE follower_id = ?').get(userId) as { c: number }).c;

    // Weekly chart data (fake distribution based on total engagement)
    const totalEngagement = likeCount + commentCount;
    const weeklyData = [
      { name: 'Week 1', likes: Math.floor(totalEngagement * 0.15), comments: Math.floor(commentCount * 0.15) },
      { name: 'Week 2', likes: Math.floor(totalEngagement * 0.2), comments: Math.floor(commentCount * 0.2) },
      { name: 'Week 3', likes: Math.floor(totalEngagement * 0.25), comments: Math.floor(commentCount * 0.25) },
      { name: 'Week 4', likes: Math.floor(totalEngagement * 0.4), comments: Math.floor(commentCount * 0.4) },
    ];

    return NextResponse.json({
      stats: {
        postCount,
        likeCount,
        commentCount,
        followerCount,
        followingCount,
      },
      weeklyData,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}