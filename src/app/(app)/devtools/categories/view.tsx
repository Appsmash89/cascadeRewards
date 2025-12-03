
'use client';

import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useUser } from '@/hooks/use-user';
import { Loader2, ArrowLeft, Trash2, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { AppSettings } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';

export default function CategoriesView() {
  const firestore = useFirestore();
  const { isAdmin, isUserLoading } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [newCategory, setNewCategory] = useState('');

  const categoriesRef = useMemoFirebase(() =>
    firestore ? doc(firestore, 'app-settings', 'taskCategories') : null,
    [firestore]
  );
  const { data: categoriesData, isLoading: categoriesLoading } = useDoc<AppSettings>(categoriesRef);
  
  const categories = useMemo(() => {
    const cats = categoriesData?.taskCategories || [];
    return cats.sort((a, b) => a.localeCompare(b));
  }, [categoriesData]);

  useEffect(() => {
    if (!isUserLoading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAdmin, isUserLoading, router]);


  const handleAddCategory = async () => {
    if (!categoriesRef || !newCategory.trim()) return;
    if ((categoriesData?.taskCategories || []).includes(newCategory.trim())) {
      toast({
        variant: 'destructive',
        title: 'Category already exists',
        description: `The category "${newCategory.trim()}" is already in the list.`,
      });
      return;
    }
    
    await setDoc(categoriesRef, {
      taskCategories: arrayUnion(newCategory.trim()),
    }, { merge: true });

    setNewCategory('');
    toast({ title: 'Category Added', description: `"${newCategory.trim()}" has been added.` });
  };

  const handleDeleteCategory = async (category: string) => {
    if (!categoriesRef) return;
    if (category === 'All') {
        toast({ variant: 'destructive', title: 'Cannot Delete', description: 'The "All" category is essential and cannot be removed.'});
        return;
    }
    
    await setDoc(categoriesRef, {
      taskCategories: arrayRemove(category),
    }, { merge: true });

    toast({ title: 'Category Removed', description: `"${category}" has been removed.` });
  };


  const isLoading = categoriesLoading || isUserLoading;

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
        <CardTitle>Manage Task Categories</CardTitle>
        <CardDescription>
          Add or remove categories that users can choose from and that you can assign to tasks.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-6">
          <Input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category name..."
            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
          />
          <Button onClick={handleAddCategory}>
            <Plus className="mr-2 h-4 w-4" /> Add
          </Button>
        </div>

        <div className="border rounded-lg">
          <div className="divide-y">
            {categories.map((category) => (
              <div key={category} className="flex items-center justify-between p-3 gap-2">
                <p className="font-medium">{category}</p>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-destructive hover:text-destructive" 
                  onClick={() => handleDeleteCategory(category)}
                  disabled={category === 'All'}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
             {categories.length === 0 && (
                <p className="p-4 text-center text-muted-foreground">No categories found. Add one to get started.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
