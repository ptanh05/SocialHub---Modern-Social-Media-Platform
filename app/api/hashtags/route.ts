import { NextRequest, NextResponse } from 'next/server';
import { getTrendingHashtags, searchHashtag, getAllPosts } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const trending = searchParams.get('trending');

    if (trending) {
      const hashtags = await getTrendingHashtags(10);
      return NextResponse.json(hashtags);
    }

    if (query) {
      const hashtag = await searchHashtag(query);
      if (!hashtag) {
        return NextResponse.json({ error: 'Hashtag not found' }, { status: 404 });
      }

      // Find posts with this hashtag
      const allPosts = await getAllPosts();
      const postsWithHashtag = allPosts.filter((post) =>
        post.content.toLowerCase().includes(`#${query.toLowerCase()}`)
      );

      return NextResponse.json({ hashtag, posts: postsWithHashtag });
    }

    return NextResponse.json({ error: 'Query parameter required' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching hashtags:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}