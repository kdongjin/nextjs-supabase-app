import { Home } from "lucide-react";
import Link from "next/link";

// create-event-fab.tsx와 동일한 패턴: fixed는 브라우저 뷰포트 기준으로 붙기 때문에,
// 데스크톱 넓은 화면에서도 mobile-shell.tsx의 max-w-[500px] 프레임 좌측 상단에 위치하도록
// inset-x-0 + mx-auto + max-w-[500px]로 프레임 폭을 재현한 래퍼 안에서 absolute로 배치한다.
export function MobileHomeButton() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 mx-auto w-full max-w-[500px]">
      <Link
        href="/"
        className="pointer-events-auto absolute left-4 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 text-foreground shadow-md backdrop-blur transition-colors hover:bg-background"
      >
        <Home className="h-5 w-5" />
        <span className="sr-only">홈으로 이동</span>
      </Link>
    </div>
  );
}
