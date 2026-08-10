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
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
        className="h-5 w-5"
      >
        <path
          d="M24 9.5 C29.5 16 32.5 20 32.5 24.2 C32.5 28.7 28.7 32 24 32 C19.3 32 15.5 28.7 15.5 24.2 C15.5 20 18.5 16 24 9.5 Z"
          fill="currentColor"
          fillOpacity="0.96"
        />
        <path
          d="M19 26 L23.2 29.6 L29.8 20.8"
          stroke="#6366F1"
          strokeWidth="2.5"
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
