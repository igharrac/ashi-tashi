import type { HTMLAttributes, ReactNode } from "react";

interface PillProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
  tone?: "mint" | "peach" | "sky";
}

const TONE_CLASSES: Record<NonNullable<PillProps["tone"]>, string> = {
  mint: "bg-mint-100 text-forest-700",
  peach: "bg-peach-100 text-clay-600",
  sky: "bg-sky-200 text-forest-700",
};

/** Ronde badge/pil, zoals de begroetingsbubbel en streak-teller in het ontwerp. */
export function Pill({ icon, tone = "mint", className = "", children, ...props }: PillProps) {
  return (
    <div
      {...props}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-1 text-sm font-bold tracking-wide
        ${TONE_CLASSES[tone]} ${className}`}
    >
      {icon && (
        <span aria-hidden="true" className="text-base leading-none">
          {icon}
        </span>
      )}
      {children}
    </div>
  );
}
