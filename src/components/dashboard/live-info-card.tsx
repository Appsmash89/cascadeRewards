'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, CheckCircle, Star, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

export default function LiveInfoCard() {
  const [onlineUsers, setOnlineUsers] = useState(1342);
  const [tasksCompleted, setTasksCompleted] = useState(8934);
  const [pointsAwarded, setPointsAwarded] = useState(446700);

  useEffect(() => {
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
