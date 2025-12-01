
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore } from '@/firebase';
import { useUser } from '@/hooks/use-user';
import { doc } from 'firebase/firestore';
import { taskCategories, TaskCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OnboardingView() {
  const { user, userProfile } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [selectedInterests, setSelectedInterests] = useState<Set<TaskCategory>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInterestToggle = (category: TaskCategory) => {
    setSelectedInterests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const handleSubmit = async () => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to save preferences.',
      });
      return;
    }

    if (selectedInterests.size === 0) {
      toast({
        variant: 'destructive',
        title: 'No Interests Selected',
        description: 'Please select at least one category to continue.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDocumentNonBlocking(userDocRef, {
        interests: Array.from(selectedInterests),
      });

      toast({
        title: 'Preferences Saved!',
        description: 'Your task feed will now be personalized.',
      });

      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to Save',
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
        >
            <Card>
                <CardHeader className="text-center">
                    <motion.div 
                        animate={{ scale: [1, 1.2, 1], rotate: [-10, 10, 0] }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="mx-auto bg-primary/10 border border-primary/20 p-3 rounded-full text-primary w-fit mb-4"
                    >
                        <Sparkles className="h-8 w-8" />
                    </motion.div>
                    <CardTitle className="text-2xl">Personalize Your Experience</CardTitle>
                    <CardDescription>Select your interests to get relevant tasks.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {taskCategories.map((category, index) => (
                            <motion.div
                                key={category}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 + index * 0.05 }}
                            >
                                <Label
                                    htmlFor={category}
                                    className={`flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-all ${
                                    selectedInterests.has(category)
                                        ? 'bg-primary/10 border-primary'
                                        : 'hover:bg-secondary'
                                    }`}
                                >
                                    <Checkbox
                                    id={category}
                                    checked={selectedInterests.has(category)}
                                    onCheckedChange={() => handleInterestToggle(category)}
                                    />
                                    <span className="font-medium">{category}</span>
                                </Label>
                            </motion.div>
                        ))}
                    </div>
                    <Button
                        size="lg"
                        className="w-full h-12 text-base mt-6"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        Continue
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    </div>
  );
}
