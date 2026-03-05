'use client';

import { useState } from 'react';
import { collection, query, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { BlogCard } from '@/components/BlogCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Plus } from 'lucide-react';

const PAGE_SIZE = 6;

export default function FeedPage() {
  const db = useFirestore();
  const [displayLimit, setDisplayLimit] = useState(PAGE_SIZE);

  const publicBlogsQuery = useMemoFirebase(() => {
    // The public_blogs collection only contains published blogs by design.
    return query(
      collection(db, 'public_blogs'),
      orderBy('createdAt', 'desc'),
      limit(displayLimit)
    );
  }, [db, displayLimit]);

  const { data: blogs, isLoading } = useCollection(publicBlogsQuery);

  const handleLoadMore = () => {
    setDisplayLimit(prev => prev + PAGE_SIZE);
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-headline font-bold tracking-tight">Public Feed</h1>
          <p className="text-muted-foreground">Discover the latest insights from our community of writers.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search posts..." className="pl-10 h-11" />
        </div>
      </div>

      {isLoading && !blogs ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : blogs && blogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog as any} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 space-y-4">
          <h3 className="text-xl font-headline font-semibold">No posts yet</h3>
          <p className="text-muted-foreground">Be the first to publish a post on Fortress!</p>
        </div>
      )}

      {blogs && blogs.length >= displayLimit && (
        <div className="flex justify-center pt-12">
          <Button variant="outline" className="px-12 flex items-center gap-2" onClick={handleLoadMore}>
            <Plus className="h-4 w-4" /> Load More
          </Button>
        </div>
      )}
    </div>
  );
}
