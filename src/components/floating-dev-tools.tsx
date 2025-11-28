
'use client';

import React, { useState, useRef, MouseEvent, TouchEvent, useContext, createContext, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

type DevToolsContextType = {
  isGuestMode: boolean;
  resetTasks: () => void;
} | null;

const DevToolsContext = createContext<DevToolsContextType>(null);

export const useDevTools = () => useContext(DevToolsContext);

type FloatingDevToolsProps = {
  onResetTasks: () => void;
};

export default function FloatingDevTools({ onResetTasks }: FloatingDevToolsProps) {
  const searchParams = useSearchParams();
  const isGuestMode = searchParams.get('mode') === 'guest';
  
  const [isDragging, setIsDragging] = useState(false);
  const [positionY, setPositionY] = useState(0);
  const dragStartPos = useRef({ startY: 0, initialY: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const contextValue = useMemo(() => ({
    isGuestMode,
    resetTasks: onResetTasks,
  }), [isGuestMode, onResetTasks]);

  const handleDragStart = (e: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStartPos.current = {
      startY: clientY,
      initialY: positionY,
    };
    e.preventDefault();
  };

  const handleDragMove = (e: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaY = clientY - dragStartPos.current.startY;
    setPositionY(dragStartPos.current.initialY + deltaY);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    const handleGlobalMouseMove = (e: globalThis.MouseEvent) => {
      if (isDragging) {
        handleDragMove(e as any);
      }
    };
    
    const handleGlobalTouchMove = (e: globalThis.TouchEvent) => {
        if (isDragging) {
            handleDragMove(e as any);
        }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleGlobalTouchMove);
    window.addEventListener('touchend', handleDragEnd);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging]);

  const showDevTools = isGuestMode;

  return (
    <DevToolsContext.Provider value={contextValue}>
      {showDevTools ? (
        <div 
          ref={cardRef}
          className="fixed bottom-16 left-0 right-0 z-20 max-w-md mx-auto p-2"
          style={{
            transform: `translateY(${positionY}px)`,
            bottom: '4rem',
          }}
        >
          <Card 
            className={cn(
              "bg-secondary/95 backdrop-blur-sm border-primary/50 shadow-lg",
              isDragging && 'cursor-grabbing'
            )}
          >
            <div 
              className="absolute left-1/2 -translate-x-1/2 -top-2 p-1 cursor-grab"
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
            >
              <GripVertical className="h-5 w-5 text-primary/80" />
            </div>
            <CardHeader className="p-3 pt-4 flex-row items-center gap-3 space-y-0">
              <Code className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-base">Developer Tools</CardTitle>
                <CardDescription className="text-xs">Quick access for prototyping.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="flex items-center justify-center h-24 border-2 border-dashed border-muted-foreground/30 rounded-lg">
                <Button onClick={onResetTasks}>Reset Tasks</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </DevToolsContext.Provider>
  );
}
