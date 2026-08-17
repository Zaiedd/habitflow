import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg shadow-soft",
        className,
      )}
    >
      <img
        src="/brand/logo.jpeg"
        alt="HabitFlow logo"
        className="h-full w-full object-cover"
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
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={markClassName} />
      <span className="font-display text-lg font-semibold tracking-tight text-foreground">
        HabitFlow
      </span>
    </span>
  );
}
