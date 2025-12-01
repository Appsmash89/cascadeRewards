
'use client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Gift, LogOut, User as UserIcon, Award } from "lucide-react"
import { useRouter } from "next/navigation";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile } from "@/lib/types";
import { Progress } from "../ui/progress";
import { motion } from "framer-motion";
import AnimatedCounter from "../animated-counter";

type DashboardHeaderProps = {
  user: UserProfile | null;
  isGuest: boolean;
}

const POINTS_PER_LEVEL = 1000;

export default function DashboardHeader({ user, isGuest }: DashboardHeaderProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
  const router = useRouter();
  const { auth } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    if (!auth) {
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "Authentication service not available.",
      });
      return;
    }
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Logout Error:", error);
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "An error occurred during logout. Please try again.",
      });
    }
  };

  const displayName = isGuest ? "Admin" : user?.displayName ?? "User";
  const displayAvatar = user?.photoURL;
  const displayEmail = isGuest ? "guest.dev@cascade.app" : user?.email;
  const level = user?.level ?? 1;
  const totalEarned = user?.totalEarned ?? 0;
  const points = user?.points ?? 0;

  const pointsInCurrentLevel = totalEarned % POINTS_PER_LEVEL;
  const levelProgress = (pointsInCurrentLevel / POINTS_PER_LEVEL) * 100;
  
  return (
    <header className="sticky top-0 flex flex-col border-b bg-background/80 backdrop-blur-lg px-4 z-10">
      <div className="flex h-16 items-center gap-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Gift className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl tracking-tight">Cascade</span>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-2 bg-amber-500/10 text-amber-500 rounded-full pl-3 pr-1 py-1 border border-amber-500/20">
             <Award className="h-4 w-4" />
             <span className="font-bold text-sm tabular-nums">
                <AnimatedCounter to={points} />
             </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={displayAvatar ?? undefined} alt={displayName} data-ai-hint="person portrait" />
                  <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {displayEmail}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled={isGuest} className="cursor-pointer">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex flex-col gap-2 pb-3">
        <div className="flex items-center gap-3">
            <span className="text-xs font-bold bg-primary/10 text-primary border border-primary/20 rounded-full h-6 w-6 flex items-center justify-center">
                {level}
            </span>
            <div className="flex-1">
            <Progress value={levelProgress} className="h-2" />
            </div>
            <span className="text-xs font-bold bg-primary/10 text-primary border border-primary/20 rounded-full h-6 w-6 flex items-center justify-center">
                {level+1}
            </span>
        </div>
        <p className="text-xs text-muted-foreground text-center font-medium">
            {pointsInCurrentLevel} / {POINTS_PER_LEVEL} points to Level {level + 1}
        </p>
      </div>
    </header>
  )
}
