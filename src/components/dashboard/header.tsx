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
import { Gift, LogOut, User as UserIcon } from "lucide-react"
import { useRouter } from "next/navigation";
import { useAuth, useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile, AppSettings } from "@/lib/types";
import { motion } from "framer-motion";
import { doc } from "firebase/firestore";
import { cn } from "@/lib/utils";

type DashboardHeaderProps = {
  user: UserProfile | null;
  isGuest: boolean;
}

export default function DashboardHeader({ user, isGuest }: DashboardHeaderProps) {
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
    <motion.div
      initial={{ y: "-100%" }}
      animate={{ y: 0 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className={cn(
        "fixed top-0 left-0 right-0 h-16 border-b bg-background/80 backdrop-blur-lg px-4 z-10 max-w-md mx-auto",
        appSettings?.pastelBackgroundEnabled && "bg-[hsl(var(--pastel-background),0.8)]"
      )}
    >
      <div className="flex h-full items-center gap-4 w-full">
        <div className="flex items-center gap-2 font-semibold">
          <Gift className="h-6 w-6 text-primary" />
          <span className="font-gliker text-2xl tracking-tight">Cascade</span>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
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
    </motion.div>
  )
}
