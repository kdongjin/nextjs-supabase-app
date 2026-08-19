// event.ts와 profile.ts를 조합한 화면 전용 뷰모델 타입 모음
import type { Event } from "@/lib/types/event";
import type { Profile } from "@/lib/types/profile";

// F005: 이벤트 상세 페이지 실시간 참여자 목록용
export interface EventParticipantWithProfile {
  id: string;
  role: "host" | "participant";
  joinedAt: string;
  profile: Pick<Profile, "id" | "username" | "fullName" | "avatarUrl">;
}

// F001/F002/F003/F005/F006/F008/F009: 이벤트 상세 페이지 전체 데이터
export interface EventWithParticipants extends Event {
  participants: EventParticipantWithProfile[];
  participantCount: number;
}

// F007/F008: 내 이벤트 목록 카드는 Event 전체가 아니라 카드에 필요한 필드만 사용
export interface EventCardSummary extends Pick<
  Event,
  "id" | "title" | "eventDate" | "coverImageUrl" | "status" | "location"
> {
  participantCount: number;
}
