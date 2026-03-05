'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Save, Wand2, Loader2, Sparkles } from 'lucide-react';
import { generateBlogPost } from '@/ai/flows/generate-blog-post';
import { autoGenerateBlogSummary } from '@/ai/flows/auto-generate-blog-summary';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const postSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(20, "Content must be at least 20 characters"),
  isPublished: z.boolean().default(false),
});

type PostFormValues = z.infer<typeof postSchema>;

export function NewPostForm() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [topic, setTopic] = useState('');
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  const router = useRouter();

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      content: '',
      isPublished: false,
    },
  });

  function slugify(text: string) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  }

  async function handleGenerate() {
    if (!topic.trim()) {
      toast({ title: "Topic required", description: "Please enter a topic to generate content.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateBlogPost({ topic });
      form.setValue('title', result.title);
      form.setValue('content', result.content);
      toast({ title: "Draft Generated!", description: "AI has created a draft based on your topic." });
    } catch (error) {
      toast({ title: "Generation failed", description: "There was an error generating your post.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  }

  async function onSubmit(values: PostFormValues) {
    if (!user) return;

    setIsSaving(true);
    try {
      const blogId = Math.random().toString(36).substring(2, 11);
      const slug = `${slugify(values.title)}-${Math.random().toString(36).substring(2, 6)}`;
      
      const { summary } = await autoGenerateBlogSummary({ title: values.title, content: values.content });

      const blogData = {
        id: blogId,
        userId: user.uid,
        authorEmail: user.email,
        title: values.title,
        content: values.content,
        slug,
        summary,
        isPublished: values.isPublished,
        likeCount: 0,
        commentCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const userBlogRef = doc(db, 'users', user.uid, 'blogs', blogId);
      setDocumentNonBlocking(userBlogRef, blogData, { merge: true });

      if (values.isPublished) {
        const publicBlogRef = doc(db, 'public_blogs', blogId);
        setDocumentNonBlocking(publicBlogRef, blogData, { merge: true });
      }

      toast({ title: "Success!", description: values.isPublished ? "Your post is now live!" : "Draft saved successfully." });
      router.push('/dashboard');
    } catch (error) {
      toast({ title: "Error", description: "Failed to save post.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card className="border-accent/20 bg-accent/5">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            AI Draft Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input 
                placeholder="What do you want to write about? (e.g. Zero-trust security)" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="bg-background"
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
            </div>
            <Button type="button" onClick={handleGenerate} disabled={isGenerating} className="bg-accent text-accent-foreground hover:bg-accent/90 shrink-0">
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Wand2 className="h-4 w-4 mr-2" />Generate Draft</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="border-border/50 shadow-lg">
            <CardHeader className="bg-muted/30 pb-8">
              <CardTitle>Post Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a catchy title..." className="text-lg font-headline h-12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Content</FormLabel>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent/5 px-2 py-1 rounded">
                        <Wand2 className="h-3 w-3" />
                        AI Summary will be auto-generated
                      </div>
                    </div>
                    <FormControl>
                      <Textarea placeholder="Write your story here..." className="min-h-[400px] leading-relaxed resize-none p-4" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                    <div className="space-y-0.5">
                      <FormLabel>Publish immediately?</FormLabel>
                      <FormDescription>If turned off, this will be saved as a draft.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end gap-4 bg-muted/30 py-6">
              <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={isSaving} className="bg-primary flex items-center gap-2 px-8">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Post
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
