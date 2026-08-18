import { cn } from "@/lib/utils";

export function MobileShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="min-h-screen w-full bg-muted/30">
      <div
        className={cn(
          "mx-auto flex min-h-screen w-full max-w-[500px] flex-col bg-background",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
