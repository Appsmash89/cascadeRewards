
'use client';

import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useUser } from '@/hooks/use-user';
import { Loader2, ArrowLeft, Trash2, Plus, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { AppSettings } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';

const GUEST_EMAIL = 'guest.dev@cascade.app';

export default function ManageAdminsView() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [newAdminEmail, setNewAdminEmail] = useState('');

  const settingsRef = useMemoFirebase(() =>
    firestore ? doc(firestore, 'app-settings', 'global') : null,
    [firestore]
  );
  const { data: appSettings, isLoading: appSettingsLoading } = useDoc<AppSettings>(settingsRef);
  
  const isAdmin = user && (user.email === GUEST_EMAIL || (appSettings?.adminEmails || []).includes(user.email));

  const adminEmails = useMemo(() => {
    const emails = appSettings?.adminEmails || [];
    return [GUEST_EMAIL, ...emails.filter(email => email !== GUEST_EMAIL)].sort();
  }, [appSettings]);
  
  useEffect(() => {
    if (!isUserLoading && !appSettingsLoading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAdmin, isUserLoading, appSettingsLoading, router]);

  const handleAddAdmin = async () => {
    if (!settingsRef || !newAdminEmail.trim()) return;
    const emailToAdd = newAdminEmail.trim();

    if (adminEmails.includes(emailToAdd)) {
      toast({
        variant: 'destructive',
        title: 'Admin already exists',
        description: `The email "${emailToAdd}" is already an admin.`,
      });
      return;
    }
    
    await setDoc(settingsRef, {
      adminEmails: arrayUnion(emailToAdd),
    }, { merge: true });

    setNewAdminEmail('');
    toast({ title: 'Admin Added', description: `"${emailToAdd}" has been granted admin privileges.` });
  };

  const handleRemoveAdmin = async (email: string) => {
    if (!settingsRef) return;
    if (email === GUEST_EMAIL) {
        toast({ variant: 'destructive', title: 'Cannot Remove', description: 'The default admin cannot be removed.'});
        return;
    }
    
    await setDoc(settingsRef, {
      adminEmails: arrayRemove(email),
    }, { merge: true });

    toast({ title: 'Admin Removed', description: `"${email}" has had its admin privileges revoked.` });
  };

  if (isUserLoading || appSettingsLoading) {
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
    <Card>
      <CardHeader>
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-4 justify-start w-fit">
          <Link href="/devtools">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to DevTools
          </Link>
        </Button>
        <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <div>
                <CardTitle>Manage Admins</CardTitle>
                <CardDescription>
                Add or remove users who have full administrative access.
                </CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-6">
          <Input
            type="email"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            placeholder="new.admin@example.com"
            onKeyDown={(e) => e.key === 'Enter' && handleAddAdmin()}
          />
          <Button onClick={handleAddAdmin}>
            <Plus className="mr-2 h-4 w-4" /> Add Admin
          </Button>
        </div>

        <div className="border rounded-lg">
          <div className="divide-y">
            {adminEmails.map((email) => (
              <div key={email} className="flex items-center justify-between p-3 gap-2">
                <p className="font-medium">{email}</p>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-destructive hover:text-destructive" 
                  onClick={() => handleRemoveAdmin(email)}
                  disabled={email === GUEST_EMAIL}
                  aria-label={`Remove ${email}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
             {adminEmails.length === 0 && (
                <p className="p-4 text-center text-muted-foreground">No admins found.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
