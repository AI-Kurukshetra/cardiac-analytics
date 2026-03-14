import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center">
        <div className="grid w-full gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm lg:grid-cols-[1.1fr_0.9fr] lg:p-12">
          <div className="space-y-6">
            <span className="inline-flex rounded-full border border-slate-200 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-600">
              Cardiac Care AI
            </span>
            <div className="space-y-4">
              <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Patient and provider authentication built on Supabase.
              </h1>
              <p className="max-w-xl text-base leading-7 text-slate-600">
                Use the authentication pages to create accounts, sign in, and
                land on a dashboard backed by your Supabase session.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="flex h-12 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Go to login
              </Link>
              <Link
                href="/signup"
                className="flex h-12 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-medium text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Create account
              </Link>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-950 p-8 text-slate-100">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
              Included
            </p>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h2 className="text-lg font-semibold">Signup</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Collects full name, email, password, and role, then creates a
                  profile row after auth registration.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h2 className="text-lg font-semibold">Login</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Signs users in with Supabase and redirects directly to
                  `/dashboard`.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
