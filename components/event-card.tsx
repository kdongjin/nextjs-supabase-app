import { CalendarDays, ImageOff, MapPin, Users } from "lucide-react";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEventDate } from "@/lib/date-utils";
import type { EventStatus } from "@/lib/types/event";
import type { EventCardSummary } from "@/lib/types/event-view";
import { cn } from "@/lib/utils";

export const EVENT_STATUS_LABEL: Record<EventStatus, string> = {
  upcoming: "예정",
  ongoing: "진행중",
  ended: "종료",
};

export const EVENT_STATUS_BADGE_VARIANT: Record<EventStatus, BadgeProps["variant"]> = {
  upcoming: "secondary",
  ongoing: "default",
  ended: "outline",
};

export interface EventCardProps {
  event: EventCardSummary;
  className?: string;
}

export function EventCard({ event, className }: EventCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="flex aspect-video w-full items-center justify-center bg-muted">
        {event.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- next/image 최적화는 Task 014에서 별도 도입 예정
          <img src={event.coverImageUrl} alt={event.title} className="h-full w-full object-cover" />
        ) : (
          <ImageOff className="h-8 w-8 text-muted-foreground" />
        )}
      </div>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <CardTitle className="line-clamp-1 text-base">{event.title}</CardTitle>
        <Badge variant={EVENT_STATUS_BADGE_VARIANT[event.status]}>
          {EVENT_STATUS_LABEL[event.status]}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-1.5 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4 shrink-0" />
          <span>{formatEventDate(event.eventDate)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="h-4 w-4 shrink-0" />
          <span>{event.participantCount}명 참여중</span>
        </div>
      </CardContent>
    </Card>
  );
}
