import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ParticipantRole } from "@/lib/types/event";
import type { EventParticipantWithProfile } from "@/lib/types/event-view";
import { cn } from "@/lib/utils";

export const PARTICIPANT_ROLE_LABEL: Record<ParticipantRole, string> = {
  host: "호스트",
  participant: "참여자",
};

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";

  const isKorean = /[가-힣]/.test(trimmed[0]);
  if (isKorean) return trimmed.slice(0, 1);

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return trimmed.slice(0, 2).toUpperCase();
}

export interface ParticipantCardProps {
  participant: EventParticipantWithProfile;
  className?: string;
}

export function ParticipantCard({ participant, className }: ParticipantCardProps) {
  const { profile } = participant;
  const hasName = Boolean(profile.fullName ?? profile.username);
  const displayName = profile.fullName ?? profile.username ?? "이름 없음";

  return (
    <Card className={cn("flex items-center gap-3 p-4", className)}>
      <Avatar>
        {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} alt={displayName} />}
        <AvatarFallback>{hasName ? getInitials(displayName) : "?"}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{displayName}</p>
        {profile.username && (
          <p className="truncate text-xs text-muted-foreground">@{profile.username}</p>
        )}
      </div>
      <Badge variant={participant.role === "host" ? "default" : "secondary"}>
        {PARTICIPANT_ROLE_LABEL[participant.role]}
      </Badge>
    </Card>
  );
}
