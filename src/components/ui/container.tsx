import type { ComponentProps } from "react";

export function Container({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`mx-auto w-full max-w-[76rem] px-5 sm:px-8 ${className}`} {...props} />;
}

export function NarrowContainer({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`mx-auto w-full max-w-3xl px-5 sm:px-8 ${className}`} {...props} />;
}
