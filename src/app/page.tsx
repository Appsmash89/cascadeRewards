
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Chrome, Loader2 } from 'lucide-react';
import { useAuth } from '@/firebase';
import { useUser } from '@/hooks/use-user';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const { auth } = useAuth();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleGuestLogin = () => {
    router.push('/dashboard?mode=guest');
  };

  const handleGoogleSignIn = async () => {
    if (!auth) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Firebase Auth is not initialized.",
      });
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      let description = "An unexpected error occurred during sign-in.";
      if (error.code === 'auth/popup-closed-by-user') {
        description = "The sign-in popup was closed before completion.";
      } else if (error.code === 'auth/operation-not-allowed') {
        description = "Google Sign-In is not enabled for this project.";
      }
      toast({
        variant: "destructive",
        title: "Sign-In Failed",
        description: description,
      });
    }
  };

  if (isUserLoading || user) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center gap-4 mb-8 text-center">
        <div className="bg-primary/10 border border-primary/20 p-3 rounded-full text-primary">
          <Gift className="h-10 w-10" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Cascade</h1>
        <p className="text-muted-foreground max-w-xs">The next-generation platform for rewards and referrals.</p>
      </div>
      <Card className="w-full max-w-sm border-0 shadow-xl shadow-primary/5">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Sign in to access your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button onClick={handleGoogleSignIn} size="lg" className="h-12 text-base">
            <Chrome className="mr-2 h-5 w-5" />
            Sign In with Google
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>
          <Button variant="secondary" onClick={handleGuestLogin} size="lg" className="h-12 text-base">
            Continue as Guest
          </Button>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground mt-8">By continuing, you agree to our Terms of Service.</p>
    </div>
  );
}
