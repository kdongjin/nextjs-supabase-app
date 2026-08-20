import { Suspense } from "react";
import { CalendarDays, ImageOff, MapPin, Users } from "lucide-react";
import { notFound } from "next/navigation";

import { JoinEventButton } from "@/components/join-event-button";
import { Skeleton } from "@/components/ui/skeleton";
import { MobileShell } from "@/components/mobile-shell";
import { formatEventDate } from "@/lib/date-utils";
import { getDummyEventByInviteCode, getDummyParticipantsWithProfile } from "@/lib/dummy-data";

// params(동적 데이터)를 읽는 부분만 별도 컴포넌트로 분리해 <Suspense>로 감싼다.
// next.config.ts의 cacheComponents: true 하에서 필요한 패턴(app/(main)/events/[id]/page.tsx와 동일).
async function JoinPageContent({ params }: { params: Promise<{ invite_code: string }> }) {
  const { invite_code } = await params;
  const event = getDummyEventByInviteCode(invite_code);

  if (!event) {
    notFound();
  }

  const participantCount = getDummyParticipantsWithProfile(event.id).length;

  return (
    <div className="space-y-6 p-4">
      <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-muted">
        {event.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- next/image 최적화는 Task 014 예정(event-card.tsx와 동일 사유)
          <img src={event.coverImageUrl} alt={event.title} className="h-full w-full object-cover" />
        ) : (
          <ImageOff className="h-8 w-8 text-muted-foreground" />
        )}
      </div>

      <div className="space-y-2">
        <h1 className="text-xl font-semibold">{event.title}</h1>
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
            <span>{participantCount}명 참여중</span>
          </div>
        </div>
      </div>

      <JoinEventButton eventTitle={event.title} />
    </div>
  );
}

function JoinSkeleton() {
  return (
    <div className="space-y-6 p-4">
      <Skeleton className="aspect-video w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full" />
      </div>
      <Skeleton className="h-9 w-full" />
    </div>
  );
}

export default function JoinPage({ params }: { params: Promise<{ invite_code: string }> }) {
  return (
    <MobileShell>
      <Suspense fallback={<JoinSkeleton />}>
        <JoinPageContent params={params} />
      </Suspense>
    </MobileShell>
  );
}
