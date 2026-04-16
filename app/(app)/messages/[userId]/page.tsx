'use client';

import { useState } from 'react';
import { useConversation } from '@/hooks/use-messages';
import { useAuth } from '@/hooks/use-auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ConversationPage({ params }: { params: { userId: string } }) {
  const { messages, sendMessage, isLoading } = useConversation(params.userId);
  const { user } = useAuth();
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);

  if (!user) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setSending(true);
    try {
      await sendMessage(messageText);
      setMessageText('');
    } catch (error) {
      console.error('Gửi tin nhắn thất bại:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/messages" className="flex items-center gap-2 text-primary hover:underline mb-6">
        <ArrowLeft className="w-4 h-4" />
        Quay lại tin nhắn
      </Link>

      <Card className="h-96 md:h-screen max-h-[600px] md:max-h-full flex flex-col">
        <CardHeader className="border-b border-border flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>Người dùng {params.userId}</CardTitle>
              <p className="text-xs text-muted-foreground">Đang hoạt động</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Đang tải tin nhắn...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Chưa có tin nhắn nào. Bắt đầu cuộc trò chuyện!</p>
            </div>
          ) : (
            messages.map((msg: any) => (
              <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.senderId === user.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <p className="text-sm break-words">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>

        <form onSubmit={handleSend} className="border-t border-border p-4 flex gap-2">
          <Input
            type="text"
            placeholder="Nhập tin nhắn..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            disabled={sending}
            className="flex-1"
          />
          <Button type="submit" disabled={!messageText.trim() || sending}>
            {sending ? 'Đang gửi...' : 'Gửi'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
