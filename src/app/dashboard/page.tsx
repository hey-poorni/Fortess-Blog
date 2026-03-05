
'use client';

import { useMemo } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore, useCollection, useUser, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Globe, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { doc } from 'firebase/firestore';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const userBlogsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, 'users', user.uid, 'blogs'),
      orderBy('createdAt', 'desc')
    );
  }, [db, user]);

  const { data: blogs, isLoading } = useCollection(userBlogsQuery);

  if (isUserLoading) return <div className="flex justify-center py-24"><Loader2 className="animate-spin" /></div>;
  if (!user) return <div className="text-center py-24">Please log in to view your dashboard.</div>;

  const handleDelete = (blogId: string, isPublished: boolean) => {
    const userBlogRef = doc(db, 'users', user.uid, 'blogs', blogId);
    deleteDocumentNonBlocking(userBlogRef);
    
    if (isPublished) {
      const publicBlogRef = doc(db, 'public_blogs', blogId);
      deleteDocumentNonBlocking(publicBlogRef);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-orange-100 p-2 rounded-full hidden sm:block">
            <Image 
              src="/blogger-icon.png" 
              alt="Blogger Icon" 
              width={40} 
              height={40} 
              className="rounded-full object-cover shadow-sm"
              priority
            />
          </div>
          <div>
            <h1 className="text-3xl font-headline font-bold">Your Dashboard</h1>
            <p className="text-muted-foreground">Manage your articles and drafts.</p>
          </div>
        </div>
        <Link href="/dashboard/new">
          <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>
        ) : blogs && blogs.length > 0 ? (
          blogs.map((blog) => (
            <Card key={blog.id} className="overflow-hidden border-border/50 hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-headline">
                    {blog.title}
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">Created on {new Date(blog.createdAt).toLocaleDateString()}</span>
                    {blog.isPublished ? (
                      <Badge variant="default" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 flex items-center gap-1">
                        <Globe className="h-3 w-3" /> Published
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <EyeOff className="h-3 w-3" /> Draft
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/edit/${blog.id}`}>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(blog.id, blog.isPublished)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground border rounded-xl border-dashed">
            No blogs found. Start writing your first post!
          </div>
        )}
      </div>
    </div>
  );
}
