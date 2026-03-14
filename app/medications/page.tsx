import Link from "next/link";
import { redirect } from "next/navigation";
import { NewMedicationForm } from "@/components/medications/new-medication-form";
import { createClient } from "@/lib/supabase/server";

type MedicationsPageProps = {
  searchParams?: Promise<{
    success?: string;
  }>;
};

export default async function MedicationsPage({
  searchParams,
}: MedicationsPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let { data: medications } = await supabase
    .from("medications")
    .select("id, medication_name, dosage, frequency, notes, created_at")
    .eq("patient_id", user.id)
    .order("created_at", { ascending: false });

  if (!medications) {
    const fallbackResponse = await supabase
      .from("medications")
      .select("id, medicine_name, dosage, frequency, notes, created_at")
      .eq("patient_id", user.id)
      .order("created_at", { ascending: false });

    medications =
      fallbackResponse.data?.map((medication) => ({
        ...medication,
        medication_name: medication.medicine_name,
      })) ?? null;
  }

  if (!medications) {
    const legacyResponse = await supabase
      .from("medications")
      .select("id, name, dosage, frequency, notes, created_at")
      .eq("patient_id", user.id)
      .order("created_at", { ascending: false });

    medications =
      legacyResponse.data?.map((medication) => ({
        ...medication,
        medication_name: medication.name,
      })) ?? null;
  }

  const params = await searchParams;
  const showMedicationSaved = params?.success === "medication-saved";

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
              Medications
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              Manage current medications
            </h1>
            <p className="text-sm leading-6 text-slate-600">
              Add medications and keep a simple list of what is currently active.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
          >
            Back to dashboard
          </Link>
        </div>

        {showMedicationSaved ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Medication saved successfully.
          </div>
        ) : null}

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div className="border-b border-slate-200 pb-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
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

          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div className="border-b border-slate-200 pb-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                Active medications
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                Current list
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                All medications added here are treated as active in this MVP.
              </p>
            </div>

            {medications?.length ? (
              <div className="mt-5 space-y-4">
                {medications.map((medication) => (
                  <article
                    key={medication.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-slate-950">
                          {medication.medication_name}
                        </h3>
                        <p className="mt-2 text-sm text-slate-700">
                          {medication.dosage} / {medication.frequency}
                        </p>
                      </div>
                      <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-emerald-700">
                        Active
                      </span>
                    </div>

                    {medication.notes ? (
                      <p className="mt-4 text-sm leading-6 text-slate-600">
                        {medication.notes}
                      </p>
                    ) : null}

                    <p className="mt-4 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                      Added{" "}
                      {medication.created_at
                        ? new Date(medication.created_at).toLocaleDateString()
                        : "just now"}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600">
                No medications added yet. Use the form to create the first entry.
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
