
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
import { Gift, LogOut, User as UserIcon, Star } from "lucide-react"
import { useRouter } from "next/navigation";
import { useAuth, useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile, AppSettings } from "@/lib/types";
import { Progress } from "../ui/progress";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { doc } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { useState } from "react";

type DashboardHeaderProps = {
  user: UserProfile | null;
  isGuest: boolean;
}

const POINTS_PER_LEVEL = 100;

export default function DashboardHeader({ user, isGuest }: DashboardHeaderProps) {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });


  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
  const router = useRouter();
  const { auth, firestore } = useAuth();
  const { toast } = useToast();

  const settingsRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'app-settings', 'global') : null, 
    [firestore]
  );
  const { data: appSettings } = useDoc<AppSettings>(settingsRef);

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

  
  return (
    <motion.header 
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className={cn(
        "sticky top-0 flex h-16 border-b bg-background/80 backdrop-blur-lg px-4 z-10",
        appSettings?.pastelBackgroundEnabled && "bg-[hsl(var(--pastel-background),0.8)]"
    )}>
      <div className="flex h-16 items-center gap-4 w-full">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Gift className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl tracking-tight">Cascade</span>
        </div>

        <div className="flex items-center gap-2 ml-auto">
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
    </motion.header>
  )
}
