import Link from "next/link";

import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <h1 className="max-w-xl text-3xl !leading-tight lg:text-4xl">
        초대 링크 하나로 끝나는 모임 관리, <span className="font-bold">Gather</span>
      </h1>
      <p className="mx-auto max-w-xl text-muted-foreground">
        제목, 날짜, 장소만 입력하면 이벤트가 만들어지고 초대 링크 하나로 참여자를 모을 수 있어요.
      </p>
      <Button asChild size="lg">
        <Link href="/auth/login">시작하기</Link>
      </Button>
      <div className="my-2 w-full bg-gradient-to-r from-transparent via-foreground/10 to-transparent p-[1px]" />
    </div>
  );
}
