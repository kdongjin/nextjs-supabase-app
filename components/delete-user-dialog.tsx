"use client";

// 관리자 사용자 관리 테이블(F014)의 삭제 액션 Dialog.
// components/event-share-actions.tsx의 DeleteEventDialog와 동일한 구조를 사용자용으로 복제한 컴포넌트.
// 실제 사용자 삭제 API 호출은 Task 011(관리자 API)에서 구현될 예정 —
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

export function DeleteUserDialog() {
  function handleDelete() {
    // TODO: Task 011에서 실제 사용자 삭제 API 연동 필요
    toast.success("사용자가 삭제되었습니다");
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
          <DialogTitle>사용자를 삭제할까요?</DialogTitle>
          <DialogDescription>삭제된 사용자는 복구할 수 없습니다.</DialogDescription>
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
