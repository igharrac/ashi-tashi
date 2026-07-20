import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-primary-500 hover:bg-primary-600 text-white",
  secondary: "bg-white border-2 border-primary-500 text-primary-600 hover:bg-primary-50",
  ghost: "bg-transparent text-primary-600 hover:bg-primary-50",
};

/** Grote, toegankelijke knop — hfst. 9: grote touch targets, zichtbare focus. */
export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`min-h-[56px] min-w-[56px] rounded-xl2 px-6 py-3 text-lg font-semibold
        transition-colors focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500
        disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${className}`}
    />
  );
}
