import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthenticatedHealthAssistant } from "@/components/assistant/authenticated-health-assistant";
import { NewCarePlanForm } from "@/components/care-plans/new-care-plan-form";
import { createClient } from "@/lib/supabase/server";

type CarePlansPageProps = {
  searchParams?: Promise<{
    success?: string;
  }>;
};

const statusStyles: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  needs_review: "bg-amber-100 text-amber-700",
  completed: "bg-slate-200 text-slate-700",
};

function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString();
}

export default async function CarePlansPage({
  searchParams,
}: CarePlansPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: carePlans } = await supabase
    .from("care_plans")
    .select("id, title, description, status, next_review_date, created_at")
    .eq("patient_id", user.id)
    .order("created_at", { ascending: false });

  const params = await searchParams;
  const showCarePlanSaved = params?.success === "care-plan-saved";

  return (
    <>
      <main className="page-shell">
        <div className="ambient-orbs">
          <span className="ambient-orb ambient-orb-sky left-[-4rem] top-18 h-48 w-48" />
          <span className="ambient-orb ambient-orb-amber right-[-4rem] top-14 h-48 w-48" />
        </div>
        <div className="page-frame max-w-6xl">
          <div className="glass-panel surface-card">
          <div className="flex flex-col gap-4 border-b pb-6 section-divider sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <p className="eyebrow">
                Care plans
              </p>
              <h1 className="section-title sm:text-3xl">
                Add and review care plans
              </h1>
              <p className="section-copy">
                Keep each plan clear, simple, and easy to review later.
              </p>
            </div>

            <Link href="/dashboard" className="secondary-btn h-11">
              Back to dashboard
            </Link>
          </div>

          {showCarePlanSaved ? (
            <div className="banner-success mt-6">
              Care plan saved successfully.
            </div>
          ) : null}

          <div className="mt-8 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <section className="glass-panel-strong section-card">
              <div className="border-b pb-4 section-divider">
                <p className="eyebrow">
                  Add care plan
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                  New plan
                </h2>
              </div>

              <div className="mt-5">
                <NewCarePlanForm />
              </div>
            </section>

            <section className="glass-panel-strong section-card">
              <div className="border-b pb-4 section-divider">
                <p className="eyebrow">
                  Saved plans
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                  Current list
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Use this list to quickly see what needs follow-up next.
                </p>
              </div>

              {carePlans?.length ? (
                <div className="mt-5 space-y-4">
                  {carePlans.map((carePlan) => (
                    <article
                      key={carePlan.id}
                      className="rounded-[24px] border border-white/85 bg-white/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-slate-950">
                            {carePlan.title}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {carePlan.description}
                          </p>
                        </div>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] ${
                            statusStyles[carePlan.status] ?? statusStyles.active
                          }`}
                        >
                          {formatStatus(carePlan.status)}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-[22px] border border-slate-200/70 bg-slate-50/85 p-4">
                          <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                            Next review
                          </p>
                          <p className="mt-2 text-sm font-medium text-slate-900">
                            {carePlan.next_review_date
                              ? formatDate(carePlan.next_review_date)
                              : "Not scheduled"}
                          </p>
                        </div>
                        <div className="rounded-[22px] border border-slate-200/70 bg-slate-50/85 p-4">
                          <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                            Added
                          </p>
                          <p className="mt-2 text-sm font-medium text-slate-900">
                            {new Date(carePlan.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-[24px] border border-dashed border-slate-300 bg-white/80 p-5 text-sm text-slate-600">
                  No care plans added yet. Start with one simple plan.
                </div>
              )}
            </section>
          </div>
          </div>
        </div>
      </main>
      <AuthenticatedHealthAssistant />
    </>
  );
}
