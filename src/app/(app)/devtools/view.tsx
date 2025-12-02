
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/hooks/use-user";
import { useCollection, useFirestore, useMemoFirebase, useDoc } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle, Trash2, Edit, Link2, Users, Minus, Plus, RotateCcw, Sparkles, PaintBucket } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useCallback } from "react";
import { collection, doc, deleteDoc, writeBatch, increment, setDoc, getDocs } from "firebase/firestore";
import type { Task, WithId, UserProfile, AppSettings } from "@/lib/types";
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const GUEST_EMAIL = 'guest.dev@cascade.app';

// Helper to convert hex to HSL string
function hexToHsl(hex: string): string | null {
    if (!hex) return null;
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return null;
    
    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return `${h} ${s}% ${l}%`;
}

// Helper to convert HSL string to hex
function hslToHex(hsl: string): string | null {
    if (!hsl) return null;
    const parts = hsl.match(/(\d+)\s*(\d+)%?\s*(\d+)%?/);
    if (!parts) return "#ffffff";

    let h = parseInt(parts[1]), s = parseInt(parts[2]), l = parseInt(parts[3]);
    s /= 100;
    l /= 100;

    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = l - c/2,
        r = 0,
        g = 0,
        b = 0;

    if (0 <= h && h < 60) { r = c; g = x; b = 0; }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
    else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
    
    let R = Math.round((r + m) * 255).toString(16).padStart(2, '0');
    let G = Math.round((g + m) * 255).toString(16).padStart(2, '0');
    let B = Math.round((b + m) * 255).toString(16).padStart(2, '0');

    return `#${R}${G}${B}`;
}


export default function DevToolsView() {
  const { user, userProfile, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  
  const isGuestMode = user?.email === GUEST_EMAIL;

  const appSettingsRef = useMemoFirebase(() =>
    firestore ? doc(firestore, 'app-settings', 'global') : null, [firestore]
  );
  const { data: appSettings } = useDoc<AppSettings>(appSettingsRef);

  const [localColor, setLocalColor] = useState('#ffffff');
  
  useEffect(() => {
    if (appSettings?.pastelBackgroundColor) {
      setLocalColor(hslToHex(appSettings.pastelBackgroundColor) || '#ffffff');
    }
  }, [appSettings]);

  const masterTasksQuery = useMemoFirebase(() =>
    userProfile ? collection(firestore, 'tasks') : null,
    [userProfile, firestore]
  );
  const { data: masterTasks, isLoading: isLoadingMasterTasks } = useCollection<Task>(masterTasksQuery);

  const usersQuery = useMemoFirebase(() => 
    firestore && isGuestMode ? collection(firestore, 'users') : null,
    [firestore, isGuestMode]
  );
  const { data: users, isLoading: usersLoading } = useCollection<UserProfile>(usersQuery);

  useEffect(() => {
    if (!isUserLoading && !isGuestMode) {
      router.push('/dashboard');
    }
  }, [isGuestMode, isUserLoading, router]);

  const handleDeleteTask = async (task: WithId<Task>) => {
    if (!firestore || !userProfile) return;
    
    const isConfirmed = window.confirm(`Are you sure you want to delete "${task.title}"? This cannot be undone.`);
    if (!isConfirmed) return;

    try {
        const masterTaskRef = doc(firestore, 'tasks', task.id);
        await deleteDoc(masterTaskRef);

        if(users) {
          const batch = writeBatch(firestore);
          users.forEach(u => {
            const userTaskRef = doc(firestore, 'users', u.uid, 'tasks', task.id);
            batch.delete(userTaskRef);
          });
          await batch.commit();
        }

        toast({ title: 'Task Deleted', description: `"${task.title}" has been removed for all users.` });
    } catch (e: any) {
        toast({ variant: "destructive", title: 'Error deleting task', description: e.message });
    }
  };

  const handleResetTasks = async () => {
    if (!firestore || !users) {
      toast({ variant: "destructive", title: "Error", description: "Could not reset tasks." });
      return;
    }

    try {
      const batch = writeBatch(firestore);
      
      for (const u of users) {
        const userDocRef = doc(firestore, 'users', u.uid);
        batch.update(userDocRef, {
          points: 0,
          totalEarned: 0
        });

        const userTasksCollectionRef = collection(firestore, 'users', u.uid, 'tasks');
        const userTasksSnapshot = await getDocs(userTasksCollectionRef);
        userTasksSnapshot.forEach(taskDoc => {
          batch.update(taskDoc.ref, { status: 'available', completedAt: null });
        });
      }

      await batch.commit();
      toast({ title: "Success", description: "All user progress has been reset." });

    } catch (e: any) {
      toast({ variant: "destructive", title: "Reset Failed", description: e.message });
    }
  };

  const handleFontSizeChange = async (step: number) => {
    if (!appSettingsRef) return;
    await setDoc(appSettingsRef, { 
      fontSizeMultiplier: increment(step * 0.1) 
    }, { merge: true });
  }

  const handlePastelModeChange = async (enabled: boolean) => {
    if (!appSettingsRef) return;
    await setDoc(appSettingsRef, {
      pastelBackgroundEnabled: enabled
    }, { merge: true });
  }

  const handleColorChange = useCallback(async (hexColor: string) => {
    if (!appSettingsRef) return;
    setLocalColor(hexColor);
    const hslColor = hexToHsl(hexColor);
    if (hslColor) {
      await setDoc(appSettingsRef, {
        pastelBackgroundColor: hslColor
      }, { merge: true });
    }
  }, [appSettingsRef]);


  if (isUserLoading || usersLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isGuestMode) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <p>Access denied.</p>
      </div>
    );
  }

  const sortedTasks = masterTasks?.sort((a, b) => a.title.localeCompare(b.title));
  
  const displayMultiplier = appSettings?.fontSizeMultiplier ? (Math.round(appSettings.fontSizeMultiplier * 10) / 10).toFixed(1) : '1.0';

  return (
    <>
        <Card className="shadow-sm">
            <CardHeader>
              <div>
                  <CardTitle>Developer Tools</CardTitle>
                  <CardDescription>Tools for easy prototyping and quick testing.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button asChild className="w-full">
                  <Link href="/devtools/users">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Link>
              </Button>
               <Button asChild className="w-full">
                  <Link href="/devtools/categories">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Manage Categories
                  </Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset All User Progress
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will reset all task progress and points for EVERY user, including the admin. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleResetTasks}>
                      Yes, Reset Everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <div className="p-2 border rounded-lg flex items-center justify-between">
                <p className="font-medium text-sm pl-2">Global Font Size</p>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="outline" onClick={() => handleFontSizeChange(-1)} disabled={(appSettings?.fontSizeMultiplier ?? 1) <= 0.5}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="font-bold w-10 text-center">{displayMultiplier}x</span>
                  <Button size="icon" variant="outline" onClick={() => handleFontSizeChange(1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-3 border rounded-lg md:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <PaintBucket className="h-5 w-5 text-muted-foreground"/>
                      <Label htmlFor="pastel-mode" className="font-medium text-sm">Pastel Mode</Label>
                    </div>
                    <Switch 
                      id="pastel-mode" 
                      checked={appSettings?.pastelBackgroundEnabled ?? false} 
                      onCheckedChange={handlePastelModeChange}
                    />
                </div>
                {appSettings?.pastelBackgroundEnabled && (
                  <div className="flex items-center gap-4">
                     <Label htmlFor="pastel-color-picker" className="font-medium text-sm">Color</Label>
                    <Input
                      id="pastel-color-picker"
                      type="color"
                      value={localColor}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="w-24 h-10 p-1"
                    />
                  </div>
                )}
              </div>
            </CardContent>
        </Card>

        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Task Management</CardTitle>
                <CardDescription>Add, edit, or delete global tasks.</CardDescription>
            </div>
            <Button size="sm" asChild>
                <Link href="/devtools/task/edit/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Task
                </Link>
            </Button>
            </CardHeader>
            <CardContent>
            <div className="border rounded-lg">
                {isLoadingMasterTasks ? (
                    <div className="p-8 text-center text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </div>
                ) : (
                    <div className="divide-y">
                        {sortedTasks && sortedTasks.map(task => (
                            <div key={task.id} className="flex items-center justify-between p-3 gap-2">
                                <div className="flex-1">
                                    <p className="font-medium">{task.title}</p>
                                    <p className="text-sm text-muted-foreground">{task.points} points</p>
                                    {task.link && (
                                        <Link href={task.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                                            <Link2 className="h-3 w-3" />
                                            {task.link}
                                        </Link>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" asChild>
                                        <Link href={`/devtools/task/edit/${task.id}`}>
                                            <Edit className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteTask(task)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            </CardContent>
        </Card>
    </>
  );
}
