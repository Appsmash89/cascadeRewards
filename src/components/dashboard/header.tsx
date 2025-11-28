
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
import { Gift, LogOut, User as UserIcon, RotateCcw } from "lucide-react"
import { useDevTools } from "../floating-dev-tools";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile } from "@/lib/types";

type DashboardHeaderProps = {
  user: UserProfile | null;
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
  const devTools = useDevTools();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { auth } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    if (auth) {
      try {
        await signOut(auth);
        router.push('/');
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Logout Failed",
          description: "Could not log out. Please try again.",
        });
      }
    } else {
        // If for some reason auth is not available, still try to navigate to login
        router.push('/');
    }
  };

  if (!user) {
    return (
        <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 z-10">
        </header>
    );
  }
  
  const isGuest = searchParams.get('mode') === 'guest';
  const displayName = isGuest ? "Guest User" : user.displayName;
  const displayAvatar = isGuest ? `https://picsum.photos/seed/guest/100/100` : user.photoURL;

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 z-10">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Gift className="h-6 w-6 text-primary" />
        <span className="font-bold text-xl">Cascade</span>
      </div>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex-1 sm:flex-initial">
          {/* Future search bar can go here */}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <Avatar>
                <AvatarImage src={displayAvatar} alt={displayName} data-ai-hint="person portrait" />
                <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
              </Avatar>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            {devTools?.isGuestMode && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Dev Tools</DropdownMenuLabel>
                <DropdownMenuItem onClick={devTools.resetTasks}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  <span>Reset Tasks</span>
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
