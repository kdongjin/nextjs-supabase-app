# 계획: 미커밋 변경사항을 논리 단위로 나눠 커밋

## Context

이번 대화에서 두 가지 작업을 했습니다: (1) 저장소 루트에 `CLAUDE.md`를 신규 작성, (2) `docs/` 아래 5개 가이드 문서(`project-structure.md`, `styling-guide.md`, `component-patterns.md`, `forms-react-hook-form.md`, `nextjs-16.md`)를 실제 코드 상태(루트 구조, Tailwind v3.4.1, react-hook-form/zod 미설치, `typedRoutes` 비활성, 존재하지 않는 npm 스크립트 등)에 맞게 수정.

`git status` 확인 결과 이 두 가지 외에도 이번 세션과 무관한 미추적/수정 항목이 더 있습니다: `.mcp.json`(수정, MCP 서버 5종 추가), `.claude/agents/`, `.claude/commands/`, `.claude/hooks/`(신규 Claude Code 설정), `shrimp_data/`(shrimp-task-manager MCP 데이터). 사용자에게 확인한 결과 이번 커밋에 전부 포함하기로 했습니다.

`/git:commit` 스킬 규칙상 원자적 커밋(단일 목적)과 관련 없는 변경사항 분할이 원칙이므로, 성격이 다른 변경들을 5개의 커밋으로 나눕니다. 각 커밋은 파일을 이름으로 명시해 스테이징하고(`git add -A` 금지), 이모지+컨벤셔널 커밋 포맷을 사용하며, Claude 서명은 추가하지 않습니다(스킬 명시 규칙).

## 커밋 계획 (아래 순서대로 5개 커밋 생성)

### 1. MCP 서버 설정 추가
- 대상: `.mcp.json`
- 내용: 기존 `supabase` 항목에 `playwright`, `context7`, `sequential-thinking`, `shadcn`, `shrimp-task-manager` 5개 MCP 서버 등록 추가
- 메시지: `🔧 chore: MCP 서버 5종 추가 등록 (playwright, context7, sequential-thinking, shadcn, shrimp-task-manager)`
- 참고: `shrimp-task-manager` 항목의 `DATA_DIR`이 `D:\claude\nextjs-supabase-app\shrimp_data` 절대경로로 하드코딩되어 있어 다른 개발 머신에서는 그대로 동작하지 않을 수 있음(사용자 확인 완료, 그대로 진행)

### 2. Claude Code 서브에이전트·커맨드·훅 추가
- 대상: `.claude/agents/`, `.claude/commands/`, `.claude/hooks/`
- 내용: dev/docs 서브에이전트 8개, git/docs 슬래시 커맨드 5개, notification/stop 훅 스크립트 2개
- 메시지: `🧑‍💻 dx: Claude Code 서브에이전트·슬래시 커맨드·훅 추가`

### 3. shrimp-task-manager 데이터 디렉터리 추가
- 대상: `shrimp_data/`
- 메시지: `🔧 chore: shrimp-task-manager 데이터 디렉터리 추가`

### 4. CLAUDE.md 신규 작성
- 대상: `CLAUDE.md`
- 내용: 개발 명령어, 환경 변수, 3-클라이언트 Supabase 인증 아키텍처, Next.js 16 설정 유의사항, docs/ 문서와 실제 코드 간 불일치 경고 등
- 메시지: `📝 docs: 저장소 가이드 CLAUDE.md 신규 작성`

### 5. docs/ 가이드 문서를 실제 코드에 맞게 수정
- 대상: `docs/project-structure.md`, `docs/styling-guide.md`, `docs/component-patterns.md`, `docs/forms-react-hook-form.md`, `docs/nextjs-16.md`
- 내용: `src/` 구조 → 실제 루트 구조, Tailwind v4 → v3.4.1, `tw-animate-css` → `tailwindcss-animate`, react-hook-form/zod/Server Actions 미설치·미사용 명시, `typedRoutes` 비활성 명시, 존재하지 않는 npm 스크립트(`typecheck`/`format:check`/`check-all`) 수정
- 메시지: `📝 docs: 프로젝트 가이드 문서를 실제 코드 상태에 맞게 수정`

## 실행 방법

각 커밋마다:
```bash
git add <해당 파일/디렉터리>
git commit -m "$(cat <<'EOF'
<위 메시지>
EOF
)"
```
(Claude 서명 없이, heredoc으로 메시지 전달)

## 검증

- 각 커밋 후 `git status`로 의도한 파일만 스테이징/커밋됐는지 확인
- 마지막에 `git log --oneline -6`으로 5개 커밋이 순서대로 쌓였는지 확인
- 최종적으로 `git status`가 깨끗한지(untracked/modified 없음) 확인
