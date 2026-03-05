'use client';

import Link from 'next/link';
import { useUser, useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { PenTool, LayoutDashboard, LogOut, LogIn, Loader2 } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';

export function Navbar() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await signOut(auth);
    router.push('/');
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="group transition-transform active:scale-95">
              <Logo 
                iconClassName="h-7 w-7 transition-colors group-hover:text-accent" 
                textClassName="text-2xl" 
              />
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/feed" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">Feed</Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isUserLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : user ? (
              <>
                <Link href="/dashboard/new">
                  <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2 font-bold hover:bg-primary/5">
                    <PenTool className="h-4 w-4" />
                    Write
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="items-center gap-2 font-bold hover:bg-primary/5">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout} className="items-center gap-2 font-bold border-2">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="items-center gap-2 font-bold hover:bg-primary/5">
                    <LogIn className="h-4 w-4" />
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 font-bold px-6">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
