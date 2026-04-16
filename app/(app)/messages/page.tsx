'use client';

import { useState, useEffect } from 'react';
import { useConversations } from '@/hooks/use-messages';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Mail, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MessagesPage() {
  const { conversations, isLoading } = useConversations();
  const { user } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div
        className={`mb-8 transition-all duration-500 ease-out ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          Tin nhắn
        </h1>
        <p className="text-muted-foreground text-sm">
          {conversations.length > 0
            ? `${conversations.length} cuộc trò chuyện`
            : 'Bắt đầu một cuộc trò chuyện'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          className={`md:col-span-1 transition-all duration-500 ease-out ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '100ms' }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="w-4 h-4" />
              Cuộc trò chuyện
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground animate-pulse">Đang tải...</div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Chưa có cuộc trò chuyện nào</p>
              </div>
            ) : (
              conversations.map((convo, index) => (
                <Link
                  key={convo.userId}
                  href={`/messages/${convo.userId}`}
                  onClick={() => setSelectedUserId(convo.userId)}
                  className={`flex items-center gap-3 p-3 rounded-lg border border-border/40 cursor-pointer transition-all duration-200 animate-fade-in-up hover:bg-muted hover:border-primary/30 hover-lift ${
                    selectedUserId === convo.userId ? 'bg-muted border-primary/30' : ''
                  }`}
                  style={{ animationDelay: `${150 + index * 50}ms` }}
                >
                  <Avatar className="h-10 w-10 transition-transform hover:scale-105">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">Người dùng {convo.userId}</p>
                    <p className="text-xs text-muted-foreground truncate">{convo.lastMessage.content}</p>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <div
          className={`md:col-span-2 transition-all duration-500 ease-out ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          {selectedUserId ? (
            <ConversationView userId={selectedUserId} />
          ) : (
            <Card className="min-h-96">
              <CardContent className="flex flex-col items-center justify-center h-96 text-muted-foreground">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Mail className="w-10 h-10 opacity-30" />
                </div>
                <p className="text-base font-medium mb-1">Chưa chọn cuộc trò chuyện</p>
                <p className="text-sm">Chọn một cuộc trò chuyện từ danh sách để bắt đầu nhắn tin</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function ConversationView({ userId }: { userId: string }) {
  const { messages, sendMessage } = require('@/hooks/use-messages').useConversation(userId);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

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
    <Card
      className={`flex flex-col h-96 transition-all duration-300 ${
        visible ? 'opacity-100 scale-100' : 'opacity-0 scale-98'
      }`}
    >
      <CardHeader className="border-b border-border pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs">U</AvatarFallback>
          </Avatar>
          Cuộc trò chuyện
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Bắt đầu cuộc trò chuyện bằng cách gửi tin nhắn
          </div>
        )}
        {messages.map((msg: any, index: number) => (
          <div
            key={msg.id}
            className={`flex ${msg.senderId === userId ? 'justify-start' : 'justify-end'} animate-fade-in`}
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-xl transition-all duration-200 ${
                msg.senderId === userId
                  ? 'bg-muted text-foreground rounded-bl-sm'
                  : 'bg-primary text-primary-foreground rounded-br-sm'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <p className="text-xs opacity-60 mt-1">
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
      <form onSubmit={handleSend} className="border-t border-border p-4 flex gap-2">
        <Input
          type="text"
          placeholder="Nhập tin nhắn..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          disabled={sending}
          className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-primary/50"
        />
        <Button
          type="submit"
          disabled={!messageText.trim() || sending}
          className="transition-all duration-200 active:scale-95"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </Card>
  );
}
