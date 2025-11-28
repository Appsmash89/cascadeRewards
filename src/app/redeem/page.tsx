import DashboardHeader from "@/components/dashboard/header";
import { currentUser } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RedeemPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <DashboardHeader user={currentUser} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Redeem Points</CardTitle>
              <CardDescription>
                Use your points to claim rewards.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-muted-foreground/30 rounded-lg">
                <p className="text-muted-foreground">Redemption options will be available here soon.</p>
                <p className="text-2xl font-bold mt-2">{currentUser.points.toLocaleString()} Points</p>
                <Button className="mt-4">Explore Rewards</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}