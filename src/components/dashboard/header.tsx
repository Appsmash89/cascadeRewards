
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
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile } from "@/lib/types";

type DashboardHeaderProps = {
  user: UserProfile | null;
  isGuest: boolean;
}

export default function DashboardHeader({ user, isGuest }: DashboardHeaderProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
  const router = useRouter();
  const { auth } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    if (!auth) {
      router.push('/');
      return;
    }
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "An error occurred during logout. Please try again.",
      });
    } finally {
      // Ensure redirection happens after the sign-out attempt.
      router.push('/');
    }
  };

  const displayName = isGuest ? "Guest User" : user?.displayName ?? "User";
  const displayAvatar = user?.photoURL;
  const displayEmail = isGuest ? "guest.dev@cascade.app" : user?.email;

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-lg px-4 z-10">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Gift className="h-6 w-6 text-primary" />
        <span className="font-bold text-xl tracking-tight">Cascade</span>
      </div>
      <div className="ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={displayAvatar} alt={displayName} data-ai-hint="person portrait" />
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
    </header>
  )
}
