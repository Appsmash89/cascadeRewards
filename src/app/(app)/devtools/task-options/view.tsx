
'use client';

import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useUser } from '@/hooks/use-user';
import { Loader2, ArrowLeft, Trash2, Plus, FileText, Link as LinkIcon, Edit, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { AppSettings } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';

type OptionType = 'taskTitleOptions' | 'taskDescriptionOptions' | 'taskPointsOptions' | 'taskLinkOptions' | 'taskContentOptions';
type OptionValue = string | number;

const OptionManager = ({ title, optionKey, options, onAdd, onDelete }: {
  title: string,
  optionKey: OptionType,
  options: OptionValue[],
  onAdd: (key: OptionType, value: OptionValue) => void,
  onDelete: (key: OptionType, value: OptionValue) => void,
}) => {
  const [newValue, setNewValue] = useState('');
  const isNumeric = optionKey === 'taskPointsOptions';

  const handleAdd = () => {
    if (!newValue.trim()) return;
    const valueToAdd = isNumeric ? Number(newValue) : newValue.trim();
    if (isNumeric && isNaN(valueToAdd as number)) return;
    onAdd(optionKey, valueToAdd);
    setNewValue('');
  };

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="font-medium">{title}</h3>
      <div className="flex items-center gap-2">
        <Input
          type={isNumeric ? 'number' : 'text'}
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder={`New ${title.toLowerCase()} option...`}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <Button onClick={handleAdd} size="sm">
          <Plus className="mr-2 h-4 w-4" /> Add
        </Button>
      </div>
      <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
        {options.length > 0 ? options.map((opt, index) => (
          <div key={index} className="flex items-center justify-between p-2 rounded-md bg-secondary">
            <p className="text-sm truncate flex-1">{String(opt)}</p>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive h-7 w-7"
              onClick={() => onDelete(optionKey, opt)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )) : (
          <p className="text-sm text-center text-muted-foreground p-2">No options defined.</p>
        )}
      </div>
    </div>
  );
}

export default function ManageTaskOptionsView() {
  const firestore = useFirestore();
  const { isAdmin, isUserLoading } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const settingsRef = useMemoFirebase(() =>
    firestore ? doc(firestore, 'app-settings', 'global') : null,
    [firestore]
  );
  const { data: appSettings, isLoading: appSettingsLoading } = useDoc<AppSettings>(settingsRef);
  
  useEffect(() => {
    if (!isUserLoading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAdmin, isUserLoading, router]);

  const handleUpdateOption = async (key: OptionType, value: OptionValue, action: 'add' | 'remove') => {
    if (!settingsRef) return;
    
    const existingOptions = appSettings?.[key] as OptionValue[] || [];
    if (action === 'add' && existingOptions.includes(value)) {
      toast({ variant: 'destructive', title: 'Option already exists' });
      return;
    }

    try {
      await setDoc(settingsRef, {
        [key]: action === 'add' ? arrayUnion(value) : arrayRemove(value)
      }, { merge: true });
      
      toast({ title: `Option ${action === 'add' ? 'Added' : 'Removed'}` });
    } catch(e: any) {
      toast({ variant: 'destructive', title: 'Update Failed', description: e.message });
    }
  };

  const isLoading = appSettingsLoading || isUserLoading;

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
    <Card>
      <CardHeader>
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-4 justify-start w-fit">
          <Link href="/devtools">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to DevTools
          </Link>
        </Button>
        <CardTitle>Manage Task Creation Options</CardTitle>
        <CardDescription>
          Add or remove predefined options for the task creation form fields.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <OptionManager 
          title="Titles"
          optionKey="taskTitleOptions"
          options={appSettings?.taskTitleOptions || []}
          onAdd={(k,v) => handleUpdateOption(k, v, 'add')}
          onDelete={(k,v) => handleUpdateOption(k, v, 'remove')}
        />
        <OptionManager 
          title="Descriptions"
          optionKey="taskDescriptionOptions"
          options={appSettings?.taskDescriptionOptions || []}
          onAdd={(k,v) => handleUpdateOption(k, v, 'add')}
          onDelete={(k,v) => handleUpdateOption(k, v, 'remove')}
        />
        <OptionManager 
          title="Points"
          optionKey="taskPointsOptions"
          options={appSettings?.taskPointsOptions || []}
          onAdd={(k,v) => handleUpdateOption(k, v, 'add')}
          onDelete={(k,v) => handleUpdateOption(k, v, 'remove')}
        />
        <OptionManager 
          title="Links"
          optionKey="taskLinkOptions"
          options={appSettings?.taskLinkOptions || []}
          onAdd={(k,v) => handleUpdateOption(k, v, 'add')}
          onDelete={(k,v) => handleUpdateOption(k, v, 'remove')}
        />
        <OptionManager 
          title="Content Templates"
          optionKey="taskContentOptions"
          options={appSettings?.taskContentOptions || []}
          onAdd={(k,v) => handleUpdateOption(k, v, 'add')}
          onDelete={(k,v) => handleUpdateOption(k, v, 'remove')}
        />
      </CardContent>
    </Card>
  );
}
