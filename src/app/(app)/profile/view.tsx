
'use client';

import { useUser } from '@/hooks/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Loader2, UserCheck, ArrowLeft, Edit, Camera, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const ReferrerInfo = ({ referrerId }: { referrerId: string }) => {
  const firestore = useFirestore();
  const referrerRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'users', referrerId) : null),
    [firestore, referrerId]
  );
  const { data: referrerProfile, isLoading } = useDoc<UserProfile>(referrerRef);

  if (isLoading) {
    return <Loader2 className="h-4 w-4 animate-spin" />;
  }

  if (!referrerProfile) {
    return <p className="text-sm text-muted-foreground">Referrer not found.</p>;
  }

  return (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-secondary rounded-full">
        <UserCheck className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Referred by</p>
        <p className="font-mono font-semibold tracking-wider">{referrerProfile.referralCode}</p>
      </div>
    </div>
  );
};

export default function ProfileView() {
  const { userProfile, isAdmin } = useUser();
  
  // State for local edits
  const [localDisplayName, setLocalDisplayName] = useState('');
  const [localPhotoURL, setLocalPhotoURL] = useState<string | null>(null);
  const [useLocalProfile, setUseLocalProfile] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize state from localStorage and userProfile
  useEffect(() => {
    if (userProfile) {
        try {
            const storedName = localStorage.getItem('localDisplayName');
            const storedAvatar = localStorage.getItem('localPhotoURL');
            const storedToggle = localStorage.getItem('useLocalProfile') === 'true';

            setLocalDisplayName(storedName || userProfile.displayName || '');
            setLocalPhotoURL(storedAvatar || userProfile.photoURL || null);
            setUseLocalProfile(storedToggle);

        } catch (e) {
            console.error("Failed to access localStorage", e);
            // Fallback to userProfile if localStorage fails
            setLocalDisplayName(userProfile.displayName || '');
            setLocalPhotoURL(userProfile.photoURL || null);
        }
    }
  }, [userProfile]);

  // Handlers to update state and localStorage
  const handleNameChange = (newName: string) => {
    setLocalDisplayName(newName);
    localStorage.setItem('localDisplayName', newName);
  };

  const handlePictureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLocalPhotoURL(result);
        localStorage.setItem('localPhotoURL', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleChange = (checked: boolean) => {
    setUseLocalProfile(checked);
    localStorage.setItem('useLocalProfile', String(checked));
    // Force a reload to ensure the context updates everywhere
    window.location.reload();
  };

  const getInitials = (name: string | null) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  const handleNameKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setIsEditingName(false);
    }
  };


  if (!userProfile) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (isAdmin) {
      return (
          <div className="flex flex-1 items-center justify-center">
            <p>Admin users do not have a profile page.</p>
        </div>
      )
  }

  const displayedName = useLocalProfile ? localDisplayName : userProfile.displayName;
  const displayedPhoto = useLocalProfile ? localPhotoURL : userProfile.photoURL;

  return (
    <Card>
      <CardHeader>
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-4 justify-start w-fit">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <div className="flex flex-col items-center text-center space-y-4">
            <motion.div 
                className="relative group"
                whileHover={{ scale: 1.05 }}
            >
                <Avatar className="h-24 w-24 border-4 border-primary/20">
                    <AvatarImage src={displayedPhoto ?? undefined} alt={displayedName ?? 'User'} />
                    <AvatarFallback className="text-3xl">{getInitials(displayedName)}</AvatarFallback>
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
            </motion.div>
          
          <div>
            <div className="flex items-center gap-2 justify-center">
                {isEditingName ? (
                    <Input
                        type="text"
                        value={localDisplayName}
                        onChange={(e) => handleNameChange(e.target.value)}
                        onBlur={() => setIsEditingName(false)}
                        onKeyDown={handleNameKeyDown}
                        className="text-2xl font-semibold h-10 text-center"
                        autoFocus
                    />
                ) : (
                    <CardTitle className="text-2xl">{displayedName}</CardTitle>
                )}
                <Button variant="ghost" size="icon" onClick={() => setIsEditingName(!isEditingName)}>
                    <Edit className="h-4 w-4 text-muted-foreground" />
                </Button>
            </div>
            <CardDescription>{userProfile.email}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Separator />
         <div className="mt-6 p-4 border rounded-lg flex items-center justify-between bg-secondary/50">
            <Label htmlFor="local-profile-switch" className="flex flex-col gap-1">
                <span className="font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary"/>Use Local Profile</span>
                <span className="text-xs text-muted-foreground">Use the name and avatar edited here across the app.</span>
            </Label>
            <Switch
                id="local-profile-switch"
                checked={useLocalProfile}
                onCheckedChange={handleToggleChange}
            />
        </div>
        <div className="mt-6">
          {userProfile.referredBy ? (
            <ReferrerInfo referrerId={userProfile.referredBy} />
          ) : (
            <p className="text-sm text-center text-muted-foreground">
              You haven't been referred by anyone yet. Add a referrer code in{' '}
              <Link href="/settings" className="text-primary hover:underline">
                Settings
              </Link>.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
