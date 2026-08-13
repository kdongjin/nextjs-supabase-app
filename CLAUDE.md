# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

Next.js 16(App Router) + Supabase 인증 스타터 킷. Supabase 공식 `with-supabase` 템플릿 기반이며, 쿠키 기반 세션을 Client Component / Server Component / Proxy(구 Middleware) 전반에서 공유하도록 구성되어 있습니다.

## 개발 명령어

- `npm run dev` — 개발 서버 실행 (localhost:3000)
- `npm run build` — 프로덕션 빌드
- `npm run start` — 프로덕션 서버 실행
- `npm run lint` — ESLint 검사 (`next/core-web-vitals`, `next/typescript` 규칙)
- 타입 체크 전용 스크립트는 없음 — 필요 시 `npx tsc --noEmit`으로 직접 실행
- 테스트 러너 없음 (테스트 스크립트/프레임워크 미설정)
- `docs/nextjs-16.md`는 `npm run typecheck` / `format:check` / `check-all`을 언급하지만 `package.json`에는 해당 스크립트가 존재하지 않음 — 문서와 실제 설정이 어긋나 있으므로 실행 전 `package.json`으로 재확인할 것

## 환경 변수

`.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 필요. 둘 중 하나라도 없으면 `hasEnvVars`(`lib/utils.ts`)가 false가 되어 proxy의 세션 체크가 건너뛰어지고 UI는 로그인/회원가입 버튼 대신 `EnvVarWarning`을 표시함(튜토리얼 편의를 위한 장치).

## 아키텍처

### 디렉터리 구조 — `docs/project-structure.md`와 실제 코드 불일치 주의

`docs/project-structure.md`는 `src/app`, `src/components`, `src/lib` 구조를 설명하지만, 실제 코드는 리포지토리 루트에 있음: `app/`, `components/`, `lib/`. `tsconfig.json`의 경로 별칭도 `@/*` → `./*`(루트 기준)이고 `src/*`가 아님. 새 파일을 추가할 때는 `docs/`의 예시 경로가 아니라 실제 루트 구조를 따를 것.

### 인증 흐름 (`@supabase/ssr`)

용도가 분리된 세 개의 Supabase 클라이언트 팩토리가 있으며, 서로 통합하지 말 것:

- `lib/supabase/client.ts` — 브라우저(Client Component)용, `createBrowserClient`
- `lib/supabase/server.ts` — Server Component/Server Action용, `cookies()` 기반. 함수 내부에서 매 요청마다 새로 생성해야 함(전역 변수 저장 금지 — Fluid compute 호환성 문제)
- `lib/supabase/proxy.ts`의 `updateSession()` — `proxy.ts`(Next 16에서 `middleware.ts`를 대체, export 함수명도 `proxy`)에서 호출되어 요청/응답 쿠키를 동기화하며 세션을 갱신

`proxy.ts`는 `/`, `/login`, `/auth/*`를 제외한 거의 모든 경로에서 미인증 사용자를 `/auth/login`으로 리다이렉트함. 인증 페이지는 `app/auth/`(login, sign-up, sign-up-success, forgot-password, update-password, confirm 라우트, error) 아래에 있고, `app/protected/`가 인증이 필요한 영역의 예시.

### Next.js 16 설정 관련 유의사항

- `next.config.ts`에는 `cacheComponents: true`만 설정됨(`experimental.dynamicIO`가 정식으로 승격된 기능). `typedRoutes`는 켜져 있지 않음 — `docs/nextjs-16.md`가 "필수"라고 설명하지만 실제 설정과 다름
- `params` / `searchParams` / `cookies()` / `headers()`는 모두 Promise. 동기 접근은 Next 16에서 완전히 제거되어 빌드 에러가 발생함
- `eslint-config-next`는 `15.3.1`로 고정, `next`는 `"latest"`(현재 설치 버전 16.3.0)로 열려 있어 버전이 어긋남 — lint 규칙이 최신 Next 16 권장사항과 다를 수 있음

### UI 컴포넌트

- shadcn/ui, `new-york` 스타일, base color `neutral` (`components.json` 기준)
- 경로 별칭: `@/components`, `@/components/ui`, `@/lib`, `@/hooks`
- 새 shadcn 컴포넌트 추가: `npx shadcn@latest add <name>`
- 다크모드는 `next-themes`(`app/layout.tsx`의 `ThemeProvider`, `attribute="class"`)로 구현

### MCP 서버 연동 (`.mcp.json`)

Supabase(원격 프로젝트 `pviqdmxduwvnjicsnypk`), Playwright, context7, shadcn, shrimp-task-manager가 구성되어 있음. `shrimp_data/`는 shrimp-task-manager 전용 데이터 디렉터리.

## 참고 문서

`docs/` 아래에 컴포넌트 패턴, React Hook Form + Zod + Server Actions, Tailwind/shadcn 스타일링, Next.js 16 규칙에 대한 상세 가이드가 있음. 다만 위에서 언급한 대로 디렉터리 구조·npm 스크립트·`typedRoutes` 설정 부분은 실제 코드와 어긋나 있으므로, 코드 패턴은 참고하되 구조·명령어 관련 내용은 실제 설정 파일(`package.json`, `tsconfig.json`, `next.config.ts`)을 우선 신뢰할 것.
