"use client";

// Phase 3(Task 008) 실제 인증 도입 시 제거 예정 — 지금은 로그인/세션이 없어 이벤트마다
// 개별 판정되는 host/participant 역할을 화면에서 데모하기 위한 임시 전역 토글이다.

import { createContext, useContext, useState } from "react";

export type ViewRole = "host" | "participant";

interface ViewRoleContextValue {
  viewRole: ViewRole;
  setViewRole: (role: ViewRole) => void;
}

const ViewRoleContext = createContext<ViewRoleContextValue | undefined>(undefined);

export function ViewRoleProvider({ children }: { children: React.ReactNode }) {
  const [viewRole, setViewRole] = useState<ViewRole>("host");

  return (
    <ViewRoleContext.Provider value={{ viewRole, setViewRole }}>
      {children}
    </ViewRoleContext.Provider>
  );
}

export function useViewRole(): ViewRoleContextValue {
  const context = useContext(ViewRoleContext);
  if (!context) {
    throw new Error("useViewRole은 ViewRoleProvider 내부에서만 사용할 수 있습니다.");
  }
  return context;
}
