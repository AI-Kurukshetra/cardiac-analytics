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
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[1.1fr_0.9fr]">
          <div className="hidden bg-slate-900 p-10 text-slate-100 lg:flex lg:flex-col lg:justify-between">
            <div className="space-y-4">
              <span className="inline-flex rounded-full border border-white/15 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-300">
                Cardiac Care AI
              </span>
              <div className="space-y-3">
                <h1 className="max-w-sm text-4xl font-semibold tracking-tight">
                  Secure access for patients and providers.
                </h1>
                <p className="max-w-md text-sm leading-6 text-slate-300">
                  Sign in to review care workflows, manage patient records, and
                  keep your team aligned.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm leading-6 text-slate-300">
                Simple Supabase-backed authentication for your Next.js App
                Router project.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-md space-y-8">
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
                  {title}
                </h2>
                <p className="text-sm leading-6 text-slate-600">
                  {description}
                </p>
              </div>

              {children}

              <p className="text-sm text-slate-600">
                {footerText}{" "}
                <Link
                  href={footerHref}
                  className="font-medium text-slate-950 transition hover:text-slate-700"
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
