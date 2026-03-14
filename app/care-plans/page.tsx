import Link from "next/link";
import { redirect } from "next/navigation";
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
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
              Care plans
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              Add and review care plans
            </h1>
            <p className="text-sm leading-6 text-slate-600">
              Keep each plan clear, simple, and easy to review later.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
          >
            Back to dashboard
          </Link>
        </div>

        {showCarePlanSaved ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Care plan saved successfully.
          </div>
        ) : null}

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div className="border-b border-slate-200 pb-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
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

          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div className="border-b border-slate-200 pb-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
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
                    className="rounded-2xl border border-slate-200 bg-white p-5"
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
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                          Next review
                        </p>
                        <p className="mt-2 text-sm font-medium text-slate-900">
                          {carePlan.next_review_date
                            ? formatDate(carePlan.next_review_date)
                            : "Not scheduled"}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
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
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600">
                No care plans added yet. Start with one simple plan.
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
