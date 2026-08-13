# 프로젝트 구조 가이드

이 문서는 이 저장소의 실제 폴더 구조, 파일 조직 및 네이밍 컨벤션을 정의합니다.

> ⚠️ 이 프로젝트는 `src/` 디렉터리를 사용하지 않습니다. `app/`, `components/`, `lib/`가 저장소 루트에 바로 위치합니다. `tsconfig.json`의 경로 별칭도 `@/*` → `./*`(루트 기준)이며 `@/*` → `./src/*`가 아닙니다.

## 🏗️ 전체 프로젝트 구조 (실제)

```
nextjs-supabase-app/
├── app/                    # 🚀 Next.js App Router (루트, src/ 없음)
├── components/             # 🧩 React 컴포넌트 (루트)
├── lib/                    # 🛠️ 유틸리티 및 Supabase 클라이언트 (루트)
├── docs/                   # 📚 프로젝트 문서
├── shrimp_data/            # shrimp-task-manager MCP 데이터
├── components.json         # shadcn/ui 설정
├── next.config.ts          # Next.js 설정
├── proxy.ts                # 인증 세션 갱신 (구 middleware.ts)
├── tailwind.config.ts      # Tailwind v3 설정
├── package.json            # 의존성 및 스크립트
├── tsconfig.json           # TypeScript 설정
└── CLAUDE.md                # 개발 지침 메인 문서
```

## 📁 세부 폴더 구조 (실제)

### app/ - App Router 페이지

```
app/
├── layout.tsx              # 🎨 루트 레이아웃 (ThemeProvider, 폰트)
├── page.tsx                # 🏠 홈페이지 (/)
├── globals.css             # 🎨 전역 CSS + Tailwind 지시어 + CSS 변수
├── favicon.ico / opengraph-image.png / twitter-image.png
├── instruments/
│   └── page.tsx             # Supabase 쿼리 데모 페이지
├── protected/               # 🔒 인증 필요 영역 예시
│   ├── layout.tsx
│   └── page.tsx
└── auth/                    # 🔐 인증 관련 페이지 전부 이 아래
    ├── confirm/route.ts     # 이메일 확인 콜백 Route Handler
    ├── error/page.tsx
    ├── forgot-password/page.tsx
    ├── login/page.tsx
    ├── sign-up/page.tsx
    ├── sign-up-success/page.tsx
    └── update-password/page.tsx
```

**🚀 App Router 규칙:**

- `page.tsx`: 해당 경로의 메인 페이지
- `layout.tsx`: 레이아웃 컴포넌트 (자식 페이지 감쌈)
- `route.ts`: Route Handler (`app/auth/confirm/route.ts`가 유일한 예시)
- `loading.tsx` / `error.tsx` / `not-found.tsx`: 현재 프로젝트에는 없음, 필요 시 추가

### components/ - 컴포넌트 조직 (실제)

```
components/
├── ui/                      # 🎛️ shadcn/ui 기본 컴포넌트
│   ├── badge.tsx, button.tsx, card.tsx, checkbox.tsx
│   └── dropdown-menu.tsx, input.tsx, label.tsx
├── tutorial/                # 📖 튜토리얼 안내용 컴포넌트
│   ├── code-block.tsx, connect-supabase-steps.tsx
│   ├── fetch-data-steps.tsx, sign-up-user-steps.tsx, tutorial-step.tsx
├── auth-button.tsx          # 서버 컴포넌트, 로그인 상태에 따라 분기
├── login-form.tsx           # 'use client', useState + supabase.auth 직접 호출
├── sign-up-form.tsx         # 위와 동일 패턴
├── forgot-password-form.tsx / update-password-form.tsx / logout-button.tsx
├── deploy-button.tsx / env-var-warning.tsx / hero.tsx
├── next-logo.tsx / supabase-logo.tsx / theme-switcher.tsx
```

`layout/`, `navigation/`, `sections/`, `providers/` 같은 하위 카테고리 폴더는 존재하지 않습니다. 인증 폼과 페이지 전용 컴포넌트는 `components/` 바로 아래에 평평하게 놓여 있습니다. 새 컴포넌트를 추가할 때 이 관례(카테고리 폴더를 미리 만들지 않고, 필요해질 때만 만드는 방식)를 따르세요.

### lib/ - 유틸리티 및 Supabase 클라이언트 (실제)

```
lib/
├── utils.ts                 # cn() 헬퍼, hasEnvVars 플래그
└── supabase/
    ├── client.ts             # 브라우저용 (createBrowserClient)
    ├── server.ts              # 서버 컴포넌트/액션용 (cookies() 기반)
    └── proxy.ts               # updateSession() — proxy.ts에서 호출
```

`lib/env.ts`, `lib/constants.ts`, `lib/types/`, `lib/hooks/`, `lib/schemas/`, `lib/api/` 등은 존재하지 않습니다. 이런 폴더가 필요해지면 실제로 코드가 생길 때 새로 만드세요 — 미리 빈 폴더를 만들지 마세요.

## 🏷️ 파일 네이밍 컨벤션

### 파일명 규칙 (실제 코드 기준)

이 저장소의 기존 파일들은 전부 kebab-case입니다: `login-form.tsx`, `auth-button.tsx`, `env-var-warning.tsx`, `sign-up-success` 등. 새 파일도 이 컨벤션을 따르세요.

```bash
# ✅ 이 저장소의 실제 관례
login-form.tsx
sign-up-form.tsx
env-var-warning.tsx

# ❌ 지양
LoginForm.tsx
login_form.tsx
```

### 컴포넌트 네이밍

```typescript
// ✅ 컴포넌트 함수명은 PascalCase, 파일명은 kebab-case
// 파일: components/login-form.tsx
export function LoginForm() {}
```

## 🔗 경로 별칭 (Path Alias)

`tsconfig.json`에 정의된 유일한 별칭:

```json
{
  "paths": {
    "@/*": ["./*"]
  }
}
```

즉 `@/components/...`, `@/lib/...`는 전부 루트 기준 상대 경로가 `@/`로 치환되는 것일 뿐이며, `components.json`의 `aliases` 항목(`@/components`, `@/lib`, `@/hooks`, `@/ui`)은 이 단일 별칭의 하위 표기일 뿐 별도 tsconfig 설정이 필요하지 않습니다. `@/hooks`, `@/ui`는 shadcn CLI가 컴포넌트를 생성할 때 참조하는 논리적 경로이며, 대응하는 실제 폴더(`hooks/`)는 아직 존재하지 않습니다.

```typescript
// ✅ 권장
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

// ❌ 지양
import { Button } from "../../../components/ui/button";
```

## 📝 새 파일/폴더 추가 규칙

### 1. 새 UI 컴포넌트 추가

```bash
# shadcn/ui 컴포넌트 추가 (컴포넌트는 components/ui/ 아래 생성됨)
npx shadcn@latest add <component-name>
```

### 2. 새 페이지 추가

```bash
# app/ 바로 아래에 생성 (src/app이 아님)
app/about/page.tsx
app/users/[id]/page.tsx
```

### 3. 새 인증 관련 페이지 추가

`app/auth/` 아래에 추가하고, `proxy.ts`의 리다이렉트 예외 조건(`/`, `/login`, `/auth/*`)에 걸리는지 확인하세요.

## ✅ 체크리스트

새 파일/폴더 추가 시 확인사항:

- [ ] `src/`가 아니라 저장소 루트의 `app/`, `components/`, `lib/`에 배치
- [ ] kebab-case 파일명 사용
- [ ] PascalCase 컴포넌트 함수명 사용
- [ ] `@/*` 경로 별칭 사용 (상대 경로 지양)
- [ ] 실제로 필요해지기 전에는 카테고리 폴더(`hooks/`, `types/` 등)를 미리 만들지 않음
