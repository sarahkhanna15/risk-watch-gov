import { cn } from "@/lib/utils";
import type { RiskCategory } from "@/lib/projects";

export const riskStyles: Record<
  RiskCategory,
  { dot: string; text: string; chip: string; bar: string; ring: string; hex: string }
> = {
  Critical: {
    dot: "bg-critical",
    text: "text-critical",
    chip: "bg-critical-soft text-critical border-critical/25",
    bar: "bg-critical",
    ring: "border-critical/40",
    hex: "var(--critical)",
  },
  High: {
    dot: "bg-high",
    text: "text-high",
    chip: "bg-high-soft text-high border-high/25",
    bar: "bg-high",
    ring: "border-high/40",
    hex: "var(--high)",
  },
  Medium: {
    dot: "bg-medium",
    text: "text-medium",
    chip: "bg-medium-soft text-medium border-medium/30",
    bar: "bg-medium",
    ring: "border-medium/40",
    hex: "var(--medium)",
  },
  Low: {
    dot: "bg-low",
    text: "text-low",
    chip: "bg-low-soft text-low border-low/25",
    bar: "bg-low",
    ring: "border-low/40",
    hex: "var(--low)",
  },
};

export function RiskChip({ level, className }: { level: RiskCategory; className?: string }) {
  const s = riskStyles[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
        s.chip,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", s.dot)} />
      {level}
    </span>
  );
}

export function Panel({
  title,
  subtitle,
  children,
  className,
  action,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-surface shadow-panel",
        className,
      )}
    >
      {title && (
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
            {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
