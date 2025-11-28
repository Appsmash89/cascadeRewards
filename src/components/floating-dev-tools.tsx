
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FloatingDevTools() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isGuestMode = searchParams.get('mode') === 'guest';

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Center the dev tools initially relative to its parent container
    if (dragRef.current && parentRef.current) {
      const parentRect = parentRef.current.getBoundingClientRect();
      const initialX = (parentRect.width - dragRef.current.offsetWidth) / 2;
      setPosition({ x: initialX, y: 0 }); // y is 0 because it's at the bottom
    }
  }, []);


  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragRef.current) {
      setIsDragging(true);
      offsetRef.current = {
        x: e.clientX - dragRef.current.getBoundingClientRect().left,
        y: e.clientY - dragRef.current.getBoundingClientRect().top,
      };
      // Prevent text selection while dragging
      e.preventDefault();
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && dragRef.current && parentRef.current) {
      const parentRect = parentRef.current.getBoundingClientRect();
      
      let x = e.clientX - parentRect.left - offsetRef.current.x;
      let y = e.clientY - parentRect.top - offsetRef.current.y;

      // Constrain movement within the parent
      x = Math.max(0, Math.min(x, parentRect.width - dragRef.current.offsetWidth));
      y = Math.max(0, Math.min(y, parentRect.height - dragRef.current.offsetHeight));

      setPosition({ x, y });
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (pathname === '/' || !isGuestMode) {
    return null;
  }

  return (
    <div ref={parentRef} className="fixed bottom-16 left-0 right-0 z-20 max-w-md mx-auto h-[170px] pointer-events-none p-2">
      <div
        ref={dragRef}
        className="absolute w-[calc(100%-1rem)] pointer-events-auto"
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        }}
      >
        <Card className={cn("bg-secondary/95 backdrop-blur-sm border-primary/50 shadow-lg", isDragging && "cursor-grabbing")}>
          <div
            onMouseDown={handleMouseDown}
            className={cn("absolute left-0 top-0 bottom-0 flex items-center justify-center px-1 cursor-grab", isDragging && "cursor-grabbing")}
          >
            <GripVertical className="h-8 w-4 text-muted-foreground/50" />
          </div>
          <CardHeader className="p-3 pl-6 flex-row items-center gap-3 space-y-0">
            <Code className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-base">Developer Tools</CardTitle>
              <CardDescription className="text-xs">Quick access for prototyping.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 pl-6">
            <div className="flex items-center justify-center h-24 border-2 border-dashed border-muted-foreground/30 rounded-lg">
              <p className="text-muted-foreground text-sm">Dev options will be available here.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
