import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-soft",
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="h-4 w-4"
      >
        <path
          d="M12 3.5c3 3.2 5 6 5 8.7a5 5 0 0 1-10 0c0-2.7 2-5.5 5-8.7Z"
          fill="currentColor"
          fillOpacity="0.9"
        />
        <path
          d="M16.5 14.5 19 17l-2.5 2.5M7.5 14.5 5 17l2.5 2.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
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
