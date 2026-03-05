import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageSquare, Clock } from 'lucide-react';

interface BlogCardProps {
  blog: {
    id: string;
    title: string;
    slug: string;
    summary?: string | null;
    createdAt: string;
    isPublished: boolean;
    authorEmail: string;
    likeCount?: number;
    commentCount?: number;
  };
}

export function BlogCard({ blog }: BlogCardProps) {
  return (
    <Link href={`/blog/${blog.slug}`} className="block group">
      <Card className="h-full hover:shadow-lg transition-all border-border/40 overflow-hidden bg-card">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="bg-accent/10 text-primary font-medium hover:bg-accent/20">
              {blog.isPublished ? 'Published' : 'Draft'}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {blog.createdAt ? formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true }) : 'Recently'}
            </span>
          </div>
          <CardTitle className="group-hover:text-primary transition-colors line-clamp-2 font-headline leading-tight">
            {blog.title}
          </CardTitle>
          <p className="text-xs text-muted-foreground">by {blog.authorEmail?.split('@')[0] || 'Unknown'}</p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {blog.summary || 'No summary available for this post.'}
          </p>
        </CardContent>
        <CardFooter className="flex items-center gap-4 text-muted-foreground pt-4 border-t">
          <div className="flex items-center gap-1.5 text-xs">
            <Heart className="h-4 w-4" />
            <span>{blog.likeCount || 0}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <MessageSquare className="h-4 w-4" />
            <span>{blog.commentCount || 0}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
