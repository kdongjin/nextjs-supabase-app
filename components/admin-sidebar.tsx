import Link from "next/link";

const ADMIN_NAV_ITEMS = [
  { href: "/admin/dashboard", label: "대시보드" },
  { href: "/admin/events", label: "이벤트 관리" },
  { href: "/admin/users", label: "사용자 관리" },
  { href: "/admin/analytics", label: "통계 분석" },
] as const;

export function AdminSidebar() {
  return (
    <aside className="flex h-screen w-[240px] shrink-0 flex-col border-r bg-background">
      <div className="flex h-16 items-center px-4 font-semibold">Gather Admin</div>
      <nav className="flex flex-1 flex-col gap-1 px-2">
        {ADMIN_NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="border-t px-2 py-2">
        <span className="block rounded-md px-3 py-2 text-sm text-muted-foreground">로그아웃</span>
      </div>
    </aside>
  );
}
