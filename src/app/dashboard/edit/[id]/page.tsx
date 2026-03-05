'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, Loader2, ArrowLeft, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { autoGenerateBlogSummary } from '@/ai/flows/auto-generate-blog-summary';
import { setDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export default function EditBlogPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [blogMetadata, setBlogMetadata] = useState<any>(null);

  useEffect(() => {
    async function loadPost() {
      if (!user) return;
      const postRef = doc(db, 'users', user.uid, 'blogs', id);
      const postSnap = await getDoc(postRef);
      
      if (postSnap.exists()) {
        const data = postSnap.data();
        setTitle(data.title);
        setContent(data.content);
        setIsPublished(data.isPublished);
        setBlogMetadata(data);
      } else {
        toast({ title: "Error", description: "Post not found.", variant: "destructive" });
        router.push('/dashboard');
      }
      setIsLoading(false);
    }
    loadPost();
  }, [id, user, db, router, toast]);

  function slugify(text: string) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      const newSlug = `${slugify(title)}-${id.substring(0, 4)}`;
      const { summary } = await autoGenerateBlogSummary({ title, content });

      const updatedData = {
        title,
        content,
        summary,
        isPublished,
        slug: newSlug,
        updatedAt: new Date().toISOString(),
      };

      // Update private record
      const userBlogRef = doc(db, 'users', user.uid, 'blogs', id);
      updateDocumentNonBlocking(userBlogRef, updatedData);

      // Handle public record synchronization
      const publicBlogRef = doc(db, 'public_blogs', id);
      if (isPublished) {
        // Use setDocumentNonBlocking with merge to handle cases where 
        // a previously draft post is being published for the first time.
        const publicData = {
          ...blogMetadata,
          ...updatedData,
          id,
          userId: user.uid,
          authorEmail: user.email,
          likeCount: blogMetadata?.likeCount ?? 0,
          commentCount: blogMetadata?.commentCount ?? 0,
        };
        setDocumentNonBlocking(publicBlogRef, publicData, { merge: true });
      } else {
        // If it's now a draft, remove from public feed
        deleteDocumentNonBlocking(publicBlogRef);
      }

      toast({ title: "Success", description: "Post updated successfully." });
      router.push('/dashboard');
    } catch (error) {
      toast({ title: "Error", description: "Failed to update post.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <div className="flex justify-center py-24"><Loader2 className="animate-spin h-8 w-8" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-4xl font-headline font-bold">Edit Post</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="bg-muted/30 pb-8">
            <CardTitle>Post Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-8">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required 
                className="text-lg font-headline h-12"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content">Content</Label>
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent/5 px-2 py-1 rounded">
                  <Wand2 className="h-3 w-3" />
                  AI Summary will be auto-regenerated
                </div>
              </div>
              <Textarea 
                id="content" 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required 
                className="min-h-[400px] leading-relaxed p-4"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
              <div className="space-y-0.5">
                <Label htmlFor="isPublished">Publicly visible?</Label>
                <p className="text-xs text-muted-foreground">If turned off, this will be removed from the public feed.</p>
              </div>
              <Switch 
                id="isPublished" 
                checked={isPublished}
                onCheckedChange={setIsPublished}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-4 bg-muted/30 py-6">
            <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isSaving} className="bg-primary flex items-center gap-2 px-8">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Update Post
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}