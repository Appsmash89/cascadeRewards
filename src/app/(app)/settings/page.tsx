'use client';

import { Suspense } from "react";
import SettingsView from "./view";
import { Loader2 } from "lucide-react";


function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-1 items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <SettingsView />
    </Suspense>
  )
}

export default SettingsPage;
