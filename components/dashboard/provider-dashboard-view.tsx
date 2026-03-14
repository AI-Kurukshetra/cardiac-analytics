import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { CriticalEscalationBanner } from "@/components/dashboard/critical-escalation-banner";
import { FollowUpScheduler } from "@/components/dashboard/follow-up-scheduler";
import { ProviderPatient } from "@/components/dashboard/types";
import { RiskBadge } from "@/components/risk-badge";
import { getProviderEscalation } from "@/lib/escalation";

type ProviderDashboardViewProps = {
  fullName: string | null | undefined;
  email: string | null | undefined;
  patients: ProviderPatient[];
};

function formatDateTime(date: string | null | undefined) {
  if (!date) {
    return "Not recorded yet";
  }

  return new Date(date).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatWeight(weight: number | null | undefined) {
  if (weight === null || weight === undefined) {
    return "Not recorded";
  }

  return `${weight} kg`;
}

function formatDate(date: string | null | undefined) {
  if (!date) {
    return "Not scheduled";
  }

  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ProviderDashboardView({
  fullName,
  email,
  patients,
}: ProviderDashboardViewProps) {
  const highRiskCount = patients.filter(
    (patient) => patient.risk.level === "high",
  ).length;
  const mediumRiskCount = patients.filter(
    (patient) => patient.risk.level === "medium",
  ).length;
  const lowRiskCount = patients.filter(
    (patient) => patient.risk.level === "low",
  ).length;
  const totalAlertsCount = patients.reduce(
    (total, patient) => total + patient.alertsCount,
    0,
  );
  const overdueFollowUpsCount = patients.filter(
    (patient) => patient.followUp?.isOverdue,
  ).length;
  const escalation = getProviderEscalation(patients);

  return (
    <main className="page-shell">
      <div className="ambient-orbs">
        <div className="ambient-grid absolute inset-x-0 top-0 h-72 opacity-40" />
        <span className="ambient-orb ambient-orb-sky left-[-6rem] top-16 h-60 w-60" />
        <span className="ambient-orb ambient-orb-teal right-[-4rem] top-14 h-52 w-52" />
        <span className="ambient-orb ambient-orb-amber bottom-12 left-1/3 h-40 w-40" />
      </div>
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="glass-panel surface-card flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <span className="eyebrow inline-flex rounded-full border border-sky-200 bg-sky-50/80 px-3 py-1 text-sky-700">
              Provider dashboard
            </span>
            <div>
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
                {fullName ?? "Provider dashboard"}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Patients are sorted by risk so the highest-priority cases stay
                at the top during the demo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-2xl bg-slate-50 px-4 py-3 text-right sm:block">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Contact
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {email ?? "No email available"}
              </p>
            </div>
            <LogoutButton />
          </div>
        </header>

        {escalation ? (
          <CriticalEscalationBanner escalation={escalation} />
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <article className="glass-panel section-card">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Patients
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              {patients.length}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Total patients shown in the provider view.
            </p>
          </article>
          <article className="rounded-[24px] border border-rose-200 bg-rose-50/80 p-5 shadow-[0_20px_70px_-42px_rgba(15,23,42,0.2)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
              High risk
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              {highRiskCount}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Highest-priority patients at the top of the list.
            </p>
          </article>
          <article className="rounded-[24px] border border-amber-200 bg-amber-50/80 p-5 shadow-[0_20px_70px_-42px_rgba(15,23,42,0.2)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
              Medium risk
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              {mediumRiskCount}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Patients with elevated readings.
            </p>
          </article>
          <article className="rounded-[24px] border border-sky-200 bg-sky-50/80 p-5 shadow-[0_20px_70px_-42px_rgba(15,23,42,0.2)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
              Active alerts
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              {totalAlertsCount}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Alert volume across the patient list.
            </p>
          </article>
          <article className="rounded-[24px] border border-amber-300 bg-[linear-gradient(180deg,rgba(255,251,235,0.9)_0%,rgba(255,255,255,0.9)_100%)] p-5 shadow-[0_20px_70px_-42px_rgba(15,23,42,0.2)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
              Overdue follow-ups
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              {overdueFollowUpsCount}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Patients whose next follow-up date has passed.
            </p>
          </article>
        </section>

        <section className="glass-panel surface-card">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Patient list
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                Risk-sorted patient cards
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Each card shows patient name, latest vitals, risk badge, and
                alerts count for a quick provider review.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
            >
              Refresh
            </Link>
          </div>

          {patients.length ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {patients.map((patient) => (
                <article
                  key={patient.id}
                  className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5"
                >
                  <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Patient
                      </p>
                      <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
                        {patient.full_name ?? "Unnamed patient"}
                      </h3>
                    </div>
                      <div className="flex items-center gap-3">
                      {patient.followUp?.isOverdue ? (
                        <div className="rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                          Follow-up overdue
                        </div>
                      ) : null}
                      <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                        {patient.alertsCount} alerts
                      </div>
                      <RiskBadge risk={patient.risk} />
                    </div>
                  </div>

                  {patient.latestVitals ? (
                    <>
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Heart rate
                          </p>
                          <p className="mt-2 text-lg font-semibold text-slate-950">
                            {patient.latestVitals.heart_rate} bpm
                          </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Blood pressure
                          </p>
                          <p className="mt-2 text-lg font-semibold text-slate-950">
                            {patient.latestVitals.systolic_bp}/
                            {patient.latestVitals.diastolic_bp} mmHg
                          </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Weight
                          </p>
                          <p className="mt-2 text-lg font-semibold text-slate-950">
                            {formatWeight(patient.latestVitals.weight)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
                        <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                              Latest reading
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-900">
                              {formatDateTime(patient.latestVitals.created_at)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                              Alerts count
                            </p>
                            <p className="mt-1 text-lg font-semibold text-slate-950">
                              {patient.alertsCount}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Next follow-up
                          </p>
                          <p className="mt-1 text-sm font-medium text-slate-900">
                            {formatDate(patient.followUp?.next_follow_up_date)}
                          </p>
                          <p className="mt-2 text-sm text-slate-600">
                            {patient.followUp?.isOverdue
                              ? "This patient needs a new follow-up date."
                              : patient.followUp?.isToday
                                ? "Follow-up is due today."
                                : patient.followUp
                                  ? "Scheduled and visible on the patient dashboard."
                                  : "No follow-up has been scheduled yet."}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                          Schedule next follow-up
                        </p>
                        <div className="mt-3">
                          <FollowUpScheduler
                            patientId={patient.id}
                            initialDate={patient.followUp?.next_follow_up_date}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm leading-6 text-slate-600">
                        No vitals recorded yet. Risk stays unknown until the first
                        reading is added.
                      </div>

                      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                          Next follow-up
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-900">
                          {formatDate(patient.followUp?.next_follow_up_date)}
                        </p>
                        <p className="mt-2 text-sm text-slate-600">
                          {patient.followUp?.isOverdue
                            ? "This patient needs a new follow-up date."
                            : patient.followUp?.isToday
                              ? "Follow-up is due today."
                              : patient.followUp
                                ? "Scheduled and visible on the patient dashboard."
                                : "No follow-up has been scheduled yet."}
                        </p>
                      </div>

                      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                          Schedule next follow-up
                        </p>
                        <div className="mt-3">
                          <FollowUpScheduler
                            patientId={patient.id}
                            initialDate={patient.followUp?.next_follow_up_date}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-600">
              No patients are available yet. Create patient accounts and add
              vitals to populate the provider dashboard.
            </div>
          )}
        </section>

        <section className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <span className="rounded-full bg-white/90 px-3 py-1 shadow-sm">
            Low risk: {lowRiskCount}
          </span>
          <span className="rounded-full bg-white/90 px-3 py-1 shadow-sm">
            Medium risk: {mediumRiskCount}
          </span>
          <span className="rounded-full bg-white/90 px-3 py-1 shadow-sm">
            High risk: {highRiskCount}
          </span>
        </section>
      </div>
    </main>
  );
}
