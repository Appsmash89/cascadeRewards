
'use client';

import React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Code } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FloatingDevTools() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isGuestMode = searchParams.get('mode') === 'guest';

  if (pathname === '/' || !isGuestMode) {
    return null;
  }

  return (
    <div className="fixed bottom-16 left-0 right-0 z-20 max-w-md mx-auto p-2">
      <Card className={cn("bg-secondary/95 backdrop-blur-sm border-primary/50 shadow-lg")}>
        <CardHeader className="p-3 flex-row items-center gap-3 space-y-0">
          <Code className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-base">Developer Tools</CardTitle>
            <CardDescription className="text-xs">Quick access for prototyping.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="flex items-center justify-center h-24 border-2 border-dashed border-muted-foreground/30 rounded-lg">
            <p className="text-muted-foreground text-sm">Dev options will be available here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
