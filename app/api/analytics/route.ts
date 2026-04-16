import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getPostsByUserId, getLikeCount, getCommentCount, getFollowerCount, getFollowingCount } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const posts = await getPostsByUserId(payload.userId);

    let likeCount = 0;
    let commentCount = 0;
    for (const post of posts) {
      likeCount += await getLikeCount(post.id);
      commentCount += await getCommentCount(post.id);
    }

    const followerCount = await getFollowerCount(payload.userId);
    const followingCount = await getFollowingCount(payload.userId);

    const weeklyData = [
      { name: 'Week 1', likes: Math.floor(likeCount * 0.15), comments: Math.floor(commentCount * 0.15) },
      { name: 'Week 2', likes: Math.floor(likeCount * 0.2), comments: Math.floor(commentCount * 0.2) },
      { name: 'Week 3', likes: Math.floor(likeCount * 0.25), comments: Math.floor(commentCount * 0.25) },
      { name: 'Week 4', likes: Math.floor(likeCount * 0.4), comments: Math.floor(commentCount * 0.4) },
    ];

    return NextResponse.json({
      stats: {
        postCount: posts.length,
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
