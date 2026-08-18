"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/events", label: "내 이벤트" },
  { href: "/events/new", label: "새 이벤트" },
  { href: "/profile", label: "프로필" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto flex h-16 w-full max-w-[500px] items-center justify-around border-t bg-background">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex min-w-[48px] flex-col items-center justify-center text-xs text-muted-foreground",
            pathname === item.href && "text-foreground",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
