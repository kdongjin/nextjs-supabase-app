# 프로젝트 구조 가이드

이 문서는 Next.js 16(App Router) + Supabase 프로젝트의 폴더 구조, 파일 조직 및 네이밍 컨벤션을 정의합니다.

> ⚠️ 이 프로젝트는 `src/` 디렉터리를 사용하지 않습니다. `app/`, `components/`, `lib/`는 모두 리포지토리 루트에 있습니다.

## 🏗️ 전체 프로젝트 구조

```
nextjs-supabase-app/
├── app/                    # 🚀 Next.js App Router
├── components/             # 🧩 React 컴포넌트
├── lib/                    # 🛠️ 유틸리티 및 Supabase 클라이언트
├── docs/                   # 📚 프로젝트 문서
│   └── guides/            # 개발 가이드 모음
├── shrimp_data/            # shrimp-task-manager 전용 데이터
├── public/                 # 🌍 정적 파일(현재 비어있음, favicon 등은 app/ 아래에 위치)
├── proxy.ts                # 🔀 Next.js 16 미들웨어(구 middleware.ts)
├── components.json         # shadcn/ui 설정
├── next.config.ts          # Next.js 설정
├── tsconfig.json           # TypeScript 설정
├── .mcp.json                # MCP 서버 설정
└── CLAUDE.md               # 개발 지침 메인 문서
```

## 📁 세부 폴더 구조

### app/ - App Router 페이지

```
app/
├── layout.tsx                    # 🎨 루트 레이아웃 (ThemeProvider, 폰트 설정)
├── page.tsx                      # 🏠 홈페이지 (/)
├── globals.css                   # 🎨 전역 CSS 스타일
├── favicon.ico
├── opengraph-image.png
├── twitter-image.png
├── instruments/
│   └── page.tsx                  # Supabase 데이터 조회 예시 페이지
├── protected/
│   ├── layout.tsx                # 인증 필요 영역 공통 레이아웃
│   └── page.tsx                  # 인증된 사용자만 접근 가능한 예시 페이지
└── auth/
    ├── login/page.tsx
    ├── sign-up/page.tsx
    ├── sign-up-success/page.tsx
    ├── forgot-password/page.tsx
    ├── update-password/page.tsx
    ├── error/page.tsx
    └── confirm/route.ts          # 이메일 인증 콜백 Route Handler
```

**🚀 App Router 규칙:**

- `page.tsx`: 해당 경로의 메인 페이지
- `layout.tsx`: 레이아웃 컴포넌트 (자식 페이지 감쌈)
- `route.ts`: Route Handler (예: `app/auth/confirm/route.ts`)
- `loading.tsx` / `error.tsx` / `not-found.tsx`: 현재 미사용, 필요 시 해당 라우트 폴더에 추가

로그인/회원가입 등 인증 관련 페이지는 반드시 `app/auth/` 아래에 배치하며, `login/`, `signup/` 처럼 루트 바로 아래에 두지 않습니다. `lib/supabase/proxy.ts`(루트 `proxy.ts`에서 호출)가 `/`, `/auth/*`를 리다이렉트 예외 경로로 하드코딩하고 있으므로, 새 인증 페이지도 이 규칙을 따라야 합니다.

예외적으로 `app/admin/login/`(관리자 로그인)과 `app/join/[invite_code]/`(초대 링크 미리보기)는 `app/auth/` 밖에 있으면서도 비로그인 접근이 허용되어야 하는 페이지라서, `lib/supabase/proxy.ts`에 `/admin/login`, `/join` 두 경로가 별도 예외로 하드코딩되어 있습니다. `/admin/*`의 다른 하위 경로(`/admin/dashboard` 등)는 계속 보호 대상이므로 `/admin`이 아니라 `/admin/login`만 정확히 예외 처리한 것에 유의하세요. 이 두 경로를 옮기거나 이런 성격의 페이지를 새로 추가할 때는 `lib/supabase/proxy.ts`의 예외 조건도 함께 검토해야 합니다.

### components/ - 컴포넌트 조직

```
components/
├── ui/                          # 🎛️ shadcn/ui 기본 컴포넌트
│   ├── badge.tsx
│   ├── button.tsx
│   ├── card.tsx
│   ├── checkbox.tsx
│   ├── dropdown-menu.tsx
│   ├── input.tsx
│   └── label.tsx
├── tutorial/                    # 📖 튜토리얼 전용 컴포넌트
│   ├── code-block.tsx
│   ├── connect-supabase-steps.tsx
│   ├── fetch-data-steps.tsx
│   ├── sign-up-user-steps.tsx
│   └── tutorial-step.tsx
├── auth-button.tsx              # 로그인 상태에 따라 분기되는 헤더 버튼
├── login-form.tsx
├── sign-up-form.tsx
├── forgot-password-form.tsx
├── update-password-form.tsx
├── logout-button.tsx
├── env-var-warning.tsx          # 환경변수 미설정 시 표시되는 경고 배너
├── theme-switcher.tsx
├── hero.tsx
├── deploy-button.tsx
├── next-logo.tsx
└── supabase-logo.tsx
```

**🧩 컴포넌트 분류 규칙:**

1. **`components/ui/`**: shadcn/ui 기반 재사용 가능한 기본 컴포넌트. 순수 UI, 비즈니스 로직 없음, props로 모든 동작 제어. `npx shadcn@latest add <name>`으로 추가
2. **`components/tutorial/`**: Supabase 공식 튜토리얼 안내용 컴포넌트. 실제 프로덕션 기능을 추가할 때 이 폴더에 넣지 않음
3. **그 외 `components/` 최상위**: 인증 폼, 헤더 버튼 등 페이지 간 공유되는 기능 컴포넌트. 현재는 `layout/`, `navigation/`, `sections/`, `providers/` 같은 하위 분류 없이 평평하게(flat) 구성되어 있음 — 컴포넌트 수가 늘어나기 전까지는 이 구조를 유지하고, 필요해지면 그때 카테고리 폴더를 만들 것

특정 페이지에서만 쓰는 컴포넌트를 별도 분리할 필요가 있다면 해당 라우트 폴더 안에 두는 것도 방법이지만, 현재 이 프로젝트는 그 패턴을 쓰지 않고 `components/` 최상위에 모아두는 방식을 따르고 있습니다.

### lib/ - 유틸리티 및 Supabase 클라이언트

```
lib/
├── utils.ts                     # cn() 헬퍼, hasEnvVars
└── supabase/
    ├── client.ts                 # 브라우저(Client Component)용
    ├── server.ts                 # Server Component/Server Action용
    └── proxy.ts                  # updateSession() — 루트 proxy.ts에서 호출
```

세 Supabase 클라이언트 팩토리의 역할이 서로 다르므로 통합하지 말 것(자세한 내용은 `CLAUDE.md`의 "인증 흐름" 섹션 참고). `env.ts`, `constants.ts`, `types/`, `hooks/`, `schemas/`, `api/` 같은 하위 폴더는 아직 존재하지 않습니다 — 필요해지는 시점에 만들 것이며, 미리 빈 폴더를 만들어두지 않습니다.

## 🏷️ 파일 네이밍 컨벤션

### 파일명 규칙

이 프로젝트의 기존 파일은 전부 kebab-case를 따릅니다(`login-form.tsx`, `env-var-warning.tsx`, `theme-switcher.tsx` 등). 새 파일도 이 컨벤션을 따를 것.

```bash
# ✅ 올바른 파일명 (기존 코드와 일치)
user-profile.tsx        # kebab-case

# ❌ 잘못된 파일명
UserProfile.tsx         # PascalCase 금지
user_profile.tsx        # snake_case 금지
```

### 컴포넌트 네이밍

```typescript
// ✅ 올바른 컴포넌트 네이밍 (예: components/login-form.tsx)
export function LoginForm() {} // PascalCase

// ❌ 잘못된 컴포넌트 네이밍
export function loginForm() {} // camelCase 금지
```

## 🔗 경로 별칭 (Path Aliases)

`tsconfig.json`은 `@/*` → 리포지토리 루트(`./*`) 하나만 정의합니다. `components.json`의 별칭들도 전부 이 루트 기준 경로를 가리킵니다:

```typescript
// ✅ 경로 별칭 사용 (권장)
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LoginForm } from "@/components/login-form";
import { createClient } from "@/lib/supabase/server";

// ❌ 상대 경로 사용 (금지)
import { Button } from "../../components/ui/button";
```

**📍 정의된 별칭 (`components.json` 기준):**

- `@/components` → `components`
- `@/components/ui` → `components/ui`
- `@/lib` → `lib`
- `@/hooks` → `hooks` (현재 `hooks/` 디렉터리는 아직 존재하지 않음 — shadcn CLI가 커스텀 훅을 추가할 때 자동 생성될 예정으로 미리 선언된 별칭)

## 📝 새 파일/폴더 추가 규칙

### 1. 새 UI 컴포넌트 추가

```bash
# shadcn/ui 컴포넌트 추가
npx shadcn@latest add [component-name]

# 커스텀 UI 컴포넌트 추가
components/ui/custom-component.tsx
```

### 2. 새 페이지 추가

```bash
# 정적 페이지
app/about/page.tsx

# 동적 페이지
app/users/[id]/page.tsx

# 인증이 필요한 페이지 → app/protected/ 하위에 추가하거나
# proxy.ts의 리다이렉트 예외 경로(/, /auth/*)를 함께 검토할 것
```

### 3. 새 비즈니스 컴포넌트 추가

여러 페이지에서 재사용하지 않는 한, 우선 `components/` 최상위에 flat하게 추가합니다. 특정 카테고리(예: 폼 컴포넌트, 대시보드 위젯)가 5개 이상 쌓이면 그때 하위 폴더로 묶는 것을 고려합니다.

### 4. 새 유틸리티 추가

```bash
# 공통 유틸리티 → 기존 파일에 추가
lib/utils.ts

# 특화된 유틸리티 → 새 파일 생성
lib/date-utils.ts
```

## 🎯 코드 조직 베스트 프랙티스

### 1. 단일 책임 원칙

하나의 파일은 하나의 주요 기능만 담당하며, 관련된 타입과 유틸리티는 같은 파일에 포함 가능합니다.

### 2. 의존성 순서

```typescript
// 1. 외부 라이브러리
import { redirect } from "next/navigation";

// 2. 내부 라이브러리 (@/ 경로)
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

// 3. 상대 경로
import { hasEnvVars } from "../utils";
```

### 3. Export 규칙

```typescript
// ✅ Named export (컴포넌트, 함수)
export function LoginForm() {}

// ✅ Default export (페이지 컴포넌트)
export default function LoginPage() {}

// ❌ 같은 대상을 두 방식으로 동시에 export하지 않음
```

## 🚫 금지사항

```bash
# 의미 없는 폴더명
components/misc/
components/common/
components/shared/

# 혼재된 케이스
Components/userProfile/LoginForm.tsx

# 깊은 상대 경로 (별칭 사용 가능한데도)
import { utils } from "../../../../lib/utils";
```

## ✅ 체크리스트

새 파일/폴더 추가 시 확인사항:

- [ ] 실제 루트 구조(`app/`, `components/`, `lib/`)를 기준으로 배치 — `src/` 아래에 만들지 않음
- [ ] kebab-case 파일명 사용
- [ ] PascalCase 컴포넌트명 사용
- [ ] `@/` 경로 별칭 사용
- [ ] 의존성 import 순서 준수 (외부 → `@/` → 상대 경로)
