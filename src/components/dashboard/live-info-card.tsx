'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, CheckCircle, Star } from 'lucide-react';
import AnimatedCounter from '../animated-counter';

const LiveInfoItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) => (
  <div className="flex items-center gap-3">
    <div className="p-2 bg-primary/10 rounded-full">
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="text-sm font-bold tracking-tighter">
        <AnimatedCounter to={value} />
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  </div>
);

// Constants for localStorage keys and timeout duration
const STORAGE_KEY = 'liveInfoStats';
const TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 hours

type StoredStats = {
  timestamp: number;
  users: number;
  tasks: number;
};

export default function LiveInfoCard() {
  const [onlineUsers, setOnlineUsers] = useState(1342);
  const [tasksCompleted, setTasksCompleted] = useState(8934);
  const [pointsAwarded, setPointsAwarded] = useState(446700);

  useEffect(() => {
    const now = Date.now();
    let storedStats: StoredStats | null = null;
    
    try {
      const storedItem = localStorage.getItem(STORAGE_KEY);
      if (storedItem) {
        storedStats = JSON.parse(storedItem);
      }
    } catch (e) {
      console.error("Failed to parse live stats from localStorage", e);
    }

    let baseUsers: number;
    let baseTasks: number;

    // Check if stored data exists and is not expired
    if (storedStats && (now - storedStats.timestamp < TIMEOUT_MS)) {
      // Use persistent values
      baseUsers = storedStats.users;
      baseTasks = storedStats.tasks;
    } else {
      // Randomize values
      baseUsers = Math.floor(Math.random() * 500) + 1000; // Random between 1000-1500
      baseTasks = Math.floor(Math.random() * 2000) + 8000; // Random between 8000-10000
    }
    
    setOnlineUsers(baseUsers);
    setTasksCompleted(baseTasks);

    // Save the new base values and timestamp to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        timestamp: now,
        users: baseUsers,
        tasks: baseTasks
      }));
    } catch (e) {
      console.error("Failed to save live stats to localStorage", e);
    }

    // Interval for small, continuous updates to give a "live" feel
    const usersInterval = setInterval(() => {
      setOnlineUsers(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 2500);

    const tasksInterval = setInterval(() => {
      setTasksCompleted(prev => prev + Math.floor(Math.random() * 3));
    }, 3500);
    
    const pointsInterval = setInterval(() => {
      setPointsAwarded(prev => prev + Math.floor(Math.random() * 150));
    }, 1500);


    return () => {
      clearInterval(usersInterval);
      clearInterval(tasksInterval);
      clearInterval(pointsInterval);
    };
  }, []);

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
            <LiveInfoItem icon={<Users className="h-4 w-4 text-primary"/>} label="Users Online" value={onlineUsers} />
            <LiveInfoItem icon={<CheckCircle className="h-4 w-4 text-green-500"/>} label="Tasks Today" value={tasksCompleted} />
            <LiveInfoItem icon={<Star className="h-4 w-4 text-amber-500"/>} label="Points Awarded" value={pointsAwarded} />
        </div>
      </CardContent>
    </Card>
  );
}
