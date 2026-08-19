// 이벤트 생성/수정 폼(components/event-form.tsx)의 클라이언트 검증용 zod 스키마
// Phase 2(더미 데이터 단계)에서는 클라이언트 검증까지만 다루며, 서버 측 재검증은 Task 009에서 추가됨

import { z } from "zod";

export const eventFormSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요"),
  location: z.string().min(1, "장소를 입력해주세요"),
  eventDate: z.string().min(1, "날짜와 시간을 선택해주세요"),
  description: z.string().optional(),
  coverImageUrl: z.string().optional(),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;
