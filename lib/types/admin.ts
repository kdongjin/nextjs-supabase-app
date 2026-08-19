// 관리자 대시보드/테이블/통계 페이지(F012~F015)용 임시 프론트엔드 타입

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
