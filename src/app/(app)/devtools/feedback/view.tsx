
'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useUser } from '@/hooks/use-user';
import { Loader2, ArrowLeft, User, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Feedback, WithId } from '@/lib/types';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

export default function FeedbackListView() {
  const firestore = useFirestore();
  const { isAdmin, isUserLoading } = useUser();
  const router = useRouter();
  
  const feedbackQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    return query(collection(firestore, 'feedback'), orderBy('createdAt', 'desc'));
  }, [firestore, isAdmin]);

  const { data: feedbackList, isLoading: isFeedbackLoading } = useCollection<Feedback>(feedbackQuery);

  useEffect(() => {
    if (!isUserLoading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAdmin, isUserLoading, router]);

  const isLoading = isFeedbackLoading || isUserLoading;

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
     return (
      <div className="flex flex-1 items-center justify-center bg-background">
        <p>Access denied. Redirecting...</p>
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
