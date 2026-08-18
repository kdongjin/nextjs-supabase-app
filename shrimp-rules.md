# Development Guidelines

이 문서는 AI Agent(Coding Agent) 전용 운영 규칙이다. 일반적인 React/Next.js/TypeScript 지식은 담지 않으며, 이 리포지토리에서만 유효한 제약과 의사결정 기준만 다룬다.

## 프로젝트 개요

- Next.js 16(App Router) + Supabase(`@supabase/ssr`) 인증 스타터. Supabase 공식 `with-supabase` 템플릿에서 출발.
- 현재 코드베이스는 여전히 "튜토리얼 스타터" 상태(인증 흐름만 구현)이며, `docs/PRD.md` / `docs/LEANCANVAS.md` / `docs/ROADMAP.md`에는 이를 확장한 "Gather"(일회성 모임/이벤트 관리 플랫폼) 신규 기능 설계가 진행 중이다. 코드와 기획 문서 사이에 간극이 있음을 항상 인지할 것.
- 원격 Supabase 프로젝트(`pviqdmxduwvnjicsnypk`)에는 `profiles`, `events` 테이블이 이미 존재하지만, 로컬 `supabase/migrations/` 디렉터리는 없고 애플리케이션 코드에서도 아직 연동되지 않았다.

## 프로젝트 아키텍처

### 디렉터리 배치 규칙

- `src/` 디렉터리를 만들지 말 것. `app/`, `components/`, `lib/`는 반드시 리포지토리 루트에 위치.
- 새 shadcn/ui 기본 컴포넌트 → `components/ui/`. `npx shadcn@latest add <name>`으로만 추가하고 수동으로 새로 작성하지 말 것.
- `components/tutorial/`은 Supabase 공식 튜토리얼 안내 전용 — 실제 프로덕션 기능 컴포넌트를 이 폴더에 넣지 말 것.
- 페이지 간 공유되는 기능 컴포넌트(인증 폼, 헤더 버튼 등)는 `components/` 최상위에 flat하게 둔다. 동일 카테고리 컴포넌트가 5개 미만이면 `layout/`, `forms/` 같은 하위 폴더를 미리 만들지 말 것.
- `lib/env.ts`, `lib/constants.ts`, `hooks/`, `schemas/`, `api/` 등은 아직 존재하지 않는다 — 실제로 필요해지기 전에는 빈 폴더/파일을 미리 생성하지 말 것.
- 인증 관련 페이지는 반드시 `app/auth/` 하위에 배치(`login/`, `signup/`을 루트 바로 아래에 두지 말 것). 이는 `proxy.ts`의 리다이렉트 예외 경로 하드코딩과 직결된다.

### 파일 네이밍

- 파일명: kebab-case (`user-profile.tsx`). `UserProfile.tsx`, `user_profile.tsx` 금지.
- 컴포넌트: PascalCase export (`export function LoginForm() {}`). 페이지 컴포넌트는 default export, 그 외는 named export.
- import 순서: 외부 라이브러리 → `@/` 별칭 경로 → 상대 경로. `@/` 별칭을 쓸 수 있는데 `../../../` 형태의 깊은 상대 경로를 쓰지 말 것.

## 기능 구현 표준

### 인증(Supabase 클라이언트 3분리)

- `lib/supabase/client.ts`(브라우저/Client Component), `lib/supabase/server.ts`(Server Component/Server Action, `cookies()` 기반), `lib/supabase/proxy.ts`의 `updateSession()`(루트 `proxy.ts`에서 호출) — 이 세 팩토리를 하나로 통합하거나 서로 대신 사용하지 말 것. 용도가 완전히 분리되어 있다.
- `lib/supabase/server.ts`의 클라이언트 생성 함수는 매 요청마다 함수 내부에서 새로 생성해야 한다. 모듈 최상단 전역 변수에 클라이언트 인스턴스를 캐싱하지 말 것(Fluid compute 호환성 문제).
- 새 인증이 필요한 라우트를 추가할 때는 `app/protected/page.tsx`의 패턴(`supabase.auth.getClaims()`로 세션 확인 → 없으면 `redirect("/auth/login")`)을 그대로 따를 것.

### 폼 구현

- 실제 폼(`components/login-form.tsx`, `components/sign-up-form.tsx` 등)은 Server Actions 없이 Client Component `useState` + `lib/supabase/client.ts` 브라우저 클라이언트로 직접 Supabase Auth를 호출하는 패턴을 쓴다. 새 폼도 이 실제 코드를 기준으로 작성할 것.
- `docs/guides/forms-react-hook-form.md`는 **아직 코드에 적용되지 않은 참고용 문서**다. `react-hook-form`/`@hookform/resolvers`/`zod`는 `package.json`에 없다. 이 문서가 언급하는 `app/actions/`, `components/forms/`, `lib/schemas/`, `components/ui/form.tsx`를 실제 존재하는 것처럼 가정하고 import하지 말 것. `docs/ROADMAP.md`의 Task 004에서 React Hook Form + Zod 도입이 계획되어 있으므로, 해당 Task 착수 시점에만 `package.json`에 의존성을 추가하고 이 문서를 실제 아키텍처로 승격시킨다.

### Gather(이벤트 관리) 신규 기능 진행 시

- `docs/ROADMAP.md`의 Phase/Task 순서를 따를 것. Task 파일 명세 → 구현 → 각 단계 완료 후 중단하고 추가 지시 대기(로드맵에 명시된 워크플로우).
- Phase 2(Task 003~004)는 "더미 데이터 활용" 단계로 명시되어 있다 — 이 단계의 UI 작업에서 실제 Supabase `events`/`profiles` 테이블에 연결하지 말고, 더미 데이터 유틸리티를 만들어 사용할 것.
- API 연동/비즈니스 로직 구현 시 Playwright MCP로 E2E 테스트를 반드시 수행하고, 통과 확인 후에만 다음 단계로 진행할 것(테스트 러너 없는 프로젝트이므로 Playwright MCP가 유일한 검증 수단).

## 프레임워크/라이브러리 사용 표준

- Next.js 16: `params` / `searchParams` / `cookies()` / `headers()`는 전부 Promise. `await` 없이 동기 접근하면 빌드 에러 발생.
- `next.config.ts`에는 `cacheComponents: true`만 설정되어 있다. `typedRoutes`, `turbopack` 커스텀 옵션이 켜져 있다고 가정하지 말 것.
- Tailwind CSS는 **v3**(`^3.4.1`, `tailwind.config.ts` + `@tailwind` 지시어 사용)다. `docs/guides/styling-guide.md` 외의 지식(v4 문법, `tw-animate-css`, `animate-fadeIn` 같은 클래스명)을 적용하지 말 것. 실제 애니메이션 플러그인은 `tailwindcss-animate`이고, 실제 애니메이션 클래스는 `data-[state=open]:animate-in data-[state=open]:fade-in-0` 형태(`components/ui/dropdown-menu.tsx` 참고).
- 색상 변수는 `app/globals.css`에 정의되어 있다(`src/app/`가 아님).
- `next`, `@supabase/ssr`, `@supabase/supabase-js`는 `package.json`에서 버전이 `"latest"`로 열려 있다. 의존성 관련 이슈를 다룰 때는 반드시 `npm ls <package>`로 실제 설치 버전을 먼저 확인할 것 — 문서나 기억에 의존해 버전을 추정하지 말 것.
- shadcn/ui: `new-york` 스타일, base color `neutral`, `components.json` 기준 별칭(`@/components`, `@/components/ui`, `@/lib`, `@/hooks`)을 그대로 사용. 다크모드는 `next-themes`(`app/layout.tsx`의 `ThemeProvider`, `attribute="class"`)로만 처리하고 별도 다크모드 로직을 추가하지 말 것.

## Supabase 스키마 변경 표준

- 로컬 `supabase/migrations/` 디렉터리가 존재하지 않는다 — 로컬 마이그레이션 파일을 새로 만들지 말 것. 스키마 변경은 `mcp__supabase__apply_migration`으로 원격 프로젝트에 직접 반영한다.
- 스키마를 변경하기 전에는 반드시 `mcp__supabase__list_tables`로 현재 원격 구조를 먼저 확인할 것(코드에 남아있는 타입/추측으로 스키마를 판단하지 말 것).
- `profiles`, `events` 테이블은 이미 원격에 존재하지만 애플리케이션 코드와 연동되어 있지 않다. 이 테이블을 코드에서 처음 사용하는 작업을 할 때는 먼저 `list_tables`로 실제 컬럼/타입을 확인한 뒤 TypeScript 타입을 작성할 것(존재를 가정하고 필드명을 추측하지 말 것).

## 핵심 파일 상호작용 표준

- `proxy.ts`(구 `middleware.ts`)의 `config.matcher`와 `lib/supabase/proxy.ts`의 리다이렉트 예외 경로(`/`, `/login`, `/auth/*`)를 수정할 때는 `docs/guides/project-structure.md`의 해당 설명 문단도 함께 갱신할 것.
- `app/auth/` 아래에 새 인증 관련 라우트를 추가할 때는 `proxy.ts`가 이미 이 경로들을 리다이렉트 예외로 하드코딩하고 있는지 함께 검토할 것 — 별도 예외 처리가 필요하면 `proxy.ts`도 같이 수정.
- `components.json`의 별칭(`aliases`)을 변경하면 `tsconfig.json`의 `paths`도 동시에 갱신할 것(현재는 `@/*` → `./*` 하나만 정의되어 있어 서로 맞물려 있음).
- `docs/ROADMAP.md`에서 Task를 완료 처리(✅)할 때는 같은 커밋 안에서 실제 구현 코드도 함께 반영할 것(문서만 먼저 체크하고 코드가 없는 상태를 만들지 말 것).

## AI 에이전트 의사결정 기준

- 폼 구현 방식을 정할 때: `forms-react-hook-form.md`(계획 문서)보다 `components/login-form.tsx` 등 **실제 코드**를 우선한다. 두 소스가 충돌하면 항상 실제 코드가 진실.
- 스타일링 클래스/문법을 정할 때: 일반적으로 알고 있는 최신 Tailwind(v4) 지식보다 이 리포지토리의 `tailwind.config.ts` + 기존 `components/ui/*.tsx` 실제 클래스 사용례를 우선한다.
- 테이블/컬럼 존재 여부를 정할 때: `docs/PRD.md` 같은 기획 문서의 서술보다 `mcp__supabase__list_tables`의 실시간 조회 결과를 우선한다.
- 새 컴포넌트를 어디에 둘지 애매할 때: 재사용 여부(2개 이상 페이지에서 쓰이는가)를 기준으로 판단 — 아니면 해당 라우트 폴더보다 `components/` 최상위 flat 배치를 기본값으로 한다(현재 리포지토리 컨벤션).
- 버전 관련 질문(예: "Next.js 16에서 이 API 되나?")에는 추측하지 말고 `npm ls <package>`로 실제 설치 버전을 확인한 뒤 판단한다.

## 금지 사항

- `lib/supabase/`의 세 클라이언트 팩토리를 통합하거나 서로 다른 용도로 바꿔 쓰지 말 것.
- `lib/supabase/server.ts`의 클라이언트를 모듈 전역 변수에 캐싱하지 말 것.
- `src/` 디렉터리를 생성하지 말 것.
- `supabase/migrations/` 로컬 디렉터리를 임의로 생성하지 말 것 — 이 프로젝트는 원격 직접 반영 방식을 쓴다.
- `forms-react-hook-form.md`가 언급하는 미설치 패키지(`react-hook-form`, `@hookform/resolvers`, `zod`)나 존재하지 않는 파일(`app/actions/`, `components/forms/`, `lib/schemas/`, `components/ui/form.tsx`)을 실제로 존재하는 것처럼 import하지 말 것.
- Tailwind v4 전제의 클래스명(`tw-animate-css`, `animate-fadeIn` 등)을 사용하지 말 것.
- `components/misc/`, `components/common/`, `components/shared/`처럼 의미 없는 폴더명을 만들지 말 것.
- PascalCase/snake_case 파일명을 사용하지 말 것(파일명은 kebab-case 고정).
- `params` / `searchParams` / `cookies()` / `headers()`를 `await` 없이 동기적으로 접근하지 말 것.
- Gather 기능 Phase 2(더미 데이터 단계) UI 작업에서 실제 Supabase `events`/`profiles` 테이블에 조기 연동하지 말 것.
- API/비즈니스 로직 구현 후 Playwright MCP 테스트를 생략하고 다음 단계로 넘어가지 말 것.
