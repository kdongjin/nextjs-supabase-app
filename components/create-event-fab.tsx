"use client";

import { Plus } from "lucide-react";
import Link from "next/link";

import { useViewRole } from "@/lib/view-role-context";

// bottom-nav.tsx와 동일한 패턴: fixed는 브라우저 뷰포트 기준으로 붙기 때문에,
// 데스크톱 넓은 화면에서도 mobile-shell.tsx의 max-w-[500px] 프레임 우측 하단에 위치하도록
// inset-x-0 + mx-auto + max-w-[500px]로 프레임 폭을 재현한 래퍼 안에서 absolute로 배치한다.
export function CreateEventFab() {
  const { viewRole } = useViewRole();

  if (viewRole !== "host") {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-16 z-50 mx-auto w-full max-w-[500px]">
      <Link
        href="/events/new"
        className="pointer-events-auto absolute bottom-4 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
      >
        <Plus className="h-6 w-6" />
        <span className="sr-only">이벤트 만들기</span>
      </Link>
    </div>
  );
}
