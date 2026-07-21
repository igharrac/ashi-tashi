"use client";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

/** Toegankelijke aan/uit-schakelaar (hfst. 30: begrijpelijke ouderinstellingen). */
export function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl2 border border-border-subtle bg-white px-4 py-3">
      <span className="flex flex-col text-left">
        <span className="font-semibold text-ink">{label}</span>
        {description && <span className="text-xs text-ink-muted">{description}</span>}
      </span>
      <span className="relative inline-flex h-8 w-14 shrink-0 items-center">
        <input
          type="checkbox"
          role="switch"
          aria-checked={checked}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className={`h-8 w-14 rounded-full transition-colors ${checked ? "bg-forest-500" : "bg-border-subtle"}
            peer-focus-visible:outline peer-focus-visible:outline-4 peer-focus-visible:outline-info-500`}
        />
        <span
          aria-hidden="true"
          className={`absolute left-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform
            ${checked ? "translate-x-6" : "translate-x-0"}`}
        />
      </span>
    </label>
  );
}
