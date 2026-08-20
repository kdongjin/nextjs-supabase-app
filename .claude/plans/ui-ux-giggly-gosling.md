# UI/UX 개선: 한국어화 + 모바일 홈 버튼 + 로그인 리다이렉트

## Context

이 프로젝트("Gather" 모임/이벤트 관리 앱)는 Supabase 공식 `with-supabase` 스타터킷에서 출발했고, 실제 서비스 화면(`app/(main)/*`의 이벤트 목록/프로필, 관리자 로그인 등)은 이미 한국어로 구현되어 있습니다. 하지만 인증 플로우(`components/login-form.tsx` 등)는 스타터킷의 영어 텍스트가 그대로 남아있고, 모바일 앱 화면(`app/(main)/layout.tsx`)에는 헤더 자체가 없어 홈으로 돌아갈 방법이 없으며, 로그인 성공 후에는 스타터킷이 남긴 보일러플레이트 데모 페이지 `/protected`(사용자 클레임 JSON 덤프 + 튜토리얼)로 이동하도록 되어 있습니다. 이 세 가지를 정리해서 실제 서비스에 맞는 일관된 사용자 경험을 만드는 것이 목적입니다.

사용자와 확인한 결정 사항: 로그인 성공 후 이동할 "메인 화면"과 모바일 화면의 "홈" 버튼은 **동일하게 루트 경로 `/`**(이미 한국어로 구현된 Gather 랜딩 페이지 - "초대 링크 하나로 끝나는 모임 관리, Gather" + "시작하기" 버튼, 로그인 시 상단에 인사말도 표시됨)를 가리킵니다. `/protected`는 이번 변경으로 앱 플로우에서 더 이상 링크되지 않는 미사용 레거시 라우트가 되지만, 요청 범위를 벗어나므로 파일 자체는 삭제하지 않습니다.

---

## 1. 인증 관련 영어 텍스트 → 한국어

기존에 이미 한국어로 되어 있는 `components/admin-login-form.tsx`(관리자 로그인)를 톤/스타일 기준으로 삼아 동일한 어투("로그인", "이메일", "비밀번호", "로그인 중...", "오류가 발생했습니다")로 통일합니다.

**`components/login-form.tsx`**
- "Login" → "로그인" (CardTitle, 버튼)
- "Enter your email below to login to your account" → "이메일과 비밀번호를 입력해 로그인하세요"
- "Email" → "이메일", `placeholder="m@example.com"` 유지(형식 예시라 그대로 둬도 무방)
- "Password" → "비밀번호"
- "Forgot your password?" → "비밀번호를 잊으셨나요?"
- `{isLoading ? "Logging in..." : "Login"}` → `{isLoading ? "로그인 중..." : "로그인"}`
- "Or continue with" → "또는"
- "Don't have an account? Sign up" → "계정이 없으신가요? 회원가입"
- `"An error occurred"` → `"오류가 발생했습니다"`

**`components/sign-up-form.tsx`**
- "Passwords do not match" → "비밀번호가 일치하지 않습니다"
- "Sign up" / "Create a new account" → "회원가입" / "새 계정을 만드세요"
- "Email", "Password", "Repeat Password" → "이메일", "비밀번호", "비밀번호 확인"
- `{isLoading ? "Creating an account..." : "Sign up"}` → `{isLoading ? "계정 생성 중..." : "회원가입"}`
- "Or continue with" → "또는"
- "Already have an account? Login" → "이미 계정이 있으신가요? 로그인"
- `"An error occurred"` → `"오류가 발생했습니다"`

**`components/forgot-password-form.tsx`**
- "Check Your Email" / "Password reset instructions sent" → "이메일을 확인하세요" / "비밀번호 재설정 안내를 보냈습니다"
- "If you registered using your email and password, you will receive a password reset email." → "이메일과 비밀번호로 가입하셨다면 비밀번호 재설정 이메일을 받으실 수 있습니다."
- "Reset Your Password" / "Type in your email and we'll send you a link to reset your password" → "비밀번호 재설정" / "이메일을 입력하면 재설정 링크를 보내드립니다"
- `{isLoading ? "Sending..." : "Send reset email"}` → `{isLoading ? "전송 중..." : "재설정 이메일 보내기"}`
- "Already have an account? Login" → "이미 계정이 있으신가요? 로그인"
- `"An error occurred"` → `"오류가 발생했습니다"`

**`components/update-password-form.tsx`**
- "Reset Your Password" / "Please enter your new password below." → "비밀번호 재설정" / "새 비밀번호를 입력해주세요."
- "New password" (label + placeholder) → "새 비밀번호"
- `{isLoading ? "Saving..." : "Save new password"}` → `{isLoading ? "저장 중..." : "새 비밀번호 저장"}`
- `"An error occurred"` → `"오류가 발생했습니다"`

**`components/google-auth-button.tsx`**
- `{isLoading ? "Redirecting..." : "Continue with Google"}` → `{isLoading ? "이동 중..." : "Google로 계속하기"}`
- `"An error occurred"` → `"오류가 발생했습니다"`

**`app/auth/sign-up-success/page.tsx`**
- "Thank you for signing up!" / "Check your email to confirm" → "가입해 주셔서 감사합니다!" / "이메일을 확인해주세요"
- "You've successfully signed up. Please check your email to confirm your account before signing in." → "회원가입이 완료되었습니다. 로그인 전에 이메일을 확인해 계정을 인증해주세요."

**`app/auth/error/page.tsx`**
- "Code error: {error}" → "오류 코드: {error}"
- "An unspecified error occurred." → "알 수 없는 오류가 발생했습니다."
- "Sorry, something went wrong." → "죄송합니다, 문제가 발생했습니다."

**`components/auth-button.tsx`** (루트 `/`, `/protected` 상단 nav에서 사용, 로그인 상태에 따라 표시)
- `Hey, {user.email}!` → `{user.email}님, 안녕하세요!`
- "Sign in" → "로그인", "Sign up" → "회원가입"

**브랜드/공통 텍스트** — `app/page.tsx`와 `app/protected/layout.tsx`에 동일하게 중복된 nav/footer 마크업
- `<Link href={"/"}>Next.js Supabase Starter</Link>` → `<Link href={"/"}>Gather</Link>` (Hero 컴포넌트가 이미 "Gather"로 브랜딩되어 있는 것과 통일)
- footer의 "Powered by Supabase" → "Powered by"는 유지해도 무방하나 통일성을 위해 그대로 두고 "Supabase" 링크 텍스트만 유지(고유명사이므로 번역 불필요)

**부가 항목 (경미, 표시 빈도 낮음)**
- `components/deploy-button.tsx`: "Deploy to Vercel" → "Vercel에 배포"
- `components/env-var-warning.tsx`: "Supabase environment variables required" → "Supabase 환경 변수가 필요합니다", "Sign in"/"Sign up" → "로그인"/"회원가입"

`i18n` 라이브러리는 설치되어 있지 않으므로(확인 완료) 새로 도입하지 않고, 기존 컴포넌트들과 동일하게 문자열을 직접 한국어로 하드코딩합니다.

---

## 2. 모바일 레이아웃에 "홈" 버튼 추가

현재 `app/(main)/layout.tsx`(이벤트 목록/새 이벤트/프로필 등 실제 앱 화면)와 `app/auth/*` 하위 6개 페이지(로그인/회원가입/비밀번호 찾기 등)에는 헤더가 전혀 없어 홈(`/`)으로 돌아갈 방법이 없습니다. 반면 루트 `/`와 `/protected`는 이미 자체 상단 nav에 홈 링크가 있으므로 대상에서 제외합니다.

기존 `components/create-event-fab.tsx`가 쓰는 패턴(`fixed inset-x-0 ... mx-auto max-w-[500px]`로 500px 프레임을 재현한 뒤 내부에서 `absolute` 배치)을 그대로 재사용해 새 컴포넌트를 만듭니다.

**새 파일: `components/mobile-home-button.tsx`**
- `lucide-react`의 `Home` 아이콘 사용 (이미 `create-event-fab.tsx`에서 `Plus` 아이콘을 쓰는 것과 동일한 패턴)
- `create-event-fab.tsx`와 동일하게 `fixed inset-x-0 top-4 z-50 mx-auto w-full max-w-[500px]` 래퍼 + 내부 `absolute left-4 top-0 pointer-events-auto` 아이콘 버튼(`Link href="/"`)으로 좌측 상단에 고정 배치
- `<span className="sr-only">홈으로 이동</span>` 접근성 텍스트 포함

**새 파일: `app/auth/layout.tsx`**
- `app/auth/` 하위 6개 페이지(login, sign-up, forgot-password, update-password, sign-up-success, error) 전체에 공통 적용되는 레이아웃
- 각 페이지가 이미 자체적으로 `<MobileShell>`로 감싸고 있으므로, 이 레이아웃은 별도 `MobileShell`로 다시 감싸지 않고 `<>{children}<MobileHomeButton /></>` 형태로 버튼만 오버레이
- `fixed` 포지셔닝 기법이라 DOM 중첩 위치와 무관하게 500px 프레임 기준으로 정렬됨

**수정: `app/(main)/layout.tsx`**
- `MobileShell` 내부, `ViewRoleProvider` 상단에 `<MobileHomeButton />` 한 줄 추가

---

## 3. 로그인 성공 후 리다이렉트: `/protected` → `/`

**`components/login-form.tsx`** (L33-34)
```ts
// Update this route to redirect to an authenticated route. The user already has an active session.
router.push("/protected");
```
→ `router.push("/");`로 변경 (주석은 스타터킷이 남긴 안내 주석이므로 함께 제거)

**`components/update-password-form.tsx`** (L27-28)
- 동일하게 `router.push("/protected")` → `router.push("/")`, 주석 제거

**`components/sign-up-form.tsx`** (L39)
```ts
emailRedirectTo: `${window.location.origin}/protected`,
```
→ `` `${window.location.origin}/` ``로 변경 (이메일 인증 링크 클릭 후에도 동일하게 홈으로 이동)

---

## 검증 방법

1. `npm run lint`, `npm run type-check`로 정적 검사
2. `npm run dev` 실행 후 브라우저에서:
   - `/auth/login`, `/auth/sign-up`, `/auth/forgot-password`, `/auth/update-password` 접속해 텍스트가 한국어로 보이는지 확인
   - 로그인 화면(및 이벤트/프로필 화면)에서 좌측 상단 홈 버튼 클릭 시 `/`로 이동하는지 확인
   - 실제 로그인 성공 시 `/protected`가 아닌 `/`로 이동하고, 상단에 "{이메일}님, 안녕하세요!" 인사가 표시되는지 확인
   - 모바일 폭(또는 브라우저 반응형 모드)에서 `/events`, `/profile` 화면의 홈 버튼이 하단 `BottomNav`/`CreateEventFab`과 겹치지 않는지 확인
