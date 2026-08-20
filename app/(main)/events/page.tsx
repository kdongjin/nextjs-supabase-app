"use client";

import { useState } from "react";
import Link from "next/link";

import { EventCard } from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getDummyEventCardSummaries, getDummyEventCardSummariesByRole } from "@/lib/dummy-data";
import type { EventStatus } from "@/lib/types/event";

type StatusFilter = "all" | EventStatus;
type RoleFilter = "all" | "hosted" | "participated";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "upcoming", label: "예정" },
  { value: "ongoing", label: "진행중" },
  { value: "ended", label: "종료" },
];

const ROLE_FILTERS: { value: RoleFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "hosted", label: "내가 만든 이벤트" },
  { value: "participated", label: "내가 참여한 이벤트" },
];

export default function EventsPage() {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [filter, setFilter] = useState<StatusFilter>("all");

  const eventsByRole = getDummyEventCardSummariesByRole("profile-1");
  const events =
    roleFilter === "all"
      ? getDummyEventCardSummaries()
      : roleFilter === "hosted"
        ? eventsByRole.hosted
        : eventsByRole.participated;
  const filteredEvents =
    filter === "all" ? events : events.filter((event) => event.status === filter);

  return (
    <div className="space-y-4 p-4">
      <div className="flex gap-2">
        {ROLE_FILTERS.map((item) => (
          <Button
            key={item.value}
            type="button"
            size="sm"
            variant={roleFilter === item.value ? "default" : "outline"}
            onClick={() => setRoleFilter(item.value)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      <div className="flex gap-2">
        {STATUS_FILTERS.map((item) => (
          <Button
            key={item.value}
            type="button"
            size="sm"
            variant={filter === item.value ? "default" : "outline"}
            onClick={() => setFilter(item.value)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {filteredEvents.length === 0 ? (
        <EmptyState
          title="조건에 맞는 이벤트가 없어요"
          description="새 이벤트를 만들어 참여자를 초대해보세요"
          action={{ label: "이벤트 만들기", href: "/events/new" }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filteredEvents.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <EventCard event={event} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
