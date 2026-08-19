# Task 003: 공통 컴포넌트 라이브러리 구현

## Context

Gather 프로젝트는 "구조 우선 접근법"(ROADMAP.md 주의사항)에 따라 Phase 1(라우팅/타입 골격)을 완료하고 Phase 2(더미 데이터 기반 UI 완성)에 진입했다. Task 001에서 13개 페이지가 빈 껍데기로 생성되었고, Task 002에서 `lib/types/`에 Event/Profile/뷰모델 타입이 확정되었다. Task 003의 목적은 이 타입들을 실제로 사용하는 **재사용 가능한 UI 컴포넌트**와 **더미 데이터 유틸리티**를 먼저 완성해, 이후 Task 004(주최자 UI)·005(참여자 UI)·006(관리자 UI)가 페이지를 조립하는 작업에만 집중할 수 있게 하는 것이다. ROADMAP의 "공통 컴포넌트 우선 개발" 원칙을 따른다.

**스코프 조정(사용자 확인 완료)**: ROADMAP 원문은 shadcn `Form` 컴포넌트 설치를 Task 003에 포함하지만, `Form`은 `react-hook-form`/`zod`에 의존하고 이 라이브러리들은 `CLAUDE.md`에 미설치로 명시되어 있으며 ROADMAP Task 004에서 설치가 예정되어 있다. 사용자는 `Form` 설치를 Task 004로 미루기로 결정했다 — Task 003은 폼 없이 표시(display) 위주 컴포넌트에 집중한다. 또한 ROADMAP의 "Toast"는 최신 shadcn 레지스트리 기준 `sonner`로 설치한다(legacy `toast`는 대체됨).

## 구현 사항

### 1. shadcn/ui 컴포넌트 설치

```bash
npx shadcn@latest add avatar
npx shadcn@latest add dialog
npx shadcn@latest add select
npx shadcn@latest add skeleton
npx shadcn@latest add sonner
```

- 순차 실행(CLI 동시 실행 시 충돌 가능). `components.json`(style: new-york, baseColor: neutral) 설정을 그대로 따라 `components/ui/`에 생성됨
- `form`은 제외(Task 004로 이관). `separator`는 이번 컴포넌트들에 실질적으로 불필요해 스킵

**`app/layout.tsx`에 Toaster 배선** (sonner는 설치만으로 동작 안 함, `<Toaster />`를 루트에 마운트해야 함):

```tsx
import { Toaster } from "@/components/ui/sonner";
// ...
<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
  {children}
  <Toaster />
</ThemeProvider>
```

현재 `app/layout.tsx` 구조(1~41행)를 확인했으며 `{children}` 위치가 위 예시와 정확히 일치하므로 그 바로 다음 줄에 `<Toaster />`만 추가하면 된다.

### 2. `lib/date-utils.ts` (신규)

`lib/utils.ts`(cn 전용)에 섞지 않고, project-structure.md가 예시로 든 "특화 유틸리티는 새 파일로" 패턴을 따른다.

```typescript
export function formatEventDate(isoDate: string): string
```
- `Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", weekday: "short", hour: "2-digit", minute: "2-digit" })` 사용, 예: `2026.08.25 (화) 15:00`
- `new Date(isoDate)`가 Invalid Date면 원본 문자열 그대로 반환(최소 방어 코드)
- Task 004/005 이벤트 상세 페이지에서도 재사용될 범용 함수로 설계

### 3. `lib/dummy-data.ts` (신규)

`lib/types/event.ts`, `profile.ts`, `event-view.ts`의 실제 타입을 그대로 import해서 사용(재정의 금지).

**Seed 배열**:
- `DUMMY_PROFILES: Profile[]` — 8명. role 7×`user`/1×`admin`. `fullName`/`username`/`avatarUrl`의 null 조합을 의도적으로 다양화(전부 채움 / fullName만 null / username만 null / 둘다 null / avatarUrl null 3명)해 카드 컴포넌트의 폴백 로직을 검증 가능하게 함. `avatarUrl`은 `https://i.pravatar.cc/150?img=N` 고정 시드 사용
- `DUMMY_EVENTS: Event[]` — 10개. `eventDate`는 `daysFromNow(offsetDays)` 헬퍼(내부 비export)로 **오늘 기준 상대 오프셋** 생성(절대 날짜 하드코딩 금지 — 시간이 지나도 upcoming/ongoing/ended 분포 유지). offset 분포: ended 4개(-30,-14,-5,-1), ongoing 2개(0,0 다른 시간대), upcoming 4개(+2,+7,+21,+60). `status`는 반드시 `eventDate`로부터 계산하는 내부 헬퍼로 대입(수동 오타로 date/status 불일치 방지). `coverImageUrl`은 7개 `https://picsum.photos/seed/gather-event-N/800/450`, 3개 `null`(플레이스홀더 UI 검증용). `inviteCode`는 고정 문자열(즉석 `Math.random()` 금지 — SSR/CSR 하이드레이션 불일치 방지)
- `DUMMY_EVENT_PARTICIPANTS: EventParticipant[]` — 이벤트마다 host 1명 + participant 0~8명, 이벤트별 참여자 수를 다양하게(1명~9명) 분포

**조회 함수** (모두 `get` 접두사로 통일 — 추후 Task 007~010에서 Supabase 비동기 fetch로 교체 시 호출부 diff 최소화):
```typescript
export function getDummyProfileById(id: string): Profile | undefined
export function getDummyEventById(id: string): Event | undefined
export function getDummyEventCardSummaries(): EventCardSummary[]
export function getDummyParticipantsWithProfile(eventId: string): EventParticipantWithProfile[]
export function getDummyEventWithParticipants(eventId: string): EventWithParticipants | undefined
```
"내가 만든/참여한 이벤트" 필터링 헬퍼 등은 지금 선제 구현하지 않고 Task 004/005에서 실제 필요 시점에 이 파일에 추가한다(YAGNI).

### 4. `components/event-card.tsx` (신규, top-level flat)

`EventCardSummary`를 props로 받는 순수 표시 컴포넌트(`"use client"` 불필요 — 상태/훅 없음).

```typescript
export const EVENT_STATUS_LABEL: Record<EventStatus, string>          // upcoming/ongoing/ended → "예정"/"진행중"/"종료"
export const EVENT_STATUS_BADGE_VARIANT: Record<EventStatus, BadgeProps["variant"]>  // → secondary/default/outline
export interface EventCardProps { event: EventCardSummary; className?: string }
export function EventCard({ event, className }: EventCardProps)
```

구조: `Card`(`overflow-hidden`) → 커버 이미지 영역(`aspect-video`, `coverImageUrl` 없으면 `bg-muted` + lucide `ImageOff` 플레이스홀더, `next/image` 대신 plain `<img>` 사용 — `next.config.ts`에 `images.remotePatterns` 미설정이고 이미지 최적화는 Task 014 별도 작업) → `CardHeader`(제목 + 상태 Badge) → `CardContent`(MapPin+location, CalendarDays+`formatEventDate`, Users+participantCount, 각각 lucide 아이콘). 라우팅은 이 컴포넌트가 하지 않고 호출부(Task 004/005)에서 `<Link>`로 감싼다.

### 5. `components/participant-card.tsx` (신규, top-level flat)

`EventParticipantWithProfile`을 props로 받는 순수 표시 컴포넌트.

```typescript
export const PARTICIPANT_ROLE_LABEL: Record<ParticipantRole, string>  // host/participant → "호스트"/"참여자"
export interface ParticipantCardProps { participant: EventParticipantWithProfile; className?: string }
export function ParticipantCard({ participant, className }: ParticipantCardProps)
```

구조: `Card`(compact row, `flex items-center gap-3 p-4`) → `Avatar`(`AvatarImage` + `AvatarFallback`에 initials) → 이름 영역(`displayName = fullName ?? username ?? "이름 없음"`, username 있으면 `@username` 보조 텍스트) → role Badge. `getInitials()`는 파일 로컬 비export 헬퍼.

### 6. 로딩 스켈레톤 — `components/event-card-skeleton.tsx`, `components/participant-card-skeleton.tsx` (신규, top-level)

`components/ui/skeleton.tsx`(shadcn 설치분, `Skeleton` 프리미티브)를 조합. **`components/ui/`가 아닌 top-level에 배치**하는 이유: 레이아웃이 각 카드의 실제 구조(이미지 비율, 뱃지 위치, 아바타 크기)에 1:1로 종속돼 범용 프리미티브가 아니며, 실제 카드와 나란히 두어야 유지보수가 쉽다.

- `EventCardSkeleton`: EventCard와 동일한 outer shape(Card + aspect-video 자리 + 제목/뱃지 자리 + 3줄 텍스트 자리)
- `ParticipantCardSkeleton`: ParticipantCard와 동일한 outer shape(원형 아바타 + 텍스트 2줄 + 뱃지 자리)
- 두 컴포넌트 모두 반복 렌더링(개수, grid)은 소유하지 않음 — 호출 페이지가 `Array.from({length:6}).map(...)`으로 배치

### 7. `components/ui/empty-state.tsx` (신규, 순수 UI)

도메인 타입에 의존하지 않는 완전 범용 컴포넌트라 `components/ui/`에 배치(project-structure.md의 "커스텀 UI 컴포넌트는 `components/ui/`에" 규칙).

```typescript
export interface EmptyStateAction { label: string; href?: string; onClick?: () => void }
export interface EmptyStateProps { icon?: LucideIcon; title: string; description?: string; action?: EmptyStateAction; className?: string }
export function EmptyState({ icon: Icon = Inbox, title, description, action, className }: EmptyStateProps)
```

`action.href`가 있으면 `Button asChild + Link`, 없고 `onClick`만 있으면 일반 `Button onClick`. 아이콘 + 제목 + 설명 + 선택적 액션 버튼을 세로 중앙 정렬로 표시. `"use client"` 필요(onClick 핸들러).

## 구현 순서

1. shadcn 5종 설치 → 2. `layout.tsx`에 `<Toaster />` 배선 → 3. `lib/date-utils.ts` → 4. `lib/dummy-data.ts` → 5. `event-card.tsx` → 6. `participant-card.tsx` → 7. 스켈레톤 2종 → 8. `empty-state.tsx`

각 단계 완료 후 ROADMAP 워크플로우(`## 작업 생성`~`## 작업 구현`)에 따라 진행 상황을 공유하고 필요 시 중단 지점을 둔다.

## 관련 파일

- `lib/types/event.ts`, `lib/types/profile.ts`, `lib/types/event-view.ts` — 재사용할 기존 타입(수정 없음)
- `lib/date-utils.ts` (신규)
- `lib/dummy-data.ts` (신규)
- `components/event-card.tsx`, `components/event-card-skeleton.tsx` (신규)
- `components/participant-card.tsx`, `components/participant-card-skeleton.tsx` (신규)
- `components/ui/empty-state.tsx` (신규)
- `components/ui/avatar.tsx`, `dialog.tsx`, `select.tsx`, `skeleton.tsx`, `sonner.tsx` (shadcn CLI 자동 생성)
- `app/layout.tsx` (Toaster 배선 1줄 추가)
- `components/ui/card.tsx`, `badge.tsx` — 기존 표준 shadcn 구조, 커스텀 변형 없이 그대로 재사용

## 수락 기준

- shadcn avatar/dialog/select/skeleton/sonner가 `components/ui/`에 설치되고 `package.json`에 대응 의존성이 추가됨
- `EventCard`가 `coverImageUrl: null` 포함 모든 필드 조합에서 오류 없이 렌더링되고, upcoming/ongoing/ended 3상태의 배지 variant/라벨이 서로 다르게 표시됨
- `ParticipantCard`가 avatarUrl·fullName·username 유무의 모든 조합에서 깨지지 않고 폴백(이니셜, "이름 없음")을 표시함
- `getDummyEventCardSummaries()`가 upcoming/ongoing/ended를 각각 1개 이상 포함하고 participantCount가 이벤트마다 다름
- `EmptyState`가 액션 없음 / `href` 액션 / `onClick` 액션 세 경우 모두 정상 렌더링
- `npm run type-check`, `npm run lint`, `npm run build` 모두 통과

## 검증 방법

이 Task는 아직 어떤 `app/` 페이지에도 컴포넌트를 배선하지 않으므로(페이지 조립은 Task 004/005 몫), 정적 검증 위주로 확인한다:

1. `npm run type-check` — 새 컴포넌트/유틸리티의 타입 오류 없음 확인
2. `npm run lint` — ESLint 통과 확인(export된 컴포넌트/함수는 `no-unused-vars` 대상 아님)
3. `npm run build` — 프로덕션 빌드 성공 확인
4. 임시 검증(선택): 아무 페이지(예: `app/(main)/events/page.tsx`)에 `EventCard`/`ParticipantCard`/`EmptyState`/스켈레톤을 더미 데이터와 함께 잠시 렌더링해 브라우저에서 시각 확인 후 되돌리거나, 그대로 두고 Task 004에서 이어받아도 됨 — 필수는 아니지만 카드 레이아웃이 의도대로 나오는지 빠르게 확인 가능
