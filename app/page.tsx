import Link from "next/link";

export default function Home() {
  return (
    <main className="page-shell">
      <div className="ambient-orbs">
        <div className="ambient-grid absolute inset-x-0 top-0 h-64 opacity-60" />
        <span className="ambient-orb ambient-orb-teal left-[-5rem] top-10 h-52 w-52" />
        <span className="ambient-orb ambient-orb-sky right-[-3rem] top-28 h-48 w-48" />
        <span className="ambient-orb ambient-orb-amber bottom-10 left-1/3 h-40 w-40" />
      </div>
      <div className="page-frame flex min-h-[calc(100vh-4rem)] items-center">
        <div className="glass-panel grid w-full gap-6 overflow-hidden rounded-[34px] p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-12">
          <div className="relative overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_top_left,rgba(13,148,136,0.18),transparent_18rem),linear-gradient(135deg,#ffffff_0%,#f4faf8_55%,#eef7f6_100%)] p-8 sm:p-10">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
            <div className="space-y-7">
              <span className="eyebrow inline-flex rounded-full border border-emerald-200/70 bg-white/80 px-3 py-1">
                Cardiac Care AI
              </span>
              <div className="space-y-4">
                <h1 className="headline max-w-3xl">
                  A sharper, calmer cardiac monitoring workspace for patients
                  and care teams.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-slate-600">
                  Secure sign-in, vitals capture, alerting, and care tracking in
                  one modern App Router experience backed by Supabase.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="kpi-card">
                  <p className="mono-meta text-emerald-700">Vitals</p>
                  <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                    Fast capture
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Add readings quickly without breaking demo flow.
                  </p>
                </div>
                <div className="kpi-card">
                  <p className="mono-meta text-sky-700">Alerts</p>
                  <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                    Risk visibility
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Surface high-priority signals for review instantly.
                  </p>
                </div>
                <div className="kpi-card">
                  <p className="mono-meta text-cyan-700">Care</p>
                  <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                    One dashboard
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Keep medications, plans, and vitals in one place.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/login" className="primary-btn">
                  Go to login
                </Link>
                <Link href="/signup" className="secondary-btn">
                  Create account
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="glass-panel-strong rounded-[28px] p-6 sm:p-8">
              <p className="mono-meta text-slate-500">Included</p>
              <div className="mt-5 space-y-4">
                <div className="rounded-[22px] border border-emerald-100 bg-emerald-50/70 p-5">
                  <h2 className="text-lg font-semibold tracking-tight text-slate-950">
                    Guided signup
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Full name, email, password, and role flow into Supabase auth
                    and a profile row.
                  </p>
                </div>
                <div className="rounded-[22px] border border-sky-100 bg-sky-50/70 p-5">
                  <h2 className="text-lg font-semibold tracking-tight text-slate-950">
                    Secure login
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Users sign in and land directly in a protected dashboard.
                  </p>
                </div>
                <div className="rounded-[22px] border border-slate-200 bg-white/80 p-5">
                  <p className="mono-meta text-slate-500">Demo note</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    This interface is tuned for a clean hackathon walkthrough:
                    fast access, readable summaries, and stronger visual hierarchy.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] bg-[linear-gradient(135deg,#10324b_0%,#0f766e_60%,#38bdf8_130%)] p-6 text-white shadow-[0_24px_64px_-32px_rgba(15,118,110,0.65)]">
              <p className="mono-meta text-emerald-100">Why it works</p>
              <p className="mt-3 text-2xl font-semibold tracking-tight">
                Calm visuals, clear risk framing, and less dashboard noise.
              </p>
              <p className="mt-3 text-sm leading-7 text-emerald-50/90">
                The product now leans toward a polished health-tech feel instead
                of a default admin template.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
