'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { query, collection, where, limit, orderBy, doc, increment } from 'firebase/firestore';
import { useFirestore, useCollection, useUser, useMemoFirebase, useDoc } from '@/firebase';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare, Share2, Clock, ArrowLeft, Loader2, Send } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { CommentItem } from '@/components/CommentItem';
import { LikeButton } from '@/components/LikeButton';

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const blogSearchQuery = useMemoFirebase(() => {
    return query(collection(db, 'public_blogs'), where('slug', '==', slug), limit(1));
  }, [db, slug]);

  const { data: blogSearchResults, isLoading: searchLoading } = useCollection(blogSearchQuery);
  const foundBlog = blogSearchResults?.[0];

  const blogRef = useMemo(() => {
    return foundBlog ? doc(db, 'public_blogs', foundBlog.id) : null;
  }, [db, foundBlog]);

  const { data: blog, isLoading: blogLoading } = useDoc(blogRef);

  const commentsQuery = useMemoFirebase(() => {
    if (!blog) return null;
    return query(collection(db, 'public_blogs', blog.id, 'comments'), orderBy('createdAt', 'desc'));
  }, [db, blog]);

  const { data: comments, isLoading: commentsLoading } = useCollection(commentsQuery);

  const handleAddComment = async () => {
    if (!user || !commentText.trim() || !blog) return;

    setIsSubmittingComment(true);
    try {
      const commentData = {
        blogId: blog.id,
        userId: user.uid,
        authorEmail: user.email,
        content: commentText.trim(),
        createdAt: new Date().toISOString(),
      };

      const commentsRef = collection(db, 'public_blogs', blog.id, 'comments');
      await addDocumentNonBlocking(commentsRef, commentData);
      
      // Update comment count on public blog
      if (blogRef) {
        updateDocumentNonBlocking(blogRef, { commentCount: increment(1) });
      }
      
      setCommentText('');
      toast({ title: "Comment posted", description: "Your thought has been added to the discussion." });
    } catch (err) {
      toast({ title: "Error", description: "Could not post comment.", variant: "destructive" });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    const shareData = {
      title: blog?.title || 'Fortress Blog',
      text: blog?.summary || 'Check out this post on Fortress!',
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: "Copied!", description: "Link copied to clipboard." });
      }
    } catch (err) {}
  };

  if (searchLoading) return <div className="flex justify-center py-24"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  if (!blog && !blogLoading) return <div className="text-center py-24">Post not found.</div>;
  if (!blog) return <div className="flex justify-center py-24"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <article className="max-w-4xl mx-auto space-y-12 pb-24">
      <Link href="/feed" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4 group font-medium">
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Feed
      </Link>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 font-bold tracking-wide uppercase text-[10px]">Article</Badge>
          <span className="text-sm text-muted-foreground flex items-center gap-1 font-medium">
            <Clock className="h-3 w-3" />
            {blog.createdAt ? format(new Date(blog.createdAt), 'MMMM dd, yyyy') : 'Recently'}
          </span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-headline font-bold leading-[1.1] tracking-tighter">{blog.title}</h1>

        <div className="flex items-center justify-between py-8 border-y border-border/50">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border-2 border-primary/10">
              <AvatarImage src={`https://picsum.photos/seed/${blog.authorEmail}/200`} />
              <AvatarFallback>{(blog.authorEmail?.[0] || 'U').toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold text-lg leading-tight">{blog.authorEmail?.split('@')[0] || 'Author'}</p>
              <p className="text-sm text-muted-foreground font-medium">Contributor</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent h-12 w-12" onClick={handleShare} title="Share post">
              <Share2 className="h-6 w-6" />
            </Button>
            <LikeButton blogId={blog.id} likeCount={blog.likeCount || 0} />
          </div>
        </div>
      </div>

      <div className="prose prose-lg max-w-none dark:prose-invert">
        {blog.summary && (
          <div className="relative mb-12">
             <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 rounded-full" />
             <p className="text-2xl leading-relaxed text-foreground/90 font-medium italic pl-8">
               {blog.summary}
             </p>
          </div>
        )}
        <div className="leading-relaxed space-y-8 whitespace-pre-wrap text-lg font-medium text-foreground/80">
          {blog.content}
        </div>
      </div>

      <Separator className="my-16" />

      <section className="space-y-10">
        <h2 className="text-3xl font-headline font-bold flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-primary" />
          Discussion ({blog.commentCount || comments?.length || 0})
        </h2>

        {user ? (
          <div className="space-y-6 bg-muted/30 p-8 rounded-3xl border border-border/50 shadow-sm">
            <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Join the conversation</Label>
            <Textarea 
              placeholder="What are your thoughts on this article?" 
              value={commentText} 
              onChange={(e) => setCommentText(e.target.value)} 
              className="bg-background min-h-[120px] resize-none border-border/50 p-4 text-lg rounded-xl focus:ring-primary/20" 
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleAddComment} 
                className="gap-2 h-12 px-8 text-base font-bold rounded-xl" 
                disabled={!commentText.trim() || isSubmittingComment}
              >
                {isSubmittingComment ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />} 
                Post Comment
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center bg-muted/30 rounded-3xl border-2 border-dashed border-border/50">
            <p className="text-muted-foreground text-lg mb-6 font-medium">You must be logged in to participate in the discussion.</p>
            <Link href="/login">
              <Button variant="outline" className="h-12 px-8 font-bold text-base rounded-xl">Log In to Comment</Button>
            </Link>
          </div>
        )}

        <div className="space-y-6">
          {commentsLoading ? (
             <div className="flex justify-center py-12"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>
          ) : comments && comments.length > 0 ? (
            comments.map((comment) => <CommentItem key={comment.id} comment={comment as any} />)
          ) : (
            <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-3xl">
              <p className="italic font-medium">No comments yet. Be the first to start the discussion!</p>
            </div>
          )}
        </div>
      </section>
    </article>
  );
}