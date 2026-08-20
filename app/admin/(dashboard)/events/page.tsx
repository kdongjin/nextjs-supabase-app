"use client";

// F013 관리자 이벤트 관리 테이블 페이지
// 검색/상태 필터/페이지네이션은 전부 클라이언트 사이드로 동작(Phase 2 제약, 실제 API 없음)

import { useState } from "react";

import { DeleteEventDialog } from "@/components/event-share-actions";
import { EVENT_STATUS_BADGE_VARIANT, EVENT_STATUS_LABEL } from "@/components/event-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatEventDate } from "@/lib/date-utils";
import { getDummyAdminEventRows } from "@/lib/dummy-data";
import type { EventStatus } from "@/lib/types/event";

// 상태 필터 버튼 그룹 옵션 — app/(main)/events/page.tsx의 STATUS_FILTERS 패턴을 그대로 복제
type StatusFilter = "all" | EventStatus;

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "upcoming", label: "예정" },
  { value: "ongoing", label: "진행중" },
  { value: "ended", label: "종료" },
];

const PAGE_SIZE = 5;

export default function AdminEventsPage() {
  const eventRows = getDummyAdminEventRows();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);

  const filteredEvents = eventRows.filter((event) => {
    const keyword = searchTerm.trim().toLowerCase();
    const matchesSearch =
      keyword === "" ||
      event.title.toLowerCase().includes(keyword) ||
      event.location.toLowerCase().includes(keyword);
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">이벤트 관리</h1>

      {/* 검색 Input */}
      <Input
        placeholder="제목 또는 장소로 검색"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setPage(1);
        }}
      />

      {/* 상태 필터 버튼 그룹 */}
      <div className="flex gap-2">
        {STATUS_FILTERS.map((item) => (
          <Button
            key={item.value}
            type="button"
            size="sm"
            variant={statusFilter === item.value ? "default" : "outline"}
            onClick={() => {
              setStatusFilter(item.value);
              setPage(1);
            }}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {/* 이벤트 목록 테이블 */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          title="조건에 맞는 이벤트가 없어요"
          description="검색어나 상태 필터를 변경해보세요"
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>제목</TableHead>
                <TableHead>호스트</TableHead>
                <TableHead>장소</TableHead>
                <TableHead>일시</TableHead>
                <TableHead>참여자수</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>{event.hostName}</TableCell>
                  <TableCell>{event.location}</TableCell>
                  <TableCell>{formatEventDate(event.eventDate)}</TableCell>
                  <TableCell>{event.participantCount}명</TableCell>
                  <TableCell>
                    <Badge variant={EVENT_STATUS_BADGE_VARIANT[event.status]}>
                      {EVENT_STATUS_LABEL[event.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DeleteEventDialog />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* 페이지네이션 버튼 그룹 */}
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Button
                key={pageNum}
                type="button"
                size="sm"
                variant={currentPage === pageNum ? "default" : "outline"}
                onClick={() => setPage(pageNum)}
              >
                {pageNum}
              </Button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
