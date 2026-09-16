import type { ComponentProps } from "react";
import { Link } from "@/i18n/navigation";

const variants = {
  primary: "bg-primary text-primary-foreground shadow-sm hover:bg-[#1249b6]",
  secondary: "bg-navy text-white shadow-sm hover:bg-[#172a4e]",
  outline: "border border-[#b9c9dd] bg-transparent text-navy hover:border-primary hover:bg-surface-muted",
  ghost: "text-navy hover:bg-surface-muted",
} as const;

type ButtonVariant = keyof typeof variants;
type ButtonSize = "sm" | "md" | "lg";

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-10 px-4 py-2 text-sm",
  md: "min-h-11 px-5 py-2.5 text-sm",
  lg: "min-h-13 px-6 py-3 text-base",
};

type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  className = "",
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

export function ButtonLink({
  className = "",
  variant = "primary",
  size = "md",
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={`inline-flex items-center justify-center rounded-xl font-semibold transition-colors ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
