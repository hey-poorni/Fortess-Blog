'use client';

import { useMemo, useState } from 'react';
import { doc, increment } from 'firebase/firestore';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Heart, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { setDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

interface LikeButtonProps {
  blogId: string;
  likeCount: number;
}

export function LikeButton({ blogId, likeCount }: LikeButtonProps) {
  const { user } = useUser();
  const db = useFirestore();
  const [localIsLiking, setLocalIsLiking] = useState(false);

  const blogRef = useMemoFirebase(() => doc(db, 'public_blogs', blogId), [db, blogId]);
  
  const userLikeRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, 'public_blogs', blogId, 'likes', user.uid);
  }, [db, blogId, user]);

  const { data: userLike, isLoading: likeLoading } = useDoc(userLikeRef);

  const handleToggleLike = async () => {
    if (!user || likeLoading || localIsLiking) return;

    setLocalIsLiking(true);
    try {
      if (userLike) {
        deleteDocumentNonBlocking(userLikeRef!);
        updateDocumentNonBlocking(blogRef, { likeCount: increment(-1) });
      } else {
        setDocumentNonBlocking(userLikeRef!, {
          blogId,
          userId: user.uid,
          createdAt: new Date().toISOString()
        }, { merge: true });
        updateDocumentNonBlocking(blogRef, { likeCount: increment(1) });
      }
    } finally {
      // Small timeout to prevent rapid-fire clicking before Firestore syncs
      setTimeout(() => setLocalIsLiking(false), 500);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className={cn(
        "rounded-full gap-2 transition-all duration-300", 
        userLike ? "text-rose-500 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20" : "hover:bg-accent",
        !user && "opacity-50 cursor-not-allowed"
      )}
      onClick={handleToggleLike}
      disabled={!user || likeLoading || localIsLiking}
    >
      {likeLoading || localIsLiking ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Heart className={cn("h-5 w-5 transition-transform", userLike && "fill-current scale-110")} />
      )}
      <span className="font-semibold">{likeCount || 0}</span>
    </Button>
  );
}