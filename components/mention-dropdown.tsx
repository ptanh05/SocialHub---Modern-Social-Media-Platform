'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MentionUser {
  id: string;
  username: string;
  name: string;
  avatar: string;
}

interface MentionDropdownProps {
  suggestions: MentionUser[];
  selectedIndex: number;
  onSelect: (user: MentionUser) => void;
}

export function MentionDropdown({ suggestions, selectedIndex, onSelect }: MentionDropdownProps) {
  if (suggestions.length === 0) return null;
  return (
    <div className="absolute bottom-full mb-1 w-full bg-popover border border-border rounded-lg shadow-lg overflow-hidden z-50 max-h-60 overflow-y-auto">
      {suggestions.map((user, index) => (
        <button
          key={user.id}
          onClick={() => onSelect(user)}
          className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-accent transition-colors ${
            index === selectedIndex ? 'bg-accent' : ''
          }`}
        >
          <Avatar className="h-7 w-7">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">@{user.username}</p>
          </div>
        </button>
      ))}
    </div>
  );
}