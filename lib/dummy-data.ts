// Phase 2 UI 완성을 위한 더미 프로필/이벤트/참여자 데이터 및 조회 유틸리티
// Task 007~010에서 실제 Supabase 쿼리로 교체될 예정 — 조회 함수의 이름(get 접두사)과
// 반환 타입은 그대로 유지하고 내부 구현만 async로 바뀔 수 있도록 설계함

import { io } from "next/cache";

import type { Event, EventParticipant, EventStatus } from "@/lib/types/event";
import type {
  EventCardSummary,
  EventParticipantWithProfile,
  EventWithParticipants,
} from "@/lib/types/event-view";
import type { Profile } from "@/lib/types/profile";
import type {
  AdminDashboardMetrics,
  AdminEventRow,
  AdminUserRow,
  TimeSeriesPoint,
} from "@/lib/types/admin";

// 오늘 기준 상대 오프셋으로 ISO 문자열을 생성한다(절대 날짜 하드코딩 금지 — 시간이 지나도
// upcoming/ongoing/ended 분포가 유지되도록 함)
function daysFromNow(offsetDays: number, hour = 12): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

// eventDate의 날짜(연-월-일)만 오늘과 비교해 상태를 계산한다.
// 더미 데이터 생성 전용이며 Task 009의 실제 "이벤트 상태 자동 관리 로직"과는 별개이므로 export하지 않는다.
function resolveDummyStatus(eventDateIso: string): EventStatus {
  const eventDate = new Date(eventDateIso);
  const now = new Date();
  const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (eventDay.getTime() === today.getTime()) return "ongoing";
  return eventDay.getTime() > today.getTime() ? "upcoming" : "ended";
}

interface DummyEventSeed {
  id: string;
  offsetDays: number;
  hour: number;
  title: string;
  location: string;
  description: string | null;
  coverImageUrl: string | null;
  inviteCode: string;
  createdBy: string;
  participantProfileIds: string[];
}

const EVENT_SEEDS: DummyEventSeed[] = [
  {
    id: "event-1",
    offsetDays: -30,
    hour: 14,
    title: "2026 신년 모임",
    location: "강남 스터디카페",
    description: "새해를 맞아 다같이 모이는 신년 모임입니다.",
    coverImageUrl: "https://picsum.photos/seed/gather-event-1/800/450",
    inviteCode: "gthr01ab",
    createdBy: "profile-1",
    participantProfileIds: ["profile-2", "profile-3"],
  },
  {
    id: "event-2",
    offsetDays: -14,
    hour: 19,
    title: "사이드 프로젝트 킥오프",
    location: "홍대 카페 라운지",
    description: "새로운 사이드 프로젝트를 시작하는 킥오프 미팅입니다.",
    coverImageUrl: "https://picsum.photos/seed/gather-event-2/800/450",
    inviteCode: "gthr02cd",
    createdBy: "profile-2",
    participantProfileIds: ["profile-1", "profile-3", "profile-4", "profile-5", "profile-6"],
  },
  {
    id: "event-3",
    offsetDays: -5,
    hour: 11,
    title: "독서 모임 3월",
    location: "합정 북카페",
    description: null,
    coverImageUrl: null,
    inviteCode: "gthr03ef",
    createdBy: "profile-3",
    participantProfileIds: [],
  },
  {
    id: "event-4",
    offsetDays: -1,
    hour: 7,
    title: "동네 러닝 크루 정기모임",
    location: "한강공원 반포지구",
    description: "매주 함께 달리는 러닝 크루 정기모임입니다.",
    coverImageUrl: "https://picsum.photos/seed/gather-event-4/800/450",
    inviteCode: "gthr04gh",
    createdBy: "profile-4",
    participantProfileIds: ["profile-1", "profile-2", "profile-5", "profile-8"],
  },
  {
    id: "event-5",
    offsetDays: 0,
    hour: 9,
    title: "아침 요가 클래스",
    location: "성수동 요가스튜디오",
    description: "가볍게 몸을 깨우는 아침 요가 클래스입니다.",
    coverImageUrl: "https://picsum.photos/seed/gather-event-5/800/450",
    inviteCode: "gthr05ij",
    createdBy: "profile-5",
    participantProfileIds: ["profile-6", "profile-7"],
  },
  {
    id: "event-6",
    offsetDays: 0,
    hour: 19,
    title: "저녁 보드게임 모임",
    location: "이태원 보드게임카페",
    description: null,
    coverImageUrl: null,
    inviteCode: "gthr06kl",
    createdBy: "profile-6",
    participantProfileIds: [
      "profile-1",
      "profile-2",
      "profile-3",
      "profile-4",
      "profile-5",
      "profile-7",
      "profile-8",
    ],
  },
  {
    id: "event-7",
    offsetDays: 2,
    hour: 18,
    title: "생일 파티",
    location: "잠실 파티룸",
    description: "친구 생일을 축하하는 깜짝 파티입니다.",
    coverImageUrl: "https://picsum.photos/seed/gather-event-7/800/450",
    inviteCode: "gthr07mn",
    createdBy: "profile-7",
    participantProfileIds: ["profile-1"],
  },
  {
    id: "event-8",
    offsetDays: 7,
    hour: 8,
    title: "주말 등산 모임",
    location: "북한산 둘레길",
    description: "초보자도 환영하는 주말 등산 모임입니다.",
    coverImageUrl: "https://picsum.photos/seed/gather-event-8/800/450",
    inviteCode: "gthr08op",
    createdBy: "profile-1",
    participantProfileIds: [
      "profile-3",
      "profile-4",
      "profile-5",
      "profile-6",
      "profile-7",
      "profile-8",
    ],
  },
  {
    id: "event-9",
    offsetDays: 21,
    hour: 12,
    title: "봄맞이 피크닉",
    location: "여의도 한강공원",
    description: null,
    coverImageUrl: null,
    inviteCode: "gthr09qr",
    createdBy: "profile-2",
    participantProfileIds: ["profile-8"],
  },
  {
    id: "event-10",
    offsetDays: 60,
    hour: 10,
    title: "여름 워크숍",
    location: "강릉 리조트",
    description: "팀 전체가 참여하는 여름 워크숍입니다.",
    coverImageUrl: "https://picsum.photos/seed/gather-event-10/800/450",
    inviteCode: "gthr10st",
    createdBy: "profile-3",
    participantProfileIds: [
      "profile-1",
      "profile-2",
      "profile-4",
      "profile-5",
      "profile-6",
      "profile-7",
      "profile-8",
    ],
  },
];

export const DUMMY_PROFILES: Profile[] = [
  {
    id: "profile-1",
    email: "taeho.kim@example.com",
    username: "taeho_kim",
    fullName: "김태호",
    avatarUrl: "https://i.pravatar.cc/150?img=1",
    role: "user",
    createdAt: daysFromNow(-120, 9),
    updatedAt: daysFromNow(-120, 9),
  },
  {
    id: "profile-2",
    email: "minsoo99@example.com",
    username: "minsoo99",
    fullName: null,
    avatarUrl: "https://i.pravatar.cc/150?img=5",
    role: "user",
    createdAt: daysFromNow(-110, 9),
    updatedAt: daysFromNow(-110, 9),
  },
  {
    id: "profile-3",
    email: "sujin.lee@example.com",
    username: null,
    fullName: "이수진",
    avatarUrl: "https://i.pravatar.cc/150?img=12",
    role: "user",
    createdAt: daysFromNow(-100, 9),
    updatedAt: daysFromNow(-100, 9),
  },
  {
    id: "profile-4",
    email: "guest0421@example.com",
    username: null,
    fullName: null,
    avatarUrl: "https://i.pravatar.cc/150?img=20",
    role: "user",
    createdAt: daysFromNow(-90, 9),
    updatedAt: daysFromNow(-90, 9),
  },
  {
    id: "profile-5",
    email: "jihoon.park@example.com",
    username: "jihoon_p",
    fullName: "박지훈",
    avatarUrl: null,
    role: "user",
    createdAt: daysFromNow(-80, 9),
    updatedAt: daysFromNow(-80, 9),
  },
  {
    id: "profile-6",
    email: "yuri.choi@example.com",
    username: "yuri_choi",
    fullName: "최유리",
    avatarUrl: null,
    role: "user",
    createdAt: daysFromNow(-70, 9),
    updatedAt: daysFromNow(-70, 9),
  },
  {
    id: "profile-7",
    email: "mina.jung@example.com",
    username: "mina_j",
    fullName: "정민아",
    avatarUrl: null,
    role: "user",
    createdAt: daysFromNow(-60, 9),
    updatedAt: daysFromNow(-60, 9),
  },
  {
    id: "profile-8",
    email: "admin@example.com",
    username: "admin",
    fullName: "관리자",
    avatarUrl: "https://i.pravatar.cc/150?img=33",
    role: "admin",
    createdAt: daysFromNow(-200, 9),
    updatedAt: daysFromNow(-200, 9),
  },
];

export const DUMMY_EVENTS: Event[] = EVENT_SEEDS.map((seed) => {
  const eventDate = daysFromNow(seed.offsetDays, seed.hour);

  return {
    id: seed.id,
    title: seed.title,
    description: seed.description,
    location: seed.location,
    eventDate,
    coverImageUrl: seed.coverImageUrl,
    inviteCode: seed.inviteCode,
    status: resolveDummyStatus(eventDate),
    createdBy: seed.createdBy,
    createdAt: daysFromNow(seed.offsetDays - 10, 9),
    updatedAt: daysFromNow(seed.offsetDays - 10, 9),
  };
});

export const DUMMY_EVENT_PARTICIPANTS: EventParticipant[] = EVENT_SEEDS.flatMap((seed) => {
  const hostEntry: EventParticipant = {
    id: `${seed.id}-participant-${seed.createdBy}`,
    eventId: seed.id,
    userId: seed.createdBy,
    role: "host",
    joinedAt: daysFromNow(seed.offsetDays - 10, 9),
  };

  const participantEntries: EventParticipant[] = seed.participantProfileIds.map((profileId) => ({
    id: `${seed.id}-participant-${profileId}`,
    eventId: seed.id,
    userId: profileId,
    role: "participant",
    joinedAt: daysFromNow(seed.offsetDays - 1, 9),
  }));

  return [hostEntry, ...participantEntries];
});

export function getDummyProfileById(id: string): Profile | undefined {
  return DUMMY_PROFILES.find((profile) => profile.id === id);
}

export function getDummyEventById(id: string): Event | undefined {
  return DUMMY_EVENTS.find((event) => event.id === id);
}

export function getDummyEventByInviteCode(inviteCode: string): Event | undefined {
  return DUMMY_EVENTS.find((event) => event.inviteCode === inviteCode);
}

function countParticipants(eventId: string): number {
  return DUMMY_EVENT_PARTICIPANTS.filter((participant) => participant.eventId === eventId).length;
}

export function getDummyEventCardSummaries(): EventCardSummary[] {
  return DUMMY_EVENTS.map((event) => ({
    id: event.id,
    title: event.title,
    eventDate: event.eventDate,
    coverImageUrl: event.coverImageUrl,
    status: event.status,
    location: event.location,
    participantCount: countParticipants(event.id),
  }));
}

export function getDummyEventCardSummariesByRole(profileId: string): {
  hosted: EventCardSummary[];
  participated: EventCardSummary[];
} {
  const hostedEventIds = new Set(
    DUMMY_EVENT_PARTICIPANTS.filter(
      (participant) => participant.role === "host" && participant.userId === profileId,
    ).map((participant) => participant.eventId),
  );
  const participatedEventIds = new Set(
    DUMMY_EVENT_PARTICIPANTS.filter(
      (participant) => participant.role === "participant" && participant.userId === profileId,
    ).map((participant) => participant.eventId),
  );

  const summaries = getDummyEventCardSummaries();

  return {
    hosted: summaries.filter((event) => hostedEventIds.has(event.id)),
    participated: summaries.filter((event) => participatedEventIds.has(event.id)),
  };
}

export function getDummyParticipantsWithProfile(eventId: string): EventParticipantWithProfile[] {
  return DUMMY_EVENT_PARTICIPANTS.filter((participant) => participant.eventId === eventId).map(
    (participant) => {
      // EVENT_SEEDS의 모든 참여자 id는 DUMMY_PROFILES에서 온 것이므로 항상 존재함이 보장됨
      const profile = getDummyProfileById(participant.userId)!;

      return {
        id: participant.id,
        role: participant.role,
        joinedAt: participant.joinedAt,
        profile: {
          id: profile.id,
          username: profile.username,
          fullName: profile.fullName,
          avatarUrl: profile.avatarUrl,
        },
      };
    },
  );
}

export function getDummyEventWithParticipants(eventId: string): EventWithParticipants | undefined {
  const event = getDummyEventById(eventId);
  if (!event) return undefined;

  const participants = getDummyParticipantsWithProfile(eventId);

  return {
    ...event,
    participants,
    participantCount: participants.length,
  };
}

// 관리자 페이지(Task 006)용 뷰모델 조회 함수 — Task 011에서 실제 Supabase 집계 쿼리로
// 교체될 때까지 함수 이름과 반환 타입을 유지한다.

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameWeek(date: Date, reference: Date): boolean {
  const startOfWeek = new Date(reference);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(reference.getDate() - reference.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  return date >= startOfWeek && date < endOfWeek;
}

function isSameMonth(date: Date, reference: Date): boolean {
  return date.getFullYear() === reference.getFullYear() && date.getMonth() === reference.getMonth();
}

export function getDummyAdminEventRows(): AdminEventRow[] {
  return DUMMY_EVENTS.map((event) => {
    const host = getDummyProfileById(event.createdBy);
    const hostName = host?.fullName ?? host?.username ?? host?.email ?? "알 수 없음";

    return {
      id: event.id,
      title: event.title,
      location: event.location,
      eventDate: event.eventDate,
      status: event.status,
      createdAt: event.createdAt,
      hostName,
      participantCount: countParticipants(event.id),
    };
  });
}

export function getDummyAdminUserRows(): AdminUserRow[] {
  return DUMMY_PROFILES.map((profile) => {
    const hostedEventCount = DUMMY_EVENT_PARTICIPANTS.filter(
      (participant) => participant.role === "host" && participant.userId === profile.id,
    ).length;
    const participatedEventCount = DUMMY_EVENT_PARTICIPANTS.filter(
      (participant) => participant.role === "participant" && participant.userId === profile.id,
    ).length;

    return {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      createdAt: profile.createdAt,
      displayName: profile.fullName ?? profile.username ?? profile.email,
      hostedEventCount,
      participatedEventCount,
    };
  });
}

// todayEvents/weekEvents/monthEvents는 이벤트가 "열리는" 날짜(eventDate) 기준이며,
// "생성된" 날짜(createdAt) 기준 추이는 getDummyEventCreationTrend가 별도로 담당한다.
// new Date()로 매 호출마다 "지금"을 다시 읽으므로 next.config.ts의 cacheComponents 하에서
// 정적 프리렌더링 대상이 될 수 없다 — io()로 이 값을 정적 셸에서 제외한다고 명시한다
// (호출부인 app/admin/(dashboard)/dashboard/page.tsx는 Suspense로 감싸야 함).
export async function getDummyAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  await io();
  const now = new Date();

  const todayEvents = DUMMY_EVENTS.filter((event) =>
    isSameDay(new Date(event.eventDate), now),
  ).length;
  const weekEvents = DUMMY_EVENTS.filter((event) =>
    isSameWeek(new Date(event.eventDate), now),
  ).length;
  const monthEvents = DUMMY_EVENTS.filter((event) =>
    isSameMonth(new Date(event.eventDate), now),
  ).length;
  const totalEvents = DUMMY_EVENTS.length;

  // DUMMY_PROFILES의 createdAt이 전부 60일 이상 과거로 고정되어 있어 todayUsers/weekUsers는
  // 항상 0이 나올 수 있다 — 실제 시드 데이터를 정직하게 반영한 것이며 별도 보정하지 않는다.
  const todayUsers = DUMMY_PROFILES.filter((profile) =>
    isSameDay(new Date(profile.createdAt), now),
  ).length;
  const weekUsers = DUMMY_PROFILES.filter((profile) =>
    isSameWeek(new Date(profile.createdAt), now),
  ).length;
  const totalUsers = DUMMY_PROFILES.length;

  return { todayEvents, weekEvents, monthEvents, totalEvents, todayUsers, weekUsers, totalUsers };
}

export function getDummyEventCreationTrend(): TimeSeriesPoint[] {
  const counts = new Map<string, number>();

  for (const event of DUMMY_EVENTS) {
    const date = event.createdAt.slice(0, 10); // YYYY-MM-DD
    counts.set(date, (counts.get(date) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
