"use client";

// 초대 링크 참여 페이지의 "참여하기" 버튼. 실제 참여 로직(event_participants insert)은
// Task 010(참여자 관리)에서 구현될 예정 — 지금은 클라이언트 stub(sonner 토스트)으로만 동작한다.

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export interface JoinEventButtonProps {
  eventTitle: string;
}

export function JoinEventButton({ eventTitle }: JoinEventButtonProps) {
  function handleJoin() {
    toast.success(`"${eventTitle}" 이벤트에 참여했습니다`);
  }

  return (
    <Button type="button" className="w-full" onClick={handleJoin}>
      참여하기
    </Button>
  );
}
