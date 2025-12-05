
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Loader2, ArrowLeft, Beaker } from 'lucide-react';
import type { UserProfile } from '@/lib/types';

const SIMULATION_STORAGE_KEY = 'simulationProfile';

type SimulationData = {
  displayName: string;
  photoURL: string;
  points: number;
  level: number;
  totalEarned: number;
};

export default function SimulationView() {
  const { isAdmin, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState<SimulationData>({
    displayName: 'Simulated User',
    photoURL: 'https://picsum.photos/seed/sim/200/200',
    points: 1000,
    level: 5,
    totalEarned: 450,
  });

  useEffect(() => {
    if (!isUserLoading && !isAdmin) {
      router.push('/dashboard');
      return;
    }
    
    // Load existing simulation data from local storage
    try {
      const savedData = localStorage.getItem(SIMULATION_STORAGE_KEY);
      if (savedData) {
        setFormData(JSON.parse(savedData));
      }
    } catch (e) {
        console.error("Failed to load simulation data from storage", e);
    }
  }, [isAdmin, isUserLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSave = () => {
    try {
        localStorage.setItem(SIMULATION_STORAGE_KEY, JSON.stringify(formData));
        toast({
            title: 'Simulation Data Saved',
            description: 'Your simulated values have been stored locally. The app will reload to apply them.',
        });
        // Reload to make the context pick up the new values
        setTimeout(() => window.location.reload(), 1000);
    } catch(e) {
        console.error("Failed to save simulation data", e);
        toast({
            variant: "destructive",
            title: 'Save Failed',
            description: 'Could not save data to local storage. Check browser permissions.'
        });
    }
  };

  if (isUserLoading) {
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
    <Card>
      <CardHeader>
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-4 justify-start w-fit">
          <Link href="/devtools">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to DevTools
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <Beaker className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Edit Simulation Data</CardTitle>
            <CardDescription>
              Define the mock data to be used when Simulation Mode is active.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name</Label>
          <Input id="displayName" value={formData.displayName} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="photoURL">Photo URL</Label>
          <Input id="photoURL" value={formData.photoURL} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
                <Label htmlFor="points">Points</Label>
                <Input id="points" type="number" value={formData.points} onChange={handleChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Input id="level" type="number" value={formData.level} onChange={handleChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="totalEarned">Total Earned</Label>
                <Input id="totalEarned" type="number" value={formData.totalEarned} onChange={handleChange} />
            </div>
        </div>
        <div className="flex justify-end">
            <Button onClick={handleSave} size="lg">Save Simulation Data</Button>
        </div>
      </CardContent>
    </Card>
  );
}
