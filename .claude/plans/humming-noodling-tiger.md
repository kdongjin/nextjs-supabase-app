# 모임 이벤트 관리 웹 MVP — 구현 계획

## Context (배경)

수영/헬스/친구 모임 등에서 주최자는 공지, 참여자 관리, 카풀, 정산까지 혼자 떠맡는 경우가 많다. 이 부담을 덜기 위해 "모임 이벤트 관리" 기능을 이 저장소(Next.js 16 + Supabase 인증 스타터) 위에 실제로 구현한다.

조사 결과, 원격 Supabase 프로젝트(`pviqdmxduwvnjicsnypk`)에는 이미 `profiles` / `events` / `event_participants` 3개 테이블이 RLS·realtime까지 켜진 채로 존재한다(과거 세션에서 만들어졌으나 로컬 코드와 완전히 분리된 "고아 스키마" 상태). 반면 `app/`, `lib/`, `components/` 어디에도 이 테이블을 참조하는 코드는 0건이다. 즉 DB 설계는 이미 절반 진행되어 있고, 이번 작업은 (1) 카풀·정산·공지에 필요한 나머지 스키마를 채우고 (2) 그 위에 실제 화면과 쿼리를 붙이는 것이다.

**확정된 요구사항** (사용자 확인):
- 4개 기능(공지/참여자 관리/카풀/정산) 모두 MVP에 포함
- 정산은 금액 계산·기록만 (PG 결제 연동 없음)
- 주최자·참여자 모두 로그인 계정 필요
- `events`/`event_participants`는 로그인한 모든 사용자에게 공개(discovery 모델)를 그대로 유지 — 즉 `invite_code`는 강한 접근 통제가 아니라 "참여 신청 UX용 키"로 취급한다. 반면 공지·카풀·정산은 금액/연락 정보 등 민감도가 높으므로 **해당 이벤트 참여자만 조회 가능**하도록 새로 만드는 테이블에는 참여자 제한 RLS를 건다(이 비대칭은 의도된 설계).

## 실제 DB 현황 (execute_sql로 직접 검증 완료)

- `events_select_authenticated` / `event_participants_select_authenticated` 모두 `qual: true` (전체 공개) — 변경하지 않음(사용자 확정)
- **누락 확인됨**: 이벤트 생성 시 host를 `event_participants`에 자동으로 넣어주는 트리거가 없음 → 지금 상태로 모임을 만들면 주최자 본인이 참여자 목록에 안 나타남. 이번 마이그레이션에서 반드시 보강.
- **누락 확인됨**: `event_participants`에 host가 다른 사람을 내보내는 DELETE 정책이 없음(본인 탈퇴만 가능). "참여자 관리" 기능에 필수이므로 추가.
- `invite_code`에 자동 생성 트리거 없음(현재 NULL 허용) → 생성 트리거 추가 필요.
- 트리거는 `on_profiles_updated`(→`handle_updated_at`) 단 하나뿐. `events`에는 `updated_at` 컬럼은 있지만 갱신 트리거가 없음(선택 사항, 이번 스코프에서는 생략 가능).

## 신규 DB 스키마 (원격에 `mcp__supabase__apply_migration`으로 직접 적용)

기존 네이밍(`event_participants`)을 따라 전부 `event_` 접두사. RLS 반복 체크를 위해 SQL 헬퍼 함수 2개를 먼저 만든다.

```sql
create or replace function public.is_event_participant(p_event_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.event_participants
    where event_id = p_event_id and user_id = auth.uid());
$$;

create or replace function public.is_event_host(p_event_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.event_participants
    where event_id = p_event_id and user_id = auth.uid() and role = 'host');
$$;
```

**마이그레이션 적용 순서** (각각 독립된 `apply_migration` 호출, 적용 후 `get_advisors`로 security/performance 점검):

1. `create_event_rls_helper_functions` — 위 함수 2개
2. `add_event_host_auto_join_and_invite_code_triggers`
   - `events` INSERT 후 트리거로 `event_participants(event_id, user_id=created_by, role='host')` 자동 삽입
   - `invite_code`에 `BEFORE INSERT WHEN NEW.invite_code IS NULL` 트리거로 8자리 랜덤 문자열 채우기(`gen_random_uuid()` 기반, 별도 npm 패키지 불필요)
3. `add_event_participants_host_delete_policy` — `is_event_host(event_id)`인 사용자가 다른 참여자 행을 삭제할 수 있는 정책 추가
4. `create_event_announcements_table` — `event_announcements(id, event_id, author_id, title, content, is_pinned, created_at, updated_at)`. SELECT는 참여자만, INSERT/UPDATE/DELETE는 host만(`author_id = auth.uid()` 체크 포함)
5. `create_event_carpool_tables` — `event_carpool_offers`(운전자 등록: 출발지/시간/좌석수/상태) + `event_carpool_requests`(탑승 신청: 상태 pending/approved/rejected/cancelled, `unique(offer_id, passenger_id)`). SELECT는 참여자만, offer는 본인 또는 host만 수정/삭제, request는 승객 본인(생성/취소) 또는 운전자(승인/거절)만. 좌석 정원 초과를 막는 `BEFORE INSERT/UPDATE` 트리거(`check_carpool_capacity`) 포함
6. `create_event_settlement_tables` — `event_settlement_expenses`(지출 항목: title/amount/paid_by/created_by) + `event_settlement_shares`(항목별 참여자 분담금: share_amount/is_paid/paid_at/confirmed_by, `unique(expense_id, participant_id)`). SELECT는 참여자만, 쓰기(등록/납부 확인 토글)는 host만 — 참여자는 **조회 전용**(요구사항 "정산 확인"에 부합, 자기신고 납부는 Phase 2 이후 검토)

금액은 `integer`(KRW, 소수점 없음)로 저장. 균등분배 계산은 DB가 아니라 앱단(`lib/settlement.ts`)의 순수 함수에서 하고, 결과값(`share_amount`)을 명시적으로 insert한다(나머지 배분까지 정확히 맞추고 host가 이후 수동 조정 가능하게 하기 위함).

## 로컬-원격 동기화 방침

이 저장소는 원래부터 로컬 `supabase/migrations/` 없이 MCP로 원격에 직접 반영하는 방식(CLAUDE.md에 명시)이므로 그 컨벤션을 그대로 따른다:

1. 스키마 변경 직전 `mcp__supabase__list_tables`로 현재 구조 재확인
2. 위 6개 마이그레이션을 순서대로 `apply_migration`
3. 전체 적용 후 `mcp__supabase__generate_typescript_types` → `lib/supabase/database.types.ts`로 저장(신규 파일, 최초 도입). `lib/supabase/client.ts`/`server.ts`의 `createBrowserClient`/`createServerClient` 호출에 `<Database>` 제네릭 적용
4. `supabase db pull`로 기존 15건 히스토리를 로컬에 소급 구축하는 것은 이번 스코프 밖(별도 인프라 작업으로 분리)

## 라우트 구조 (App Router, `app/events/` 신규 트리)

`proxy.ts`가 `/`, `/auth/*` 제외 모든 경로를 이미 보호하므로 `/events/*`는 자동으로 로그인 필요. `app/protected/`는 스타터 튜토리얼 예시이므로 재사용하지 않고 독립적으로 구성.

```
app/events/
  layout.tsx                    # 공통 헤더 — app/protected/layout.tsx 구조 재사용(AuthButton, ThemeSwitcher)
  page.tsx                      # /events            내 모임 목록 (참여 중인 것 + discovery 모델이므로 전체 모임 둘러보기 탭도 가능)
  new/page.tsx                  # /events/new        모임 생성 폼
  join/page.tsx                 # /events/join?code= 초대코드로 참여
  [eventId]/
    layout.tsx                  # 참여자 여부 확인 + 탭 네비(개요/공지/참여자/카풀/정산)
    page.tsx                    # /events/[id]                개요 (host만 invite_code 노출)
    announcements/page.tsx      # /events/[id]/announcements  공지 목록 + 작성 Dialog(host)
    participants/page.tsx       # /events/[id]/participants   참여자 목록 + 강퇴(host)
    carpool/page.tsx            # /events/[id]/carpool        오퍼 목록 + 등록 Dialog
    carpool/[offerId]/page.tsx  # 신청자 승인/거절(운전자) / 신청(참여자)
    settlement/page.tsx         # /events/[id]/settlement     지출 목록 + 분담/납부 현황 + 등록 Dialog(host)
```

- 등록성 액션(공지/카풀/지출)은 별도 라우트 대신 shadcn `Dialog` 모달로 처리해 라우트 수 최소화. 상태 전이가 있는 카풀 신청만 `[offerId]` 전용 페이지로 분리.
- `next.config.ts`의 `cacheComponents: true` 대응: `app/protected/page.tsx`의 `UserDetails` 패턴처럼 Supabase 조회 부분은 별도 async 서브컴포넌트로 뽑아 `<Suspense>`로 감싼다.

## 핵심 사용자 플로우

**주최자**: 로그인 → `/events/new`로 모임 생성(트리거가 host 참여자 행·invite_code 자동 생성) → 공지 작성 → 참여자 확인/강퇴 → 카풀 등록 및 신청 승인/거절 → 지출 등록(참여자 선택 → `lib/settlement.ts` 균등분배 미리보기 → 저장) → 입금 확인되면 납부완료 토글

**참여자**: 회원가입/로그인(기존 auth 플로우 그대로) → `/events/join?code=`로 참여 → 공지 확인(읽기전용) → 카풀 오퍼 확인 후 탑승 신청 또는 본인 차량 등록 → 정산 항목별 본인 분담금·납부 여부 확인(읽기전용)

## 재사용할 기존 패턴 (신규 코드는 이 패턴을 그대로 모방)

- **폼**: `components/login-form.tsx` — Client Component + `useState` + `lib/supabase/client.ts`의 `createClient()` 직접 호출. Server Actions·react-hook-form·zod는 미설치 상태이므로 신규 도입하지 않음(`forms-react-hook-form.md`는 미적용 참고 문서이므로 따르지 않음)
- **서버 조회**: `lib/supabase/server.ts`의 `createClient()`(함수 내부에서 매번 생성, 전역 저장 금지)
- **레이아웃/Suspense**: `app/protected/layout.tsx`, `app/protected/page.tsx`의 `UserDetails` async 서브컴포넌트 패턴
- **에러 표시**: 인라인 `<p className="text-sm text-red-500">` (toast 라이브러리 미도입)
- **날짜**: 네이티브 `Intl`/`toLocaleDateString('ko-KR')` + `<Input type="datetime-local">` (date-fns 등 신규 의존성 없이 MVP 처리, 폴리싱 단계에서 캘린더 UI 검토)

## 신규 shadcn 컴포넌트

`npx shadcn@latest add dialog table tabs avatar textarea alert-dialog` (기존 `checkbox`/`badge`는 재사용)

## 신규 lib 파일

- `lib/settlement.ts` — `splitAmountEqually(amount, participantIds)` 등 정산 분배 순수 함수(DB 비의존)
- `lib/supabase/database.types.ts` — `generate_typescript_types` 결과물

## 구현 순서

1. **Phase 0 기반**: 6개 마이그레이션 적용 → 타입 생성/적용 → shadcn 컴포넌트 추가 → `app/events/layout.tsx`
2. **Phase 1 모임 생성·참여자 관리**: `/events`, `/events/new`, `/events/[id]`, `/events/join`, `/events/[id]/participants` — 이후 3개 기능의 전제조건이자 "참여자 여부 확인" 공통 로직 확립
3. **Phase 2 공지**: 가장 단순(테이블 1개) — 라우팅/RLS/Dialog 폼 패턴을 검증하는 파일럿
4. **Phase 3 카풀**: 테이블 2개, 승인 상태 전이 패턴 숙달
5. **Phase 4 정산**: 테이블 2개, 계산 로직이 가장 복잡 → 가장 마지막·가장 신중하게
6. **Phase 5 폴리싱**: 빈 상태/로딩 스켈레톤, `get_advisors` 재점검, 반응형/다크모드, `npm run type-check`/`lint`/`build` 전수 확인

## 검증 방법

- 각 마이그레이션 적용 직후 `mcp__supabase__get_advisors`(security + performance)로 RLS 누락·initplan 이슈 확인
- Phase별 완료 시 `npm run dev`로 실제 브라우저에서 골든 패스 확인: 모임 생성 → 참여 → 공지 확인 → 카풀 신청/승인 → 지출 등록/분담 확인
- `npm run type-check`, `npm run lint`로 타입·린트 통과 확인(테스트 러너 없음)
- RLS 검증: 참여하지 않은 이벤트의 공지/카풀/정산 데이터가 다른 계정으로 조회되지 않는지 두 번째 테스트 계정으로 교차 확인
