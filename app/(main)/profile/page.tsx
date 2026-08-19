import { LogoutButton } from "@/components/logout-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { formatEventDate } from "@/lib/date-utils";
import { getDummyProfileById } from "@/lib/dummy-data";

// participant-card.tsx의 getInitials와 동일한 로직 — 사용처가 2곳뿐이라 별도 유틸로
// 추출하지 않고 로컬로 둔다(project-structure.md의 조기 추상화 지양 컨벤션).
function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";

  const isKorean = /[가-힣]/.test(trimmed[0]);
  if (isKorean) return trimmed.slice(0, 1);

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return trimmed.slice(0, 2).toUpperCase();
}

export default function ProfilePage() {
  const profile = getDummyProfileById("profile-1")!; // 시드 데이터에 항상 존재
  const hasName = Boolean(profile.fullName ?? profile.username);
  const displayName = profile.fullName ?? profile.username ?? "이름 없음";

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardContent className="flex items-center gap-4 p-4">
          <Avatar size="lg">
            {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} alt={displayName} />}
            <AvatarFallback>{hasName ? getInitials(displayName) : "?"}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{displayName}</p>
            <p className="truncate text-sm text-muted-foreground">{profile.email}</p>
            <p className="text-xs text-muted-foreground">
              {formatEventDate(profile.createdAt)} 가입
            </p>
          </div>
        </CardContent>
      </Card>

      <LogoutButton />
    </div>
  );
}
