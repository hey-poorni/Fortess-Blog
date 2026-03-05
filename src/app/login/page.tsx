
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Please check your credentials.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto py-24">
      <Card className="border-border/50 shadow-xl">
        <CardHeader className="space-y-2 text-center pb-8">
          <CardTitle className="text-3xl font-headline font-bold">Welcome Back</CardTitle>
          <CardDescription>Enter your credentials to access your secure fortress.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-8">
            <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90">
              {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Sign In"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Don&apos;t have an account? <Link href="/register" className="text-primary font-semibold hover:underline">Sign up</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
