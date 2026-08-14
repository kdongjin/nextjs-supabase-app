# 변경사항 커밋 계획

## Context

`git status` 기준으로 미커밋 변경사항이 세 가지 서로 다른 성격으로 섞여 있음:
1. Google OAuth 소셜 로그인 기능 구현 (수정 2건 + 신규 2건 + 계획 문서 1건)
2. 신규 Claude Code 서브에이전트 정의 파일
3. Playwright MCP가 생성한 디버그 산출물(`.playwright-mcp/`) — 아직 `.gitignore`에 없어 untracked로 잡힘

`CLAUDE.md`(전역) 규칙상 "커밋은 작은 단위로 나눠서" 처리해야 하므로, 성격이 다른 이 세 그룹을 하나로 묶지 않고 별도 커밋 3개로 분리한다.

## 커밋 계획

### 커밋 1 — ✨ feat: Google OAuth 로그인 기능 추가
- `components/google-auth-button.tsx` (신규) — `supabase.auth.signInWithOAuth({ provider: "google" })` 호출하는 클라이언트 컴포넌트
- `app/auth/callback/route.ts` (신규) — 기존 `app/auth/confirm/route.ts` 패턴을 따라 OAuth `code`를 `exchangeCodeForSession`으로 교환하는 Route Handler
- `components/login-form.tsx` (수정) — `GoogleAuthButton` 삽입
- `components/sign-up-form.tsx` (수정) — `GoogleAuthButton` 삽입
- `.claude/plans/claude-agents-nextjs-supabase-fullstack-gentle-candle.md` (신규) — 이 기능을 설계한 계획 문서. 내용이 정확히 이 기능에 대한 것이므로 같은 커밋에 포함(기존 리포지토리도 `.claude/plans/*.md`를 일반 커밋에 함께 추적하는 컨벤션을 따름)

### 커밋 2 — 🧑‍💻 dx: Next.js+Supabase 풀스택 개발 서브에이전트 추가
- `.claude/agents/nextjs-supabase-fullstack-developer.md` (신규) — OAuth 기능과 무관한 범용 개발 서브에이전트 정의라 별도 커밋으로 분리

### 커밋 3 — 🙈 chore: Playwright MCP 디버그 산출물 gitignore 처리
- `.gitignore`에 `.playwright-mcp/` 추가
- `.playwright-mcp/` 내부의 콘솔 로그·스크린샷·페이지 스냅샷 파일들은 테스트 중 생성된 일회성 디버그 산출물이므로 커밋하지 않고 무시 처리만 함 (직전 커밋 `c2caa59`에서 shrimp-task-manager 산출물을 gitignore한 것과 동일한 패턴)

## 실행 순서
1. `git add components/google-auth-button.tsx app/auth/callback/route.ts components/login-form.tsx components/sign-up-form.tsx ".claude/plans/claude-agents-nextjs-supabase-fullstack-gentle-candle.md"` → 커밋 1
2. `git add ".claude/agents/nextjs-supabase-fullstack-developer.md"` → 커밋 2
3. `.gitignore`에 `.playwright-mcp/` 라인 추가 → `git add .gitignore` → 커밋 3 (`.playwright-mcp/` 내부 파일은 add하지 않음)

## 검증
- 각 커밋 후 `git status`로 의도한 파일만 스테이지/커밋되었는지 확인
- 커밋 3 이후 `git status`에 `.playwright-mcp/`가 더 이상 untracked로 나타나지 않는지 확인
- 커밋 메시지에 Claude 서명 추가하지 않음 (CLAUDE.md 규칙)
