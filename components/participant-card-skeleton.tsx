import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface ParticipantCardSkeletonProps {
  className?: string;
}

export function ParticipantCardSkeleton({ className }: ParticipantCardSkeletonProps) {
  return (
    <Card className={cn("flex items-center gap-3 p-4", className)}>
      <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-5 w-14 rounded-md" />
    </Card>
  );
}
