import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "link";

type ButtonSize = "sm" | "md" | "lg" | "icon";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-soft hover:bg-primary-hover active:scale-[0.98]",
  secondary:
    "border border-border bg-surface text-foreground shadow-soft hover:bg-muted active:scale-[0.98]",
  outline:
    "border border-border bg-transparent text-foreground hover:bg-muted active:scale-[0.98]",
  ghost: "text-foreground hover:bg-muted active:scale-[0.98]",
  danger: "bg-danger text-white shadow-soft hover:opacity-90 active:scale-[0.98]",
  link: "text-primary underline-offset-4 hover:underline",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 rounded-md px-3 text-xs gap-1.5",
  md: "h-10 rounded-lg px-4 text-sm gap-2",
  lg: "h-11 rounded-lg px-5 text-[15px] gap-2",
  icon: "h-9 w-9 rounded-lg",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex select-none items-center justify-center whitespace-nowrap font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = "Button";
