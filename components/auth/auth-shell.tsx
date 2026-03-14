import Link from "next/link";
import { ReactNode } from "react";

type AuthShellProps = {
  title: string;
  description: string;
  footerText: string;
  footerHref: string;
  footerLinkLabel: string;
  children: ReactNode;
};

export function AuthShell({
  title,
  description,
  footerText,
  footerHref,
  footerLinkLabel,
  children,
}: AuthShellProps) {
  return (
    <div className="page-shell">
      <div className="ambient-orbs">
        <span className="ambient-orb ambient-orb-sky left-[-4rem] top-20 h-48 w-48" />
        <span className="ambient-orb ambient-orb-teal right-[-5rem] top-10 h-56 w-56" />
        <span className="ambient-orb ambient-orb-amber bottom-10 right-1/4 h-36 w-36" />
      </div>
      <div className="page-frame flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="glass-panel grid w-full overflow-hidden rounded-[34px] lg:grid-cols-[1.08fr_0.92fr]">
          <div className="hidden bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_18rem),linear-gradient(145deg,#12324d_0%,#0b2d44_38%,#0f766e_100%)] p-10 text-slate-100 lg:flex lg:flex-col lg:justify-between">
            <div className="space-y-4">
              <span className="inline-flex rounded-full border border-white/15 bg-white/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-100">
                Cardiac Care AI
              </span>
              <div className="space-y-3">
                <h1 className="max-w-sm text-4xl font-semibold tracking-[-0.04em]">
                  Secure access with a cleaner clinical workflow.
                </h1>
                <p className="max-w-md text-sm leading-7 text-slate-200/90">
                  Sign in to review care workflows, capture patient context,
                  and keep the demo focused on the story instead of the tooling.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-[24px] border border-white/10 bg-white/6 p-5">
                <p className="mono-meta text-emerald-100/90">Demo advantage</p>
                <p className="mt-3 text-sm leading-6 text-slate-100/90">
                  Stronger hierarchy, calmer cards, and better form affordances
                  make the product feel more finished.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-[22px] border border-white/10 bg-white/6 p-4">
                  <p className="mono-meta text-sky-100">Access</p>
                  <p className="mt-2 text-lg font-semibold">Patient + Provider</p>
                </div>
                <div className="rounded-[22px] border border-white/10 bg-white/6 p-4">
                  <p className="mono-meta text-cyan-100">Stack</p>
                  <p className="mt-2 text-lg font-semibold">Next + Supabase</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel-strong flex items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-md space-y-8">
              <div className="space-y-2">
                <p className="eyebrow">Authentication</p>
                <h2 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">
                  {title}
                </h2>
                <p className="text-sm leading-7 text-slate-600">
                  {description}
                </p>
              </div>

              {children}

              <p className="text-sm text-slate-600">
                {footerText}{" "}
                <Link
                  href={footerHref}
                  className="font-semibold text-teal-700 transition hover:text-slate-950"
                >
                  {footerLinkLabel}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
