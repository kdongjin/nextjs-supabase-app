"use client";

import { useState } from "react";
import Link from "next/link";

import { EventCard } from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getDummyEventCardSummaries } from "@/lib/dummy-data";
import type { EventStatus } from "@/lib/types/event";

type StatusFilter = "all" | EventStatus;

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "upcoming", label: "예정" },
  { value: "ongoing", label: "진행중" },
  { value: "ended", label: "종료" },
];

export default function EventsPage() {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const events = getDummyEventCardSummaries();
  const filteredEvents =
    filter === "all" ? events : events.filter((event) => event.status === filter);

  return (
    <div className="space-y-4 p-4">
      <div className="flex gap-2">
        {FILTERS.map((item) => (
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
