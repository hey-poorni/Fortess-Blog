'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface CommentItemProps {
  comment: {
    id: string;
    authorEmail: string;
    content: string;
    createdAt: string;
  };
}

export function CommentItem({ comment }: CommentItemProps) {
  return (
    <div className="flex gap-4 p-6 rounded-2xl bg-card border border-border/50 shadow-sm transition-shadow hover:shadow-md">
      <Avatar className="h-10 w-10">
        <AvatarImage src={`https://picsum.photos/seed/${comment.authorEmail}/200`} />
        <AvatarFallback>{(comment.authorEmail?.[0] || 'U').toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="space-y-1 flex-1">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-sm">
            {comment.authorEmail?.split('@')[0]}
          </p>
          <p className="text-xs text-muted-foreground">
            {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : 'Just now'}
          </p>
        </div>
        <p className="text-muted-foreground leading-relaxed">{comment.content}</p>
      </div>
    </div>
  );
}
