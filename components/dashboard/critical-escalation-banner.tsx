import { EscalationBannerContent } from "@/lib/escalation";

type CriticalEscalationBannerProps = {
  escalation: EscalationBannerContent;
};

export function CriticalEscalationBanner({
  escalation,
}: CriticalEscalationBannerProps) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-rose-200 bg-[linear-gradient(135deg,rgba(255,241,242,0.96)_0%,rgba(255,255,255,0.94)_100%)] shadow-[0_24px_80px_-40px_rgba(190,24,93,0.35)]">
      <div className="border-b border-rose-200/80 px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-600">
              Escalation
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              {escalation.title}
            </h2>
          </div>
          <span className="inline-flex rounded-full bg-rose-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
            Immediate attention
          </span>
        </div>
      </div>

      <div className="grid gap-4 px-5 py-5 sm:px-6 lg:grid-cols-[1.2fr_0.8fr]">
        <p className="text-sm leading-7 text-slate-700">{escalation.message}</p>
        <div className="rounded-[22px] border border-rose-200/80 bg-white/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-600">
            Recommended next action
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {escalation.action}
          </p>
        </div>
      </div>
    </section>
  );
}
