"use client";

// Recharts는 브라우저에서만 렌더링 가능하므로 반드시 Client Component로 구현한다.
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { TimeSeriesPoint } from "@/lib/types/admin";

export interface AdminEventTrendChartProps {
  data: TimeSeriesPoint[];
}

// F015 관리자 통계 분석 - 일별 이벤트 생성 추이 Line Chart
export function AdminEventTrendChart({ data }: AdminEventTrendChartProps) {
  return (
    // text-primary로 감싸 stroke="currentColor"가 브랜드 컬러(및 다크모드)를 따라가도록 함
    <div className="h-[300px] w-full text-primary">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} className="text-muted-foreground" />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} className="text-muted-foreground" />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="currentColor"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
