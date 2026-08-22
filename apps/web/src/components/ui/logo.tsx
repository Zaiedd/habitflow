import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-soft ring-1 ring-black/5",
        className,
      )}
    >
      <img
        src="/brand/logo-small.png"
        alt="HabitFlow logo"
        className="h-full w-full object-contain p-1"
        draggable={false}
      />
    </span>
  );
}

export function Logo({
  className,
  markClassName,
}: {
  className?: string;
  markClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <LogoMark className={markClassName} />
      <span className="font-display text-xl font-semibold tracking-tight text-foreground">
        HabitFlow
      </span>
    </span>
  );
}
