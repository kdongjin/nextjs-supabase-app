"use client";

// 이벤트 상세 페이지에서 주최자에게만 노출되는 초대 공유/삭제 액션.
// 실제 카카오톡 SDK 연동과 삭제 API 호출은 Task 009(이벤트 CRUD 및 초대 시스템)에서 구현될 예정 —
// 지금은 클라이언트 stub(sonner 토스트)으로만 동작한다.

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface EventShareActionsProps {
  inviteCode: string;
}

export function EventShareActions({ inviteCode }: EventShareActionsProps) {
  async function copyLink() {
    const url = `${window.location.origin}/join/${inviteCode}`;
    await navigator.clipboard.writeText(url);
    toast.success("초대 링크가 복사되었습니다");
  }

  function shareKakao() {
    toast.info("카카오톡 공유는 추후 지원 예정입니다");
  }

  return (
    <div className="flex gap-2">
      <Button type="button" onClick={copyLink}>
        링크 복사
      </Button>
      <Button type="button" variant="outline" onClick={shareKakao}>
        카카오톡 공유
      </Button>
    </div>
  );
}

export function DeleteEventDialog() {
  function handleDelete() {
    toast.success("이벤트가 삭제되었습니다");
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="destructive">
          삭제
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>이벤트를 삭제할까요?</DialogTitle>
          <DialogDescription>삭제된 이벤트는 복구할 수 없습니다.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              취소
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="button" variant="destructive" onClick={handleDelete}>
              삭제
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
