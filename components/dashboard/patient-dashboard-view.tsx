import type { ReactNode } from "react";
import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { CriticalEscalationBanner } from "@/components/dashboard/critical-escalation-banner";
import { RiskBadge } from "@/components/risk-badge";
import {
  LatestVitals,
  VitalsTrendPoint,
} from "@/components/dashboard/types";
import { VitalsTrendsSection } from "@/components/dashboard/vitals-trends-section";
import { getPatientEscalation } from "@/lib/escalation";
import { PatientFollowUp } from "@/lib/follow-ups";
import { HealthSummary } from "@/lib/health-summary";
import {
  MedicationAdherenceSummary,
  MedicationRecord,
} from "@/lib/medications";
import { RiskAssessment } from "@/lib/risk";

type AlertItem = {
  id: number;
  alert_type: string;
  title: string;
  message: string;
  vitals_created_at: string | null;
  created_at: string | null;
};

type CarePlanItem = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  next_review_date: string | null;
  created_at: string;
};

type PatientDashboardViewProps = {
  fullName: string | null | undefined;
  email: string | null | undefined;
  role: string | null | undefined;
  latestVitals: LatestVitals | null;
  vitalsHistory: VitalsTrendPoint[];
  risk: RiskAssessment;
  healthSummary: HealthSummary;
  alerts: AlertItem[];
  medications: MedicationRecord[];
  medicationAdherence: MedicationAdherenceSummary;
  followUp: PatientFollowUp | null;
  carePlans: CarePlanItem[];
  showVitalsSaved: boolean;
  showDemoVitalsLoaded: boolean;
};

const alertStyles: Record<
  string,
  {
    accent: string;
    badge: string;
    label: string;
  }
> = {
  high_heart_rate: {
    accent: "border-rose-200 bg-rose-50/80",
    badge: "bg-rose-100 text-rose-700",
    label: "Heart rate",
  },
  high_blood_pressure: {
    accent: "border-amber-200 bg-amber-50/80",
    badge: "bg-amber-100 text-amber-700",
    label: "Blood pressure",
  },
  low_blood_pressure: {
    accent: "border-sky-200 bg-sky-50/80",
    badge: "bg-sky-100 text-sky-700",
    label: "Blood pressure",
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
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

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

function getRiskSummary(risk: RiskAssessment) {
  switch (risk.level) {
    case "high":
      return "Latest reading needs immediate attention in the demo flow.";
    case "medium":
      return "Latest reading is elevated and should stay visible to the care team.";
    case "low":
      return "Latest reading is within the lower-risk demo thresholds.";
    default:
      return "Add a vitals entry to calculate the patient's current risk.";
  }
}

function formatRole(role: string | null | undefined) {
  if (!role) {
    return "Not set";
  }

  return role.charAt(0).toUpperCase() + role.slice(1);
}

function formatWeight(weight: number | null | undefined) {
  if (weight === null || weight === undefined) {
    return "Not recorded";
  }

  return `${weight} kg`;
}

function SectionTitle({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

export function PatientDashboardView({
  fullName,
  email,
  role,
  latestVitals,
  vitalsHistory,
  risk,
  healthSummary,
  alerts,
  medications,
  medicationAdherence,
  followUp,
  carePlans,
  showVitalsSaved,
  showDemoVitalsLoaded,
}: PatientDashboardViewProps) {
  const activeCarePlansCount =
    carePlans.filter((carePlan) => carePlan.status === "active").length ?? 0;
  const needsReviewCarePlansCount =
    carePlans.filter((carePlan) => carePlan.status === "needs_review").length ??
    0;
  const recentAlerts = alerts.slice(0, 3);
  const recentMedications = medications.slice(0, 3);
  const recentCarePlans = carePlans.slice(0, 2);
  const escalation = getPatientEscalation(
    risk,
    alerts.map((alert) => alert.alert_type),
  );

  return (
    <main className="page-shell">
      <div className="ambient-orbs">
        <div className="ambient-grid absolute inset-x-0 top-0 h-72 opacity-40" />
        <span className="ambient-orb ambient-orb-teal left-[-5rem] top-20 h-60 w-60" />
        <span className="ambient-orb ambient-orb-sky right-[-4rem] top-24 h-56 w-56" />
        <span className="ambient-orb ambient-orb-amber bottom-16 left-1/2 h-44 w-44" />
      </div>
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="glass-panel surface-card flex flex-col gap-4 overflow-hidden sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <span className="eyebrow inline-flex rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1">
              Patient dashboard
            </span>
            <div>
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
                {fullName ?? "Patient dashboard"}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                A single-screen summary of the patient&apos;s profile, latest
                vitals, current risk, alerts, medications, and care plan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/vitals/new" className="primary-btn h-11">
              Record vitals
            </Link>
            <LogoutButton />
          </div>
        </header>

        {showVitalsSaved ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Vitals entry saved successfully.
          </div>
        ) : null}

        {showDemoVitalsLoaded ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
            Demo vitals loaded: one normal reading and one alert-triggering reading.
          </div>
        ) : null}

        {escalation ? (
          <CriticalEscalationBanner escalation={escalation} />
        ) : null}

        <section className="grid gap-5 lg:grid-cols-12">
          <article className="glass-panel section-card lg:col-span-4">
            <SectionTitle
              eyebrow="Section 1"
              title="Patient profile summary"
            />

            <dl className="mt-5 space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Name
                </dt>
                <dd className="mt-2 text-lg font-semibold text-slate-950">
                  {fullName ?? "Profile incomplete"}
                </dd>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Role
                  </dt>
                  <dd className="mt-2 text-sm font-medium text-slate-900">
                    {formatRole(role)}
                  </dd>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Latest update
                  </dt>
                  <dd className="mt-2 text-sm font-medium text-slate-900">
                    {formatDateTime(latestVitals?.created_at)}
                  </dd>
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Contact
                </dt>
                <dd className="mt-2 break-all text-sm font-medium text-slate-900">
                  {email ?? "No email available"}
                </dd>
              </div>
            </dl>
          </article>

          <article className="glass-panel section-card lg:col-span-5">
            <SectionTitle
              eyebrow="Section 2"
              title="Latest vitals card"
              action={
                <Link
                  href="/vitals/new"
                  className="text-sm font-medium text-slate-700 transition hover:text-slate-950"
                >
                  Update
                </Link>
              }
            />

            {latestVitals ? (
              <div className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-emerald-200 tint-teal p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                      Heart rate
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                      {latestVitals.heart_rate}
                    </p>
                    <p className="text-sm text-slate-600">bpm</p>
                  </div>
                  <div className="rounded-2xl border border-sky-200 tint-sky p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">
                      Blood pressure
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                      {latestVitals.systolic_bp}/{latestVitals.diastolic_bp}
                    </p>
                    <p className="text-sm text-slate-600">mmHg</p>
                  </div>
                  <div className="rounded-2xl border border-cyan-200 bg-[linear-gradient(180deg,rgba(236,254,255,0.92)_0%,rgba(255,255,255,0.82)_100%)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
                      Weight
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                      {formatWeight(latestVitals.weight)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Recorded
                    </p>
                    <p className="mt-2 text-sm font-medium leading-6 text-slate-900">
                      {formatDateTime(latestVitals.created_at)}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Symptoms note
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {latestVitals.symptoms?.trim()
                      ? latestVitals.symptoms
                      : "No symptoms were recorded in the latest entry."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                No vitals entries yet. Record the first reading to populate the
                patient story.
              </div>
            )}
          </article>

          <article className="glass-panel section-card lg:col-span-3">
            <SectionTitle
              eyebrow="Section 3"
              title="Risk status badge"
            />

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <RiskBadge risk={risk} />
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {getRiskSummary(risk)}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Risk score
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    {risk.score}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Active alerts
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    {alerts.length}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Active plans
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    {activeCarePlansCount}
                  </p>
                </div>
              </div>
            </div>
          </article>

          <article className="glass-panel section-card lg:col-span-12">
            <SectionTitle
              eyebrow="Section 4"
              title="Vitals trends"
              action={
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                  Supabase history
                </span>
              }
            />

            {vitalsHistory.length ? (
              <VitalsTrendsSection vitalsHistory={vitalsHistory} />
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                Add a few vitals entries to see clean trend charts for heart rate,
                blood pressure, and weight.
              </div>
            )}
          </article>

          <article className="glass-panel section-card lg:col-span-12">
            <SectionTitle
              eyebrow="Section 5"
              title="AI-style health summary"
            />

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-[24px] border border-emerald-200 bg-[linear-gradient(180deg,rgba(236,253,245,0.92)_0%,rgba(255,255,255,0.82)_100%)] p-5">
                <p className="eyebrow">Patient-friendly</p>
                <p className="mt-3 text-sm leading-7 text-slate-700">
                  {healthSummary.patientSummary}
                </p>
              </div>

              <div className="rounded-[24px] border border-sky-200 bg-[linear-gradient(180deg,rgba(240,249,255,0.94)_0%,rgba(255,255,255,0.82)_100%)] p-5">
                <p className="eyebrow text-sky-700">Provider-facing</p>
                <p className="mt-3 text-sm leading-7 text-slate-700">
                  {healthSummary.providerSummary}
                </p>
              </div>
            </div>
          </article>

          <article className="glass-panel section-card lg:col-span-4">
            <SectionTitle
              eyebrow="Section 6"
              title="Active alerts"
            />

            {recentAlerts.length ? (
              <div className="mt-5 space-y-3">
                {recentAlerts.map((alert) => {
                  const styles =
                    alertStyles[alert.alert_type] ?? alertStyles.high_heart_rate;

                  return (
                    <article
                      key={alert.id}
                      className={`rounded-2xl border p-4 ${styles.accent}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            {styles.label}
                          </p>
                          <h3 className="mt-1 text-sm font-semibold text-slate-950">
                            {alert.title}
                          </h3>
                        </div>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${styles.badge}`}
                        >
                          Active
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {alert.message}
                      </p>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                {latestVitals
                  ? "No active alerts from the latest vitals."
                  : "Alerts appear here after the first vitals entry is recorded."}
              </div>
            )}
          </article>

          <article className="glass-panel section-card lg:col-span-4">
            <SectionTitle
              eyebrow="Section 7"
              title="Medication adherence"
              action={
                <Link
                  href="/medications"
                  className="text-sm font-medium text-slate-700 transition hover:text-slate-950"
                >
                  Manage
                </Link>
              }
            />

            <div className="mt-5 space-y-4">
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                    Taken today
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    {medicationAdherence.takenToday}
                  </p>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                    Pending today
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    {medicationAdherence.pendingToday}
                  </p>
                </div>
                <div className="rounded-2xl border border-sky-200 bg-sky-50/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">
                    Adherence
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    {medicationAdherence.adherenceRate}%
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm leading-6 text-slate-600">
                  {medicationAdherence.totalMedications
                    ? `${medicationAdherence.takenToday} of ${medicationAdherence.totalMedications} active medications have been marked as taken today.`
                    : "Add medications to start tracking daily adherence in the demo."}
                </p>
              </div>
            </div>
          </article>

          <article className="glass-panel section-card lg:col-span-4">
            <SectionTitle
              eyebrow="Section 8"
              title="Upcoming follow-up"
              action={
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                    followUp?.isOverdue
                      ? "bg-amber-100 text-amber-700"
                      : followUp?.isToday
                        ? "bg-sky-100 text-sky-700"
                        : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {followUp
                    ? followUp.isOverdue
                      ? "Overdue"
                      : followUp.isToday
                        ? "Due today"
                        : "Scheduled"
                    : "Not set"}
                </span>
              }
            />

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Next follow-up date
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  {followUp?.next_follow_up_date
                    ? formatDate(followUp.next_follow_up_date)
                    : "Not scheduled"}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {followUp
                    ? followUp.isOverdue
                      ? "Your previously scheduled follow-up date has passed. The provider view highlights this as overdue."
                      : followUp.isToday
                        ? "Your follow-up is due today."
                        : "This upcoming follow-up was scheduled from the provider dashboard."
                    : "No provider follow-up has been scheduled yet."}
                </p>
              </div>
            </div>
          </article>

          <article className="glass-panel section-card lg:col-span-4">
            <SectionTitle
              eyebrow="Section 9"
              title="Current medications"
              action={
                <Link
                  href="/medications"
                  className="text-sm font-medium text-slate-700 transition hover:text-slate-950"
                >
                  View all
                </Link>
              }
            />

            {recentMedications.length ? (
              <div className="mt-5 space-y-3">
                {recentMedications.map((medication) => (
                  <article
                    key={medication.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-950">
                          {medication.medication_name}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {medication.dosage || "Dose not set"} /{" "}
                          {medication.frequency || "Schedule not set"}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                          Active
                        </span>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                            medication.takenToday
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {medication.takenToday ? "Taken today" : "Pending today"}
                        </span>
                      </div>
                    </div>
                    {medication.notes ? (
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {medication.notes}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                No medications added yet.
              </div>
            )}
          </article>

          <article className="glass-panel section-card lg:col-span-4">
            <SectionTitle
              eyebrow="Section 10"
              title="Care plan summary"
              action={
                <Link
                  href="/care-plans"
                  className="text-sm font-medium text-slate-700 transition hover:text-slate-950"
                >
                  View all
                </Link>
              }
            />

            {recentCarePlans.length ? (
              <div className="mt-5 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Total plans
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                      {carePlans.length}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-amber-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                      Needs review
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                      {needsReviewCarePlansCount}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {recentCarePlans.map((carePlan) => (
                    <article
                      key={carePlan.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-950">
                            {carePlan.title}
                          </h3>
                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            {carePlan.description || "No description added."}
                          </p>
                        </div>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                            carePlanStatusStyles[carePlan.status] ??
                            carePlanStatusStyles.active
                          }`}
                        >
                          {formatCarePlanStatus(carePlan.status)}
                        </span>
                      </div>
                      <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                        Next review{" "}
                        {carePlan.next_review_date
                          ? formatDate(carePlan.next_review_date)
                          : "not scheduled"}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                No care plans added yet.
              </div>
            )}
          </article>
        </section>
      </div>
    </main>
  );
}
