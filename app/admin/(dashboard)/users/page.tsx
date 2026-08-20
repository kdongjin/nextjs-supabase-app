"use client";

// F014 관리자 사용자 관리 테이블 페이지
// 검색/역할 필터/페이지네이션은 전부 클라이언트 사이드로 동작(Phase 2 제약, 실제 API 없음)
// app/admin/(dashboard)/events/page.tsx(F013)와 동일한 구조·스타일·클래스 패턴을 그대로 따름.

import { useState } from "react";

import { DeleteUserDialog } from "@/components/delete-user-dialog";
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
import { getDummyAdminUserRows } from "@/lib/dummy-data";
import type { UserRole } from "@/lib/types/profile";

// 역할 필터 버튼 그룹 옵션 — events/page.tsx의 STATUS_FILTERS 패턴을 그대로 복제
type RoleFilter = "all" | UserRole;

const ROLE_FILTERS: { value: RoleFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "user", label: "일반 사용자" },
  { value: "admin", label: "관리자" },
];

// 역할 Badge variant/라벨 매핑 — Badge 컴포넌트에 그대로 전달
const ROLE_BADGE_VARIANT: Record<UserRole, "default" | "secondary"> = {
  admin: "default",
  user: "secondary",
};

const ROLE_LABEL: Record<UserRole, string> = {
  admin: "관리자",
  user: "일반 사용자",
};

const PAGE_SIZE = 5;

export default function AdminUsersPage() {
  const userRows = getDummyAdminUserRows();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [page, setPage] = useState(1);

  const filteredUsers = userRows.filter((user) => {
    const keyword = searchTerm.trim().toLowerCase();
    const matchesSearch =
      keyword === "" ||
      user.displayName.toLowerCase().includes(keyword) ||
      user.email.toLowerCase().includes(keyword);
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">사용자 관리</h1>

      {/* 검색 Input */}
      <Input
        placeholder="이름 또는 이메일로 검색"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setPage(1);
        }}
      />

      {/* 역할 필터 버튼 그룹 */}
      <div className="flex gap-2">
        {ROLE_FILTERS.map((item) => (
          <Button
            key={item.value}
            type="button"
            size="sm"
            variant={roleFilter === item.value ? "default" : "outline"}
            onClick={() => {
              setRoleFilter(item.value);
              setPage(1);
            }}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {/* 사용자 목록 테이블 */}
      {filteredUsers.length === 0 ? (
        <EmptyState
          title="조건에 맞는 사용자가 없어요"
          description="검색어나 역할 필터를 변경해보세요"
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>역할</TableHead>
                <TableHead>만든 이벤트 수</TableHead>
                <TableHead>참여한 이벤트 수</TableHead>
                <TableHead>가입일</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.displayName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={ROLE_BADGE_VARIANT[user.role]}>{ROLE_LABEL[user.role]}</Badge>
                  </TableCell>
                  <TableCell>{user.hostedEventCount}개</TableCell>
                  <TableCell>{user.participatedEventCount}개</TableCell>
                  <TableCell>{formatEventDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <DeleteUserDialog />
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
