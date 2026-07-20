import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-forest-500 hover:bg-forest-600 text-white shadow-forest",
  secondary: "bg-white border-2 border-forest-500 text-forest-500 hover:bg-forest-50",
  ghost: "bg-transparent text-clay-500 hover:bg-mint-100/40",
};

/**
 * Grote, toegankelijke knop — hfst. 9: grote touch targets, zichtbare focus.
 * Volledig ronde vorm (pill) met gekleurde schaduw, conform de Ashi & Tashi
 * huisstijl (Figma/Stitch-ontwerp).
 */
export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`min-h-[56px] min-w-[56px] rounded-full px-8 py-3 text-lg font-semibold
        transition-colors focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500
        disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${className}`}
    />
  );
}
