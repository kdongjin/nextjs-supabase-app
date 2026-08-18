# 소비자 영역 레이아웃을 모바일 폭(500px) 셸로 제한

## Context

사용자가 참고 이미지 `wisely.png`(데스크톱 브라우저에서도 콘텐츠가 약 500px 폭 컬럼으로 가운데 정렬되고 바깥은 여백으로 남는 쇼핑몰 사이트 구조)를 보여주며, 현재 앱의 레이아웃 구조를 이 형태로 바꾸고 최대 너비를 모바일 사이즈로 제한해달라고 요청했다. 확인 결과 이 프로젝트에는 이미 두 가지 다른 폭 컨벤션이 섞여 있다 — `app/page.tsx`/`app/protected/layout.tsx`는 `max-w-5xl`(1024px, 데스크톱형), `app/auth/*` 6개 페이지는 `max-w-sm`(384px, 모바일 폼 카드형). 사용자는 "일반 사용자(주최자/참여자) 영역만" 500px로 제한하고, 좌측 240px 사이드바를 쓰는 관리자 데스크톱 영역(`/admin/*`)은 그대로 두기로 확인했다.

## 확인된 핵심 제약사항

- **`components/bottom-nav.tsx`가 `fixed inset-x-0`로 뷰포트 전체 폭 기준 고정**되어 있어, 콘텐츠만 500px로 좁히면 하단 내비게이션 바가 화면 전체 너비로 어긋난다. `fixed` 요소에 `left:0; right:0`(=`inset-x-0`)과 `max-width`를 함께 주면 `margin:auto`가 남는 여백을 좌우 균등 분배해 중앙 정렬되는 표준 CSS 동작을 이용해 해결한다.
- `app/page.tsx`가 참조하는 `Hero`, `ConnectSupabaseSteps`, `CodeBlock` 등 하위 컴포넌트를 직접 읽어 확인한 결과 500px를 초과하는 하드코딩된 고정폭이 없다(`max-w-xl`, `w-full`, `bg-muted p-6` 등 상대 단위만 사용) — 셸을 씌워도 내부 콘텐츠가 잘리지 않는다.
- `app/auth/{login,sign-up,sign-up-success,forgot-password,update-password,error}/page.tsx` 6개 파일은 전부 동일한 `<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10"><div className="w-full max-w-sm">{...}</div></div>` 패턴이라 동일한 방식으로 일괄 교체 가능하다(login, sign-up 실제 확인 완료).
- `tailwind.config.ts`에 `container`/`screens` 커스텀 설정이 없고, `bg-muted`/`bg-background`/`border` 같은 shadcn 시맨틱 컬러 토큰은 이미 `bottom-nav.tsx`, `admin-sidebar.tsx`에서 사용 중이며 다크모드(`next-themes`) 대응이 이미 되어 있다 — 새 컴포넌트도 이 토큰만 쓰면 별도 다크모드 분기 없이 자동 대응된다.

## 구현 접근

Route Group으로 기존 파일들을 물리적으로 재배치하는 방식(예: 새 그룹 폴더로 이동)은 이미 정상 동작 중인 인증 플로우 파일들을 대거 이동시켜야 해 위험도가 크므로 배제한다. 대신 재사용 컴포넌트 `components/mobile-shell.tsx`를 만들어, 대상 페이지/레이아웃들이 각자 자신의 반환값을 이 컴포넌트로 감싸는 방식을 쓴다.

```
// components/mobile-shell.tsx
export function MobileShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="min-h-screen w-full bg-muted/30">
      <div className={cn("mx-auto flex min-h-screen w-full max-w-[500px] flex-col bg-background", className)}>
        {children}
      </div>
    </div>
  );
}
```

- 바깥(`bg-muted/30`) vs 안쪽 컬럼(`bg-background`)의 명도차로 경계를 표현 — `border-x`는 다크모드에서 `--border`와 `--muted` 값이 동일해 사실상 안 보이므로 넣지 않는다.
- `className` prop을 열어둬 auth 페이지처럼 내부 정렬(`items-center justify-center`)이 필요한 곳에서 오버라이드 가능하게 한다.
- 위치는 `components/` 최상위 flat 배치(기존 `bottom-nav.tsx`, `admin-sidebar.tsx`, `hero.tsx`와 동일한 컨벤션).

### 파일별 변경 (신규 1 + 수정 9)

1. **`components/mobile-shell.tsx`** (신규) — 위 컴포넌트, `@/lib/utils`의 `cn` 사용.
2. **`app/page.tsx`** — 최상위 `<main className="flex min-h-screen flex-col items-center">`를 `<MobileShell>`로 교체하고, 내부 `max-w-5xl` 2곳(nav 안쪽 div, 본문 div)을 `w-full`로 교체. `Suspense`/`EnvVarWarning` 분기, `Hero`/`ConnectSupabaseSteps`/`SignUpUserSteps`, footer 등 나머지 구조·로직은 그대로 보존.
3. **`app/(main)/layout.tsx`** — 전체를 `<MobileShell>`로 감싸고, 기존 `<div className="flex min-h-screen flex-col pb-16">{children}</div>`와 `<Suspense><BottomNav/></Suspense>`는 그 안에 그대로 유지.
4. **`components/bottom-nav.tsx`** — `className`에 `mx-auto w-full max-w-[500px]` 추가(`fixed inset-x-0 bottom-0 z-50 mx-auto flex h-16 w-full max-w-[500px] items-center justify-around border-t bg-background`)해서 콘텐츠 컬럼과 좌우 경계를 픽셀 단위로 맞춘다.
5. **`app/join/[invite_code]/page.tsx`** — `<MobileShell>초대 링크 참여</MobileShell>`로 교체.
6. **`app/auth/{login,sign-up,sign-up-success,forgot-password,update-password,error}/page.tsx`** (6개 파일, 동일 패턴) — 최상위 `<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">`를 `<MobileShell className="items-center justify-center p-6 md:p-10">`로 교체, 내부 `<div className="w-full max-w-sm">{...}</div>` 폼 카드는 그대로 유지(500px 컬럼 안에 384px 카드가 자연스럽게 중앙 정렬됨).

### 명시적으로 건드리지 않는 파일

- `app/admin/(dashboard)/layout.tsx`, `components/admin-sidebar.tsx`, `app/admin/login/page.tsx`, `app/admin/(dashboard)/{dashboard,events,users,analytics}/page.tsx` — 관리자 데스크톱 영역, 제외 확정
- `app/protected/layout.tsx`, `app/protected/page.tsx`, `app/instruments/page.tsx` — Supabase 튜토리얼 잔재, Gather 서비스와 무관
- `app/layout.tsx`(루트) — 여기에 폭 제한을 넣으면 관리자 영역까지 영향받으므로 손대지 않음

## 검증 방법

1. `npm run dev` 실행 후 브라우저에서 데스크톱 폭(예: 1440px)으로 `/`, `/auth/login`, `/events`(로그인 필요), `/join/abc123` 접속 — 콘텐츠가 500px 컬럼으로 가운데 정렬되고 바깥이 옅은 회색으로 구분되는지 육안 확인
2. `/events`(또는 `(main)` 그룹 아무 페이지)에서 BottomNav 좌우 경계가 위 콘텐츠 컬럼 경계와 정확히 일치하는지 확인(어긋나면 CSS 기법이 틀린 것)
3. `/admin/dashboard` 접속 — 기존처럼 사이드바 240px + 나머지 전체 폭 데스크톱 레이아웃이 그대로인지(이번 변경의 영향을 받지 않았는지) 확인
4. 브라우저 창을 모바일 폭(<500px)으로 좁혀서 `max-w-[500px]`가 `w-full`처럼 자연스럽게 줄어드는지 확인
5. `next-themes` 다크모드 토글(`/protected` 페이지의 `ThemeSwitcher` 이용) 후 위 페이지들에서 바깥 여백과 콘텐츠 컬럼의 명도차가 라이트모드와 동일하게 자연스러운지 확인
6. `npm run build`, `npm run lint`, `npm run type-check` 실행해 회귀 없는지 확인
