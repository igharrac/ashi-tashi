interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = total === 0 ? 0 : Math.min(100, Math.round((current / total) * 100));
  return (
    <div
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Voortgang: ${current} van ${total}`}
      className="h-4 w-full overflow-hidden rounded-full bg-primary-100"
    >
      <div
        className="h-full rounded-full bg-success-500 transition-all motion-reduce:transition-none"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
