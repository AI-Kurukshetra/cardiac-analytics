import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthenticatedHealthAssistant } from "@/components/assistant/authenticated-health-assistant";
import { SupabaseConfigState } from "@/components/system/supabase-config-state";
import { MedicationAdherenceButton } from "@/components/medications/medication-adherence-button";
import { NewMedicationForm } from "@/components/medications/new-medication-form";
import {
  fetchPatientMedications,
  getMedicationAdherenceSummary,
} from "@/lib/medications";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

type MedicationsPageProps = {
  searchParams?: Promise<{
    success?: string;
  }>;
};

export default async function MedicationsPage({
  searchParams,
}: MedicationsPageProps) {
  if (!isSupabaseConfigured()) {
    return (
      <main className="page-shell">
        <div className="ambient-orbs">
          <span className="ambient-orb ambient-orb-amber left-[-4rem] top-24 h-48 w-48" />
          <span className="ambient-orb ambient-orb-teal right-[-5rem] top-12 h-52 w-52" />
        </div>
        <div className="page-frame max-w-4xl">
          <SupabaseConfigState
            title="Medications page needs Supabase setup"
            description="This deployment cannot load or save medications until the public Supabase environment variables are configured in Vercel."
            backHref="/dashboard"
            backLabel="Back to dashboard"
          />
        </div>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const medications = await fetchPatientMedications(supabase, user.id);
  const adherenceSummary = getMedicationAdherenceSummary(medications);

  const params = await searchParams;
  const showMedicationSaved = params?.success === "medication-saved";

  return (
    <>
      <main className="page-shell">
        <div className="ambient-orbs">
          <span className="ambient-orb ambient-orb-amber left-[-4rem] top-24 h-48 w-48" />
          <span className="ambient-orb ambient-orb-teal right-[-5rem] top-12 h-52 w-52" />
        </div>
        <div className="page-frame max-w-6xl">
          <div className="glass-panel surface-card">
          <div className="flex flex-col gap-4 border-b pb-6 section-divider sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <p className="eyebrow">
                Medications
              </p>
              <h1 className="section-title sm:text-3xl">
                Manage current medications
              </h1>
              <p className="section-copy">
                Add medications and keep a simple list of what is currently active.
              </p>
            </div>

            <Link href="/dashboard" className="secondary-btn h-11">
              Back to dashboard
            </Link>
          </div>

          {showMedicationSaved ? (
            <div className="banner-success mt-6">
              Medication saved successfully.
            </div>
          ) : null}

          <div className="mt-8 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <section className="glass-panel-strong section-card">
              <div className="border-b pb-4 section-divider">
                <p className="eyebrow">
                  Add medication
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                  New entry
                </h2>
              </div>

              <div className="mt-5">
                <NewMedicationForm />
              </div>
            </section>

            <section className="glass-panel-strong section-card">
              <div className="border-b pb-4 section-divider">
                <p className="eyebrow">
                  Active medications
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                  Current list
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  This demo tracks one dose confirmation per medication per day.
                </p>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <article className="rounded-[22px] border border-emerald-200 bg-emerald-50/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                    Taken today
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    {adherenceSummary.takenToday}
                  </p>
                </article>
                <article className="rounded-[22px] border border-amber-200 bg-amber-50/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                    Pending today
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    {adherenceSummary.pendingToday}
                  </p>
                </article>
                <article className="rounded-[22px] border border-sky-200 bg-sky-50/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">
                    Adherence
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    {adherenceSummary.adherenceRate}%
                  </p>
                </article>
              </div>

              {medications.length ? (
                <div className="mt-5 space-y-4">
                  {medications.map((medication) => (
                    <article
                      key={medication.id}
                      className="rounded-[24px] border border-white/85 bg-white/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-slate-950">
                            {medication.medication_name}
                          </h3>
                          <p className="mt-2 text-sm text-slate-700">
                            {medication.dosage || "Dose not set"} /{" "}
                            {medication.frequency || "Schedule not set"}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                            Active
                          </span>
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                              medication.takenToday
                                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border border-amber-200 bg-amber-50 text-amber-700"
                            }`}
                          >
                            {medication.takenToday ? "Taken today" : "Pending today"}
                          </span>
                        </div>
                      </div>

                      {medication.notes ? (
                        <p className="mt-4 text-sm leading-6 text-slate-600">
                          {medication.notes}
                        </p>
                      ) : null}

                      <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                            Added{" "}
                            {medication.created_at
                              ? new Date(medication.created_at).toLocaleDateString()
                              : "just now"}
                          </p>
                          <p className="text-sm text-slate-600">
                            {medication.takenAt
                              ? `Marked taken at ${new Date(medication.takenAt).toLocaleTimeString(undefined, {
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}`
                              : "Dose has not been marked as taken yet today."}
                          </p>
                        </div>

                        <MedicationAdherenceButton
                          medicationId={medication.id}
                          takenToday={medication.takenToday}
                          takenAt={medication.takenAt}
                        />
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-[24px] border border-dashed border-slate-300 bg-white/80 p-5 text-sm text-slate-600">
                  No medications added yet. Use the form to create the first entry.
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
