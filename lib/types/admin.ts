// 관리자 대시보드/테이블/통계 페이지(F012~F015)용 임시 프론트엔드 타입

import type { Event } from "@/lib/types/event";
import type { Profile } from "@/lib/types/profile";

// F013 관리자 이벤트 관리 테이블 행 뷰모델 타입
export interface AdminEventRow extends Pick<
  Event,
  "id" | "title" | "location" | "eventDate" | "status" | "createdAt"
> {
  hostName: string;
  participantCount: number;
}

// F014 관리자 사용자 관리 테이블 행 뷰모델 타입
export interface AdminUserRow extends Pick<Profile, "id" | "email" | "role" | "createdAt"> {
  displayName: string;
  hostedEventCount: number;
  participatedEventCount: number;
}

// F012 관리자 대시보드 지표 카드용 타입
export interface AdminDashboardMetrics {
  todayEvents: number;
  weekEvents: number;
  monthEvents: number;
  totalEvents: number;
  todayUsers: number;
  weekUsers: number;
  totalUsers: number;
}

// F013/F014 관리자 테이블 페이지네이션 공통 응답 타입
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// F013/F014 관리자 테이블 검색/정렬 공통 요청 파라미터 타입
export interface TableQueryParams {
  search?: string;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// F015 통계 분석 Recharts Line Chart 입력 데이터 포인트 타입
export interface TimeSeriesPoint {
  date: string;
  value: number;
}
