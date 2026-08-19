import { Suspense } from "react";
import { notFound } from "next/navigation";

import { EventForm } from "@/components/event-form";
import { Skeleton } from "@/components/ui/skeleton";
import { getDummyEventById } from "@/lib/dummy-data";

// 더미 이벤트의 eventDate(ISO 문자열)를 datetime-local input이 요구하는
// 'YYYY-MM-DDTHH:mm' 형식(로컬 타임존 기준)으로 변환한다.
function toDatetimeLocal(isoDate: string): string {
  const date = new Date(isoDate);
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// params(동적 데이터)를 읽는 부분만 별도 컴포넌트로 분리해 <Suspense>로 감싼다.
// next.config.ts의 cacheComponents: true 하에서는 params/cookies/headers처럼
// 정적으로 결정되지 않는 데이터 접근이 반드시 Suspense 경계 안에서 이뤄져야 한다
// (docs/guides/nextjs-16.md의 "Cache Components" 절 참고).
async function EditEventContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = getDummyEventById(id);

  // 이벤트가 없거나 현재 로그인한 주최자(profile-1) 소유가 아니면 수정 폼을 노출하지 않는다.
  if (!event || event.createdBy !== "profile-1") {
    notFound();
  }

  return (
    <EventForm
      mode="edit"
      defaultValues={{
        title: event.title,
        location: event.location,
        eventDate: toDatetimeLocal(event.eventDate),
        description: event.description ?? "",
        coverImageUrl: event.coverImageUrl ?? "",
      }}
    />
  );
}

function EditEventFormSkeleton() {
  return (
    <div className="space-y-6 rounded-xl border p-6">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="p-4">
      <Suspense fallback={<EditEventFormSkeleton />}>
        <EditEventContent params={params} />
      </Suspense>
    </div>
  );
}
