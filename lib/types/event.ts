// 임시 프론트엔드 타입 — Task 007에서 실제 DB 스키마 타입으로 교체 예정
// DB 컬럼(snake_case)과 camelCase로 매핑됨, 추후 fetch 레이어에서 변환

export type EventStatus = "upcoming" | "ongoing" | "ended";

export type ParticipantRole = "host" | "participant";

// public.events 테이블에 대응하는 프론트엔드 도메인 타입
export interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string;
  eventDate: string;
  coverImageUrl: string | null;
  inviteCode: string;
  status: EventStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// public.event_participants 테이블에 대응하는 프론트엔드 도메인 타입
export interface EventParticipant {
  id: string;
  eventId: string;
  userId: string;
  role: ParticipantRole;
  joinedAt: string;
}
