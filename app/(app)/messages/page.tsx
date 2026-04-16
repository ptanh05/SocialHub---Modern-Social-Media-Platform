'use client';

import { useState } from 'react';
import { useConversations } from '@/hooks/use-messages';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MessagesPage() {
  const { conversations, isLoading } = useConversations();
  const { user } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-8">Messages</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Conversations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No conversations yet</div>
            ) : (
              conversations.map((convo) => (
                <Link
                  key={convo.userId}
                  href={`/messages/${convo.userId}`}
                  className={`flex items-center gap-3 p-3 rounded-lg border border-border/40 cursor-pointer hover:bg-muted transition ${
                    selectedUserId === convo.userId ? 'bg-muted' : ''
                  }`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">User {convo.userId}</p>
                    <p className="text-xs text-muted-foreground truncate">{convo.lastMessage.content}</p>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Chat Area */}
        <div className="md:col-span-2">
          {selectedUserId ? (
            <ConversationView userId={selectedUserId} />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96 text-muted-foreground">
                <div className="text-center">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to start messaging</p>
                </div>
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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setSending(true);
    try {
      await sendMessage(messageText);
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="flex flex-col h-96">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-lg">Conversation</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg: any) => (
          <div key={msg.id} className={`flex ${msg.senderId === userId ? 'justify-start' : 'justify-end'}`}>
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.senderId === userId
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-primary text-primary-foreground'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <p className="text-xs opacity-70 mt-1">
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
          placeholder="Type a message..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          disabled={sending}
          className="flex-1"
        />
        <Button type="submit" disabled={!messageText.trim() || sending}>
          {sending ? 'Sending...' : 'Send'}
        </Button>
      </form>
    </Card>
  );
}
