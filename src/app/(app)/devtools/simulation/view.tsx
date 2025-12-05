
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Loader2, ArrowLeft, Beaker, Camera } from 'lucide-react';
import type { UserProfile } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const SIMULATION_STORAGE_KEY = 'simulationProfile';

type SimulationData = {
  displayName: string;
  photoURL: string | null;
  points: number;
  level: number;
  totalEarned: number;
  referrals: number;
};

export default function SimulationView() {
  const { isAdmin, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<SimulationData>({
    displayName: 'Simulated User',
    photoURL: null,
    points: 1000,
    level: 5,
    totalEarned: 450,
    referrals: 10,
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
        // Merge saved data with defaults to avoid errors if shape is old
        const parsedData = JSON.parse(savedData);
        setFormData(prev => ({...prev, ...parsedData}));
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
  
  const handlePictureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFormData(prev => ({ ...prev, photoURL: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    try {
        localStorage.setItem(SIMULATION_STORAGE_KEY, JSON.stringify(formData));
        toast({
            title: 'Simulation Template Saved',
            description: 'Your simulated values have been stored locally.',
        });
    } catch(e) {
        console.error("Failed to save simulation data", e);
        toast({
            variant: "destructive",
            title: 'Save Failed',
            description: 'Could not save data to local storage. Check browser permissions.'
        });
    }
  };
  
  const getInitials = (name: string | null) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
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
          <Link href="/devtools/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to User Management
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <Beaker className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Edit Simulation Template</CardTitle>
            <CardDescription>
              Define the mock data to be used when a user is in simulation mode.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-4">
            <div className="relative group">
                <Avatar className="h-24 w-24 border">
                    <AvatarImage src={formData.photoURL ?? undefined} alt={formData.displayName} />
                    <AvatarFallback className="text-3xl">{getInitials(formData.displayName)}</AvatarFallback>
                </Avatar>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <Camera className="h-8 w-8 text-white" />
                </button>
                 <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handlePictureUpload}
                />
            </div>
            <div className="space-y-2 w-full max-w-sm">
                <Label htmlFor="displayName">Display Name</Label>
                <Input id="displayName" type="text" value={formData.displayName} onChange={handleChange} />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="space-y-2">
                <Label htmlFor="referrals">Referrals</Label>
                <Input id="referrals" type="number" value={formData.referrals} onChange={handleChange} />
            </div>
        </div>
        <div className="flex justify-end">
            <Button onClick={handleSave} size="lg">Save Template</Button>
        </div>
      </CardContent>
    </Card>
  );
}
