
'use client';

import { useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { useUser } from '@/hooks/use-user';
import { Loader2, ArrowLeft, User, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Feedback, WithId, AppSettings } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

const GUEST_EMAIL = 'guest.dev@cascade.app';

export default function FeedbackListView() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  const settingsRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'app-settings', 'global') : null, 
    [firestore]
  );
  const { data: appSettings, isLoading: appSettingsLoading } = useDoc<AppSettings>(settingsRef);
  
  const isAdmin = user && (user.email === GUEST_EMAIL || (appSettings?.adminEmails || []).includes(user.email));

  const feedbackQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    return query(collection(firestore, 'feedback'), orderBy('createdAt', 'desc'));
  }, [firestore, isAdmin]);

  const { data: feedbackList, isLoading: isFeedbackLoading } = useCollection<Feedback>(feedbackQuery);

  useEffect(() => {
    if (!isUserLoading && !appSettingsLoading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAdmin, isUserLoading, appSettingsLoading, router]);

  if (isFeedbackLoading || isUserLoading || appSettingsLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
     return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <p>Access denied.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <Button asChild variant="ghost" size="sm" className="mb-4 -ml-4 justify-start w-fit">
            <Link href="/devtools">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to DevTools
            </Link>
          </Button>
          <CardTitle>User Feedback</CardTitle>
          <CardDescription>
            Here's what your users are saying.
          </CardDescription>
        </CardHeader>
      </Card>
      
      {feedbackList && feedbackList.length > 0 ? (
        feedbackList.map((feedback) => (
          <Card key={feedback.id}>
            <CardHeader>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{feedback.userDisplayName}</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                        {feedback.createdAt ? 
                            `${formatDistanceToNow(feedback.createdAt.toDate())} ago` : 
                            'Just now'}
                        </span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap break-words">{feedback.content}</p>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <p>No feedback submissions yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
