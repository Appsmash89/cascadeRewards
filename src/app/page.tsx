
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Chrome, Loader2 } from 'lucide-react';
import { useAuth } from '@/firebase';
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import { useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);
  
  useEffect(() => {
    if (!auth || isUserLoading || user) return;

    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          // This is the signed-in user
          router.push('/dashboard');
        }
      })
      .catch((error) => {
        console.error("Google Sign-In Redirect Error:", error);
        toast({
          variant: "destructive",
          title: "Sign-In Failed",
          description: error.message || "An unexpected error occurred during sign-in.",
        });
      });
  }, [auth, isUserLoading, user, router, toast]);


  const handleGuestLogin = () => {
    // For prototyping, we'll use a query param to signify guest mode
    router.push('/dashboard?mode=guest');
  };

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    // We use signInWithRedirect instead of signInWithPopup to avoid popup blockers.
    await signInWithRedirect(auth, provider);
  };

  if (isUserLoading || user) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4">
      <div className="flex flex-col items-center gap-4 mb-8 text-center">
        <div className="bg-primary p-3 rounded-full text-primary-foreground">
          <Gift className="h-10 w-10" />
        </div>
        <h1 className="text-4xl font-bold">Cascade</h1>
        <p className="text-muted-foreground">Welcome to your rewards dashboard.</p>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Login</CardTitle>
          <CardDescription className="text-center">
            Choose a method to access your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button variant="outline" onClick={handleGuestLogin}>
            Continue as Guest
          </Button>
          <Button onClick={handleGoogleSignIn}>
            <Chrome className="mr-2 h-4 w-4" />
            Sign In with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
