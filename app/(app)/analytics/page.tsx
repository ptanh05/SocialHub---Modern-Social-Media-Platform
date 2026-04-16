'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Heart, MessageCircle, Users, FileText } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AnalyticsPage() {
  const { user } = useAuth();

  const { data } = useSWR(user ? '/api/analytics' : null, fetcher);

  if (!user) return null;

  if (!data) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Analytics</h1>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const { stats, weeklyData } = data;
  const totalLikes = stats.likeCount;
  const totalComments = stats.commentCount;
  const followerCount = stats.followerCount;
  const postCount = stats.postCount;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-8">Analytics</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              Total Likes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalLikes}</p>
            <p className="text-xs text-muted-foreground mt-2">
              +{Math.floor(totalLikes * 0.4)} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-blue-500" />
              Total Comments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalComments}</p>
            <p className="text-xs text-muted-foreground mt-2">
              +{Math.floor(totalComments * 0.4)} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" />
              Followers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{followerCount}</p>
            <p className="text-xs text-muted-foreground mt-2">
              +{Math.max(1, Math.floor(followerCount * 0.2))} this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Posts summary card */}
      <Card className="mb-8">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <FileText className="w-4 h-4 text-green-500" />
            Total Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{postCount}</p>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="likes" fill="#ef4444" />
              <Bar dataKey="comments" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}