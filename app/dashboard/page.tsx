import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";
import { createClient } from "@/lib/supabase/server";

type DashboardPageProps = {
  searchParams?: Promise<{
    success?: string;
  }>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  let { data: latestVitals } = await supabase
    .from("vitals")
    .select(
      "heart_rate, systolic_bp, diastolic_bp, weight, symptoms, created_at",
    )
    .eq("patient_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!latestVitals) {
    const fallbackVitalsResponse = await supabase
      .from("vitals")
      .select("id, heart_rate, systolic_bp, diastolic_bp, weight, symptoms")
      .eq("patient_id", user.id)
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

    latestVitals = fallbackVitalsResponse.data
      ? {
          ...fallbackVitalsResponse.data,
          created_at: null,
        }
      : null;
  }

  let { data: alerts } = await supabase
    .from("alerts")
    .select("id, alert_type, title, message, vitals_created_at, created_at")
    .eq("patient_id", user.id)
    .order("created_at", { ascending: false });

  if (!alerts) {
    alerts = [];
  }

  let { data: medications } = await supabase
    .from("medications")
    .select("id, medication_name, dosage, frequency, notes, created_at")
    .eq("patient_id", user.id)
    .order("created_at", { ascending: false });

  if (!medications) {
    const fallbackMedicationsResponse = await supabase
      .from("medications")
      .select("id, medicine_name, dosage, frequency, notes, created_at")
      .eq("patient_id", user.id)
      .order("created_at", { ascending: false });

    medications =
      fallbackMedicationsResponse.data?.map((medication) => ({
        ...medication,
        medication_name: medication.medicine_name,
      })) ?? [];
  }

  if (!medications.length) {
    const legacyMedicationsResponse = await supabase
      .from("medications")
      .select("id, name, dosage, frequency, notes, created_at")
      .eq("patient_id", user.id)
      .order("created_at", { ascending: false });

    medications =
      legacyMedicationsResponse.data?.map((medication) => ({
        ...medication,
        medication_name: medication.name,
      })) ?? medications;
  }

  let { data: carePlans } = await supabase
    .from("care_plans")
    .select("id, title, description, status, next_review_date, created_at")
    .eq("patient_id", user.id)
    .order("created_at", { ascending: false });

  if (!carePlans) {
    carePlans = [];
  }

  const params = await searchParams;
  const showVitalsSaved = params?.success === "vitals-saved";

  const alertStyles: Record<
    string,
    {
      card: string;
      badge: string;
    }
  > = {
    high_heart_rate: {
      card: "border-rose-200 bg-rose-50",
      badge: "bg-rose-100 text-rose-700",
    },
    high_blood_pressure: {
      card: "border-amber-200 bg-amber-50",
      badge: "bg-amber-100 text-amber-700",
    },
    low_blood_pressure: {
      card: "border-sky-200 bg-sky-50",
      badge: "bg-sky-100 text-sky-700",
    },
  };

  const carePlanStatusStyles: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700",
    needs_review: "bg-amber-100 text-amber-700",
    completed: "bg-slate-200 text-slate-700",
  };

  function formatCarePlanStatus(status: string) {
    return status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (character) => character.toUpperCase());
  }

  function formatDate(date: string) {
    return new Date(`${date}T00:00:00`).toLocaleDateString();
  }

  const activeCarePlansCount =
    carePlans?.filter((carePlan) => carePlan.status === "active").length ?? 0;

  const needsReviewCarePlansCount =
    carePlans?.filter((carePlan) => carePlan.status === "needs_review").length ??
    0;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
              Dashboard
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              Welcome, {profile?.full_name ?? "User"}
            </h1>
            <p className="text-sm leading-6 text-slate-600">
              Your authenticated account details are shown below.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <Link
              href="/vitals/new"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Add vitals
            </Link>
            <Link
              href="/medications"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
            >
              Manage medications
            </Link>
            <Link
              href="/care-plans"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
            >
              Manage care plans
            </Link>
            <LogoutButton />
          </div>
        </div>

        {showVitalsSaved ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Vitals entry saved successfully.
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              Full name
            </p>
            <p className="mt-2 text-sm text-slate-900">
              {profile?.full_name ?? "Not set"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              Email
            </p>
            <p className="mt-2 break-all text-sm text-slate-900">
              {user.email ?? "No email available"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              Role
            </p>
            <p className="mt-2 text-sm capitalize text-slate-900">
              {profile?.role ?? "Not set"}
            </p>
          </div>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <div className="border-b border-slate-200 pb-4">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              Alerts
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
              Latest alerts
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              These alerts are generated from your most recent vitals entry.
            </p>
          </div>

          {alerts?.length ? (
            <div className="mt-5 space-y-4">
              {alerts.map((alert) => {
                const styles =
                  alertStyles[alert.alert_type] ?? alertStyles.high_heart_rate;

                return (
                  <article
                    key={alert.id}
                    className={`rounded-2xl border p-5 ${styles.card}`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-slate-950">
                          {alert.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {alert.message}
                        </p>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] ${styles.badge}`}
                      >
                        Active
                      </span>
                    </div>

                    <p className="mt-4 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                      Triggered from vitals recorded on{" "}
                      {new Date(alert.vitals_created_at).toLocaleDateString()}
                    </p>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600">
              {latestVitals
                ? "No alerts from your latest vitals. Current readings are within the MVP thresholds."
                : "No alerts yet. Add your first vitals entry to start alert tracking."}
            </div>
          )}
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                Care plans
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                Care plan summary
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                A simple view of current plans and what needs review next.
              </p>
            </div>
            <Link
              href="/care-plans"
              className="text-sm font-medium text-slate-700 transition hover:text-slate-950"
            >
              Add or view all
            </Link>
          </div>

          {carePlans?.length ? (
            <>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                    Total plans
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">
                    {carePlans.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                    Active
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">
                    {activeCarePlansCount}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                    Needs review
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">
                    {needsReviewCarePlansCount}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {carePlans.slice(0, 3).map((carePlan) => (
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
                          carePlanStatusStyles[carePlan.status] ??
                          carePlanStatusStyles.active
                        }`}
                      >
                        {formatCarePlanStatus(carePlan.status)}
                      </span>
                    </div>

                    <p className="mt-4 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                      Next review{" "}
                      {carePlan.next_review_date
                        ? formatDate(carePlan.next_review_date)
                        : "not scheduled"}
                    </p>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600">
              No care plans yet. Add a simple plan to track what should happen
              next.
            </div>
          )}
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                Medications
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                Active medications
              </h2>
            </div>
            <Link
              href="/medications"
              className="text-sm font-medium text-slate-700 transition hover:text-slate-950"
            >
              Add or view all
            </Link>
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
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600">
              No active medications yet. Add medications to keep them visible on
              your dashboard.
            </div>
          )}
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                Latest vitals
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                Most recent health entry
              </h2>
            </div>
            <Link
              href="/vitals/new"
              className="text-sm font-medium text-slate-700 transition hover:text-slate-950"
            >
              Add another entry
            </Link>
          </div>

          {latestVitals ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                  Heart rate
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {latestVitals.heart_rate} bpm
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                  Blood pressure
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {latestVitals.systolic_bp}/{latestVitals.diastolic_bp} mmHg
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                  Weight
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {latestVitals.weight} kg
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                  Recorded
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {latestVitals.created_at
                    ? new Date(latestVitals.created_at).toLocaleDateString()
                    : "Just now"}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600">
              No vitals entries yet. Add your first record to start tracking
              recent measurements.
            </div>
          )}

          {latestVitals?.symptoms ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                Symptoms
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {latestVitals.symptoms}
              </p>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
