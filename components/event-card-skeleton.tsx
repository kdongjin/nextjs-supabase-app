import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface EventCardSkeletonProps {
  className?: string;
}

export function EventCardSkeleton({ className }: EventCardSkeletonProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <Skeleton className="aspect-video w-full rounded-none" />
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-5 w-14 rounded-md" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </CardContent>
    </Card>
  );
}
