'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { NewPostForm } from '@/components/NewPostForm';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function NewBlogPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-headline font-bold">Create New Post</h1>
        <p className="text-lg text-muted-foreground">
          Share your thoughts with the world. Use our AI assistant to help you get started or write from scratch.
        </p>
      </div>

      <NewPostForm />
    </div>
  );
}
