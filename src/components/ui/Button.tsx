import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "sm";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** "md" (standaard, hfst. 9 grote touch targets) of "sm" voor compacte UI zoals de opnamestudio. */
  size?: Size;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-forest-500 hover:bg-forest-600 text-white shadow-forest",
  secondary: "bg-white border-2 border-forest-500 text-forest-500 hover:bg-forest-50",
  ghost: "bg-transparent text-clay-500 hover:bg-mint-100/40",
};

// Losse map i.p.v. altijd de grote maat in de basisstring zetten — zo kan
// className een maat nooit per ongeluk half overschrijven (Tailwind-cascade
// bepaalt winnaar op stylesheet-volgorde, niet op class-attribuutvolgorde).
const SIZE_CLASSES: Record<Size, string> = {
  md: "min-h-[56px] min-w-[56px] rounded-full px-8 py-3 text-lg",
  sm: "min-h-[36px] min-w-[36px] rounded-full px-4 py-1 text-sm",
};

/**
 * Toegankelijke knop — hfst. 9: grote touch targets, zichtbare focus.
 * Volledig ronde vorm (pill) met gekleurde schaduw, conform de Ashi & Tashi
 * huisstijl (Figma/Stitch-ontwerp).
 */
export function Button({ variant = "primary", size = "md", className = "", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`font-semibold transition-colors focus-visible:outline focus-visible:outline-4
        focus-visible:outline-info-500 disabled:cursor-not-allowed disabled:opacity-50
        ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} ${className}`}
    />
  );
}
