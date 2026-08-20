"use client";

// Phase 3(Task 008) 실제 인증 도입 시 제거 예정 — 로그인이 없는 지금은 이벤트별로 갈리는
// host/participant 뷰 차이를 직접 눈으로 확인할 수 있도록 프로필 화면에 임시 토글을 둔다.

import { Button } from "@/components/ui/button";
import { useViewRole, type ViewRole } from "@/lib/view-role-context";

const VIEW_ROLE_OPTIONS: { value: ViewRole; label: string }[] = [
  { value: "host", label: "주최자 시점" },
  { value: "participant", label: "참여자 시점" },
];

export function ViewRoleToggle() {
  const { viewRole, setViewRole } = useViewRole();

  return (
    <div className="flex gap-2">
      {VIEW_ROLE_OPTIONS.map((option) => (
        <Button
          key={option.value}
          type="button"
          size="sm"
          variant={viewRole === option.value ? "default" : "outline"}
          onClick={() => setViewRole(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
