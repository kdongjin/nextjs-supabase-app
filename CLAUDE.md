# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

Next.js 16(App Router) + Supabase 인증 스타터 킷. Supabase 공식 `with-supabase` 템플릿 기반이며, 쿠키 기반 세션을 Client Component / Server Component / Proxy(구 Middleware) 전반에서 공유하도록 구성되어 있습니다.

## 개발 명령어

- `npm run dev` — 개발 서버 실행 (localhost:3000)
- `npm run build` — 프로덕션 빌드
- `npm run start` — 프로덕션 서버 실행
- `npm run lint` / `npm run lint:fix` — ESLint 검사·자동 수정 (`next/core-web-vitals`, `next/typescript` 규칙)
- `npm run type-check` — `tsc --noEmit` 타입 체크
- `npm run format` / `npm run format:check` — Prettier 포맷팅·검사 (`prettier-plugin-tailwindcss` 포함)
- 테스트 러너 없음 (테스트 스크립트/프레임워크 미설정)
- `npm run prepare`로 Husky가 설치되고, `.husky/pre-commit`이 `lint-staged`를 실행함(`*.{js,jsx,ts,tsx}` → eslint --fix + prettier, `*.{json,css,md}` → prettier). 커밋 시 자동 실행되므로 별도로 수동 실행할 필요는 없음

## 환경 변수

`.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 필요. 둘 중 하나라도 없으면 `hasEnvVars`(`lib/utils.ts`)가 false가 되어 proxy의 세션 체크가 건너뛰어지고 UI는 로그인/회원가입 버튼 대신 `EnvVarWarning`을 표시함(튜토리얼 편의를 위한 장치).

## 아키텍처

### 디렉터리 구조

`src/` 디렉터리를 사용하지 않음 — `app/`, `components/`, `lib/`가 모두 리포지토리 루트에 있음. `tsconfig.json`의 경로 별칭도 `@/*` → `./*`(루트 기준). 자세한 폴더별 구성과 네이밍 컨벤션은 `docs/guides/project-structure.md` 참고(실제 구조에 맞게 최신화되어 있음).

### 인증 흐름 (`@supabase/ssr`)

용도가 분리된 세 개의 Supabase 클라이언트 팩토리가 있으며, 서로 통합하지 말 것:

- `lib/supabase/client.ts` — 브라우저(Client Component)용, `createBrowserClient`
- `lib/supabase/server.ts` — Server Component/Server Action용, `cookies()` 기반. 함수 내부에서 매 요청마다 새로 생성해야 함(전역 변수 저장 금지 — Fluid compute 호환성 문제)
- `lib/supabase/proxy.ts`의 `updateSession()` — 루트의 `proxy.ts`(Next 16에서 `middleware.ts`를 대체하며, export 함수명도 `proxy`)에서 호출되어 요청/응답 쿠키를 동기화하며 세션을 갱신

`proxy.ts`는 `/`, `/login`, `/auth/*`를 제외한 거의 모든 경로에서 미인증 사용자를 `/auth/login`으로 리다이렉트함. 인증 페이지는 `app/auth/`(login, sign-up, sign-up-success, forgot-password, update-password, confirm 라우트, error) 아래에 있고, `app/protected/`가 인증이 필요한 영역의 예시(`supabase.auth.getClaims()`로 세션 확인 후 없으면 `redirect("/auth/login")`).

### Next.js 16 설정 관련 유의사항

- `next.config.ts`에는 `cacheComponents: true`만 설정됨(`experimental.dynamicIO`가 정식으로 승격된 기능). `typedRoutes`와 `turbopack` 커스텀 옵션은 켜져 있지 않음(`docs/guides/nextjs-16.md`에 이 두 가지가 이 프로젝트에서는 미설정 상태임이 명시되어 있음)
- `params` / `searchParams` / `cookies()` / `headers()`는 모두 Promise. 동기 접근은 Next 16에서 완전히 제거되어 빌드 에러가 발생함
- `package.json`의 `next`, `@supabase/ssr`, `@supabase/supabase-js`는 `"latest"`로 버전이 열려 있음 — 의존성 관련 이슈 디버깅 시 `npm ls <package>`로 실제 설치 버전을 먼저 확인할 것

### UI 컴포넌트

- shadcn/ui, `new-york` 스타일, base color `neutral` (`components.json` 기준)
- 경로 별칭: `@/components`, `@/components/ui`, `@/lib`, `@/hooks`
- 새 shadcn 컴포넌트 추가: `npx shadcn@latest add <name>`
- 다크모드는 `next-themes`(`app/layout.tsx`의 `ThemeProvider`, `attribute="class"`)로 구현

### MCP 서버 연동 (`.mcp.json`)

Supabase(원격 프로젝트 `pviqdmxduwvnjicsnypk`), Playwright, context7, sequential-thinking, shadcn, shrimp-task-manager가 구성되어 있음. `shrimp_data/`는 shrimp-task-manager 전용 데이터 디렉터리.

Supabase MCP는 원격 프로젝트에 직접 연결됨 — 로컬 `supabase/migrations/` 디렉터리는 존재하지 않으므로, 스키마 변경 시 `mcp__supabase__apply_migration` 등으로 원격에 바로 반영됨(로컬 개발 스택 없음). 스키마 변경 전 `mcp__supabase__list_tables`로 현재 구조를 먼저 확인할 것.

## 참고 문서

`docs/guides/` 아래에 프로젝트 구조, 컴포넌트 패턴, React Hook Form + Zod + Server Actions, Tailwind/shadcn 스타일링, Next.js 16 규칙에 대한 상세 가이드가 있음. `project-structure.md`와 `nextjs-16.md`는 실제 코드·설정과 일치하도록 최신화됨.

`forms-react-hook-form.md`는 **아직 이 프로젝트에 적용되지 않은 아키텍처**를 설명하는 참고용 문서임 — `react-hook-form`/`@hookform/resolvers`/`zod`는 `package.json`에 없고, 문서가 참조하는 `app/actions/`, `components/forms/`, `lib/schemas/`, `components/ui/form.tsx` 등도 존재하지 않음. 실제 인증 폼(`components/login-form.tsx` 등)은 Server Actions 없이 Client Component `useState` + `lib/supabase/client.ts`의 브라우저 클라이언트로 직접 Supabase Auth를 호출하는 단순한 패턴을 씀 — 새 폼을 만들 때는 이 실제 코드를 기준으로 삼을 것.

`component-patterns.md`는 실제 코드와 일치하도록 검증·수정됨(대부분 범용 React 패턴이라 원래도 크게 어긋나지 않았지만, Next.js 버전 표기를 정정하고 미설치 패키지 `react-window` 예시에 주의 문구를 추가함).

`styling-guide.md`는 가장 큰 오류가 있었음 — 문서 전체가 "TailwindCSS v4"를 전제로 쓰였지만 실제로는 `tailwind.config.ts` + `@tailwind` 지시어를 쓰는 **v3(`^3.4.1`)**. 애니메이션 라이브러리명도 `tw-animate-css`(존재하지 않음)가 아니라 `tailwindcss-animate`(`tailwind.config.ts`의 plugin)이며, 실제 애니메이션 클래스는 `animate-fadeIn` 같은 이름이 아니라 `data-[state=open]:animate-in data-[state=open]:fade-in-0` 형태(`components/ui/dropdown-menu.tsx` 참고)임. 색상 변수 경로도 `app/globals.css`(`src/app/` 아님)로 정정됨. 4개 가이드 문서 모두 검증·최신화 완료.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
