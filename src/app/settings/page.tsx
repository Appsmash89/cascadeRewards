
import Link from "next/link";
import DashboardHeader from "@/components/dashboard/header";
import { currentUser } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/dashboard/bottom-nav";
import { ChevronRight, Code } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <DashboardHeader user={currentUser} />
      <main className="flex flex-1 flex-col gap-4 p-4 pb-20">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>
              Manage your account and app settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <Link href="/devtools" className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-4">
                  <Code className="h-6 w-6 text-primary" />
                  <div className="flex flex-col">
                    <span className="font-semibold">Developer Tools</span>
                    <span className="text-sm text-muted-foreground">Prototyping & testing options.</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
