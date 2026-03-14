import { RiskAssessment, RiskLevel } from "@/lib/risk";

const riskBadgeStyles: Record<
  RiskLevel,
  {
    badge: string;
    score: string;
    label: string;
  }
> = {
  low: {
    badge: "border-emerald-200 bg-emerald-50/90 text-emerald-700",
    score: "bg-white text-emerald-700",
    label: "Low Risk",
  },
  medium: {
    badge: "border-amber-200 bg-amber-50/90 text-amber-700",
    score: "bg-white text-amber-700",
    label: "Medium Risk",
  },
  high: {
    badge: "border-rose-200 bg-rose-50/90 text-rose-700",
    score: "bg-white text-rose-700",
    label: "High Risk",
  },
  unknown: {
    badge: "border-slate-200 bg-slate-50/90 text-slate-600",
    score: "bg-white text-slate-700",
    label: "No Risk Data",
  },
};

type RiskBadgeProps = {
  risk: RiskAssessment;
};

export function RiskBadge({ risk }: RiskBadgeProps) {
  const styles = riskBadgeStyles[risk.level];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] shadow-sm ${styles.badge}`}
    >
      <span>{styles.label}</span>
      {risk.level !== "unknown" ? (
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-[0.08em] ${styles.score}`}
        >
          {risk.score}
        </span>
      ) : null}
    </span>
  );
}
