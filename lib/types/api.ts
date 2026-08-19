// Server Action 반환값 재사용을 위한 공통 API 결과 타입

// Server Action/API 라우트 공통 반환 타입 (판별 유니언)
export type ApiResult<T> = { success: true; data: T } | { success: false; error: string };
