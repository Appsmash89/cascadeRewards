
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Chrome, Loader2 } from 'lucide-react';
import { useAuth, initiateEmailSignIn } from '@/firebase';
import { useUser } from '@/hooks/use-user';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Hardcoded credentials for the persistent guest user
const GUEST_EMAIL = 'guest.dev@cascade.app';
const GUEST_PASSWORD = 'super-secret-password-12345!';

const CascadeLogo = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 8H16" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round"/>
    <path d="M4 12H20" stroke="hsl(var(--primary))" strokeOpacity="0.7" strokeWidth="3" strokeLinecap="round"/>
    <path d="M4 16H12" stroke="hsl(var(--primary))" strokeOpacity="0.4" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);


export default function LoginPage() {
  const router = useRouter();
  const { auth } = useAuth();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const [loadingProvider, setLoadingProvider] = useState<null | 'google' | 'guest'>(null);
  const [showLoader, setShowLoader] = useState(true);


  useEffect(() => {
    // If the user is authenticated, redirect to the dashboard.
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
    
    // Only hide the loader on the client-side after the initial render
    // and if auth state is not loading.
    if (!isUserLoading && !user) {
        setShowLoader(false);
    }
  }, [user, isUserLoading, router]);

  const handleGuestLogin = () => {
    if (!auth) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Firebase Auth is not initialized.",
      });
      return;
    }
    setLoadingProvider('guest');
    // This is now a non-blocking call
    initiateEmailSignIn(auth, GUEST_EMAIL, GUEST_PASSWORD);
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
      setLoadingProvider('google');
      // signInWithPopup is an exception; it needs to be awaited to handle
      // popup-related errors gracefully, but it's still very fast.
      await signInWithPopup(auth, provider);
      // The onAuthStateChanged listener in AppProvider will handle the redirect.
    } catch (error: any) {
      setLoadingProvider(null); // Reset loading state on error
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

  if (showLoader) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center gap-4 mb-8 text-center">
        <div className="text-primary">
          <CascadeLogo />
        </div>
        <h1 className="font-gliker text-4xl font-bold tracking-tight">Cascade</h1>
        <p className="text-muted-foreground max-w-xs">The next-generation platform for rewards and referrals.</p>
      </div>
      <Card className="w-full max-w-sm border-0 shadow-lg shadow-primary/5">
        <CardHeader>
          <CardTitle className="text-center text-lg font-semibold">
            Sign In
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button 
            onClick={handleGoogleSignIn} 
            size="lg" 
            className="h-12 text-base"
            disabled={loadingProvider !== null}
          >
            {loadingProvider === 'google' ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Chrome className="mr-2 h-5 w-5" />
            )}
            {loadingProvider === 'google' ? 'Signing in...' : 'Sign In with Google'}
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleGuestLogin} 
            size="lg" 
            className="h-12 text-base"
            disabled={loadingProvider !== null}
          >
            {loadingProvider === 'guest' && (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            )}
            {loadingProvider === 'guest' ? 'Signing in...' : 'Admin'}
          </Button>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground mt-8">By continuing, you agree to our Terms of Service.</p>
    </div>
  );
}
