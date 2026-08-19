import { Suspense } from "react";
import { CalendarDays, ImageOff, MapPin, Users } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";

import { DeleteEventDialog, EventShareActions } from "@/components/event-share-actions";
import { EVENT_STATUS_BADGE_VARIANT, EVENT_STATUS_LABEL } from "@/components/event-card";
import { ParticipantCard } from "@/components/participant-card";
import { ParticipantCardSkeleton } from "@/components/participant-card-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatEventDate } from "@/lib/date-utils";
import { getDummyEventWithParticipants } from "@/lib/dummy-data";

// params(동적 데이터)를 읽는 부분만 별도 컴포넌트로 분리해 <Suspense>로 감싼다.
// next.config.ts의 cacheComponents: true 하에서 필요한 패턴(Task 004의 events/[id]/edit/page.tsx와 동일).
async function EventDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = getDummyEventWithParticipants(id);

  if (!event) {
    notFound();
  }

  const isHost = event.createdBy === "profile-1";

  return (
    <div className="space-y-6">
      <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-muted">
        {event.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- next/image 최적화는 Task 014 예정(event-card.tsx와 동일 사유)
          <img src={event.coverImageUrl} alt={event.title} className="h-full w-full object-cover" />
        ) : (
          <ImageOff className="h-8 w-8 text-muted-foreground" />
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-xl font-semibold">{event.title}</h1>
          <Badge variant={EVENT_STATUS_BADGE_VARIANT[event.status]}>
            {EVENT_STATUS_LABEL[event.status]}
          </Badge>
        </div>
        {event.description && <p className="text-sm text-muted-foreground">{event.description}</p>}
        <div className="space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 shrink-0" />
            <span>{formatEventDate(event.eventDate)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 shrink-0" />
            <span>{event.participantCount}명 참여중</span>
          </div>
        </div>
      </div>

      {isHost && (
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={`/events/${id}/edit`}>수정</Link>
          </Button>
          <DeleteEventDialog />
          <EventShareActions inviteCode={event.inviteCode} />
        </div>
      )}

      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">
          참여자 {event.participantCount}명
        </h2>
        {event.participants.length === 0 ? (
          <EmptyState
            title="아직 참여자가 없어요"
            description="초대 링크를 공유해 참여자를 모아보세요"
          />
        ) : (
          <div className="space-y-2">
            {event.participants.map((participant) => (
              <ParticipantCard key={participant.id} participant={participant} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EventDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="aspect-video w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full" />
      </div>
      <div className="space-y-2">
        <ParticipantCardSkeleton />
        <ParticipantCardSkeleton />
      </div>
    </div>
  );
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="p-4">
      <Suspense fallback={<EventDetailSkeleton />}>
        <EventDetailContent params={params} />
      </Suspense>
    </div>
  );
}
