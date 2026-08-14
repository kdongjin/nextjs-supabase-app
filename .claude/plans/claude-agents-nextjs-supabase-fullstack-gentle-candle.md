# 구글 소셜 로그인(OAuth) 기능 추가

## Context

현재 이 프로젝트는 이메일/비밀번호 기반 Supabase Auth만 지원한다(`components/login-form.tsx`, `components/sign-up-form.tsx`가 Client Component에서 `lib/supabase/client.ts`의 브라우저 클라이언트를 직접 호출하는 단순한 패턴). 사용자 편의를 위해 구글 계정으로 로그인/가입할 수 있는 OAuth 흐름을 추가한다. Google Provider는 Supabase Dashboard에서 아직 설정되지 않은 상태이므로, 코드 구현과 함께 사용자가 직접 수행해야 할 Google Cloud Console / Supabase Dashboard 수동 설정 가이드도 함께 제공한다. 버튼은 로그인 페이지와 회원가입 페이지 양쪽에 추가한다(사용자 확인 완료).

## 구현 파일

### 1. 신규: `app/auth/callback/route.ts`

기존 `app/auth/confirm/route.ts`(이메일 OTP 확인용 Route Handler)와 동일한 스타일 — 서버 클라이언트(`lib/supabase/server.ts`) + `redirect()` — 을 따르되, OAuth의 `code` 파라미터를 `exchangeCodeForSession`으로 교환한다.

```ts
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error_description = searchParams.get("error_description");
  const next = searchParams.get("next") ?? "/protected";

  if (error_description) {
    redirect(`/auth/error?error=${error_description}`);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      redirect(next);
    } else {
      redirect(`/auth/error?error=${error?.message}`);
    }
  }

  redirect(`/auth/error?error=No code provided`);
}
```

- 성공 시 기본 목적지 `/protected` (이메일/비밀번호 로그인과 동일하게 `login-form.tsx`의 `router.push("/protected")`와 정합).
- Google이 동의 거부 등으로 `code` 대신 `error_description`을 붙여 돌려보내는 경우도 처리.
- `proxy.ts` / `lib/supabase/proxy.ts`는 수정 불필요 — `/auth/*` 경로는 이미 미인증 사용자 리다이렉트 예외 대상.

### 2. 신규: `components/google-auth-button.tsx`

로그인/회원가입 폼 양쪽에서 재사용할 공용 Client Component.

```tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface GoogleAuthButtonProps {
  onError?: (message: string) => void;
}

export function GoogleAuthButton({ onError }: GoogleAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      // 성공 시 브라우저가 Google 동의 화면으로 풀 페이지 리다이렉트되므로
      // 컴포넌트가 언마운트될 때까지 로딩 상태를 유지한다.
    } catch (error: unknown) {
      setIsLoading(false);
      onError?.(error instanceof Error ? error.message : "An error occurred");
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleGoogleLogin}
      disabled={isLoading}
    >
      <GoogleIcon />
      {isLoading ? "Redirecting..." : "Continue with Google"}
    </Button>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
```

- **에러 처리**: `onError` 콜백으로 부모에 위임. 부모의 `setError`(`Dispatch<SetStateAction<string | null>>`)를 그대로 `onError`에 전달하면 기존 `{error && <p className="text-sm text-red-500">{error}</p>}` UI를 그대로 재사용할 수 있다.
- **로딩 상태**: 성공 경로에서는 풀 페이지 리다이렉트가 일어나므로 `isLoading`을 되돌리지 않는다(깜빡임 방지). 에러 시에만 `false`로 복원.
- **아이콘**: `lucide-react`에는 브랜드 로고가 없어 표준 4색 Google "G" 로고를 인라인 SVG로 작성. `components/ui/button.tsx`의 `buttonVariants`에 이미 `[&_svg]:size-4 [&_svg]:shrink-0`이 정의되어 있어(직접 확인 완료) SVG에 별도 className 불필요.
- **redirectTo**: `${window.location.origin}/auth/callback` — `sign-up-form.tsx`의 기존 `emailRedirectTo` 패턴과 동일한 관용구로, 로컬/배포 환경 모두에서 자동으로 올바른 URL을 생성.

### 3. 수정: `components/login-form.tsx`, `components/sign-up-form.tsx`

두 파일에 동일한 패턴 적용:

```tsx
import { GoogleAuthButton } from "@/components/google-auth-button";
```

기존 submit `<Button>` 바로 다음에 구분선 + 버튼 삽입:

```tsx
<div className="relative">
  <div className="absolute inset-0 flex items-center">
    <span className="w-full border-t" />
  </div>
  <div className="relative flex justify-center text-xs uppercase">
    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
  </div>
</div>
<GoogleAuthButton onError={setError} />
```

`bg-card`는 `components/ui/card.tsx`에서 `Card`가 실제로 쓰는 배경 클래스(직접 확인 완료)이므로 구분선 라벨 배경을 여기 맞춰야 다크/라이트 모드 모두에서 끊김 없이 보인다. 나머지 폼 구조·로직은 전혀 건드리지 않는다.

## Supabase Dashboard / Google Cloud Console 수동 설정 (코드 변경 아님)

MCP 도구로는 auth provider 설정을 확인/변경할 수 없으므로 사용자가 직접 수행해야 한다.

**Google Cloud Console** (https://console.cloud.google.com/apis/credentials):
1. OAuth 동의 화면 구성(User Type: External, 테스트 단계면 본인 이메일을 테스트 사용자로 추가).
2. 사용자 인증 정보 생성 → OAuth client ID → Web application.
3. 승인된 리디렉션 URI에 `https://pviqdmxduwvnjicsnypk.supabase.co/auth/v1/callback` 추가(이 프로젝트 앱의 `/auth/callback`과는 다른, Supabase 자체 콜백 엔드포인트).
4. 발급된 Client ID / Client Secret 확보.

**Supabase Dashboard** (https://supabase.com/dashboard/project/pviqdmxduwvnjicsnypk/auth/providers):
1. Google provider 활성화, Client ID/Secret 입력 후 저장.
2. Authentication → URL Configuration에서 Redirect URLs에 `http://localhost:3000/auth/callback`(및 배포 도메인의 동일 경로) 추가 — 등록되지 않은 URL로는 리다이렉트가 거부됨.

Google Client ID/Secret은 `.env.local`에 추가하지 않는다(Supabase Dashboard에만 등록, 서버 사이드에서 처리).

## 검증

1. 정적 검증: `npm run lint`, `npm run type-check`, `npm run build`
2. 런타임 검증(Dashboard 설정 완료 후): `npm run dev` → `/auth/login`, `/auth/sign-up`에서 버튼 렌더링 확인 → 클릭 후 Google 동의 화면 → `/auth/callback?code=...` → `/protected`로 정상 도착 및 로그인 상태(`auth-button.tsx`가 로그아웃 UI로 전환) 확인. 동의 화면에서 취소 시 `/auth/error?error=...`로 정상 이동하는지도 확인.

## 변경 파일 요약

| 파일 | 종류 |
|---|---|
| `app/auth/callback/route.ts` | 신규 |
| `components/google-auth-button.tsx` | 신규 |
| `components/login-form.tsx` | 수정 |
| `components/sign-up-form.tsx` | 수정 |

`proxy.ts`, `lib/supabase/proxy.ts`, `utils/supabase/server.ts`(레거시), `types/database.types.ts`는 수정하지 않는다.
