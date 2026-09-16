import type { ComponentProps } from "react";

export function Section({ className = "", ...props }: ComponentProps<"section">) {
  return <section className={`py-20 sm:py-24 lg:py-28 ${className}`} {...props} />;
}

export function SectionHeader({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`max-w-2xl ${className}`} {...props} />;
}
