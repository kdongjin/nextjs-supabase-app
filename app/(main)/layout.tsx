import { BottomNav } from "@/components/bottom-nav";
import { MobileShell } from "@/components/mobile-shell";
import { Suspense } from "react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <MobileShell>
      <div className="flex min-h-screen flex-col pb-16">{children}</div>
      <Suspense>
        <BottomNav />
      </Suspense>
    </MobileShell>
  );
}
