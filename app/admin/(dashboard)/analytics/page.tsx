import { AdminEventTrendChart } from "@/components/admin-event-trend-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDummyEventCreationTrend } from "@/lib/dummy-data";

// F015 관리자 통계 분석 페이지 - 더미 데이터를 서버에서 계산해 차트 컴포넌트에 그대로 전달한다.
export default function AdminAnalyticsPage() {
  const trend = getDummyEventCreationTrend();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">통계 분석</h1>

      <Card>
        <CardHeader>
          <CardTitle>일별 이벤트 생성 추이</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminEventTrendChart data={trend} />
        </CardContent>
      </Card>
    </div>
  );
}
