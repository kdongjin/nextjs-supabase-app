import { Suspense } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getDummyAdminDashboardMetrics } from "@/lib/dummy-data";

// F012 관리자 대시보드 지표 카드에 표시할 라벨과 순서를 정의
// (todayEvents/weekEvents/monthEvents는 eventDate 기준 "진행되는" 이벤트 수이므로
// "생성된"이 아닌 "진행되는"으로 표기해야 함)
function buildMetricCards(metrics: Awaited<ReturnType<typeof getDummyAdminDashboardMetrics>>) {
  return [
    { label: "오늘 진행되는 이벤트", value: metrics.todayEvents },
    { label: "이번주 진행되는 이벤트", value: metrics.weekEvents },
    { label: "이번달 진행되는 이벤트", value: metrics.monthEvents },
    { label: "전체 이벤트", value: metrics.totalEvents },
    { label: "오늘 가입한 사용자", value: metrics.todayUsers },
    { label: "이번주 가입한 사용자", value: metrics.weekUsers },
    { label: "전체 사용자", value: metrics.totalUsers },
  ];
}

// getDummyAdminDashboardMetrics가 매 호출마다 new Date()를 읽어야 하는 부분만
// 별도 컴포넌트로 분리해 <Suspense>로 감싼다(join/[invite_code]/page.tsx와 동일한
// cacheComponents 대응 패턴 — io()가 정적 프리렌더링 중 이 컴포넌트를 제외시킨다).
async function DashboardMetricsContent() {
  const metrics = await getDummyAdminDashboardMetrics();
  const metricCards = buildMetricCards(metrics);

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {metricCards.map((metric) => (
        <Card key={metric.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{metric.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function DashboardMetricsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {Array.from({ length: 7 }, (_, i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* 페이지 제목 */}
      <h1 className="text-2xl font-bold tracking-tight">관리자 대시보드</h1>

      {/* 지표 카드 그리드: 모바일 2열, md 이상 4열 */}
      <Suspense fallback={<DashboardMetricsSkeleton />}>
        <DashboardMetricsContent />
      </Suspense>
    </div>
  );
}
