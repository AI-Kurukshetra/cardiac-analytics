import Link from "next/link";
import { getMissingSupabaseEnvVars } from "@/lib/supabase/config";

type SupabaseConfigStateProps = {
  title?: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  compact?: boolean;
};

export function SupabaseConfigState({
  title = "Supabase setup is incomplete",
  description = "This environment is missing the public Supabase keys needed to render the app. Add them in Vercel project settings, then redeploy.",
  backHref,
  backLabel = "Back",
  compact = false,
}: SupabaseConfigStateProps) {
  const missingEnvVars = getMissingSupabaseEnvVars();

  return (
    <section
      className={`glass-panel-strong rounded-[28px] border border-amber-200/70 bg-white/88 ${
        compact ? "p-6" : "p-8 sm:p-10"
      }`}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="eyebrow text-amber-700">Configuration</p>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">
            {title}
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-slate-600">
            {description}
          </p>
        </div>

        <div className="rounded-[22px] border border-amber-200 bg-amber-50/80 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
            Missing environment variables
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {missingEnvVars.map((envVar) => (
              <li key={envVar} className="font-medium">
                {envVar}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm leading-7 text-slate-600">
          In Vercel, go to Project Settings, add these values under Environment
          Variables for Production, and trigger a new deployment.
        </p>

        {backHref ? (
          <div className="pt-1">
            <Link href={backHref} className="secondary-btn h-11">
              {backLabel}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
