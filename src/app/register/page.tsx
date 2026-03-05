'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user profile in Firestore (non-blocking)
      const userRef = doc(db, 'users', user.uid);
      setDocumentNonBlocking(userRef, {
        id: user.uid,
        email: user.email,
        createdAt: new Date().toISOString(),
      }, { merge: true });

      toast({
        title: "Success",
        description: "Account created successfully!",
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Could not create account.",
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
          <CardTitle className="text-3xl font-headline font-bold">Create Account</CardTitle>
          <CardDescription>Join Fortress and start sharing your knowledge today.</CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
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
              {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Create Account"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Already have an account? <Link href="/login" className="text-primary font-semibold hover:underline">Log in</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
