// 임시 프론트엔드 타입 — Task 007에서 실제 DB 스키마 타입으로 교체 예정
// DB 컬럼(snake_case)과 camelCase로 매핑됨, 추후 fetch 레이어에서 변환

export type UserRole = "user" | "admin";

// public.profiles 테이블에 대응하는 프론트엔드 도메인 타입
export interface Profile {
  id: string;
  email: string;
  username: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}
