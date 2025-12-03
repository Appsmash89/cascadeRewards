
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore } from '@/firebase';
import { useUser } from '@/hooks/use-user';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function FeedbackView() {
  const { user, userProfile } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || !userProfile || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to submit feedback.',
      });
      return;
    }

    if (feedback.trim().length < 10) {
      toast({
        variant: 'destructive',
        title: 'Feedback too short',
        description: 'Please provide at least 10 characters.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const feedbackCollection = collection(firestore, 'feedback');
      await addDoc(feedbackCollection, {
        userId: user.uid,
        userDisplayName: userProfile.displayName,
        content: feedback.trim(),
        createdAt: serverTimestamp(),
      });

      toast({
        title: 'Thank you!',
        description: 'Your feedback has been submitted successfully.',
      });

      router.push('/settings');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: error.message || 'Could not submit your feedback.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-4 justify-start w-fit">
          <Link href="/settings">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Settings
          </Link>
        </Button>
        <CardTitle>Share Your Feedback</CardTitle>
        <CardDescription>
          We are just starting off and would love to hear from you. Show us some love and share your suggestions!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Tell us what you think..."
          className="min-h-[250px] text-base"
          disabled={isSubmitting}
        />
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={isSubmitting || feedback.trim().length < 10} size="lg">
            {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Submit Feedback
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
