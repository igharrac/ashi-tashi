import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={`rounded-xl2 border border-primary-100 bg-white p-6 shadow-sm ${className}`}
    />
  );
}
