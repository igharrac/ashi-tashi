import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={`rounded-xl3 border-4 border-mint-200/30 bg-cream-card p-6 shadow-soft ${className}`}
    />
  );
}
