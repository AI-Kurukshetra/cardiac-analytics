import { redirect } from "next/navigation";
import { PatientDashboardView } from "@/components/dashboard/patient-dashboard-view";
import { ProviderDashboardView } from "@/components/dashboard/provider-dashboard-view";
import { AuthenticatedHealthAssistant } from "@/components/assistant/authenticated-health-assistant";
import { SupabaseConfigState } from "@/components/system/supabase-config-state";
import {
  LatestVitals,
  ProviderLatestVitals,
  ProviderPatient,
  VitalsTrendPoint,
} from "@/components/dashboard/types";
import {
  fetchFollowUpsByPatientIds,
  fetchPatientFollowUp,
} from "@/lib/follow-ups";
import { generateHealthSummary } from "@/lib/health-summary";
import {
  fetchPatientMedications,
  getMedicationAdherenceSummary,
} from "@/lib/medications";
import { RiskAssessment, calculateRiskFromVitals } from "@/lib/risk";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

type DashboardPageProps = {
  searchParams?: Promise<{
    success?: string;
  }>;
};

const riskPriority: Record<RiskAssessment["level"], number> = {
  high: 0,
  medium: 1,
  low: 2,
  unknown: 3,
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  if (!isSupabaseConfigured()) {
    return (
      <main className="page-shell">
        <div className="ambient-orbs">
          <span className="ambient-orb ambient-orb-sky left-[-4rem] top-20 h-52 w-52" />
          <span className="ambient-orb ambient-orb-teal right-[-5rem] top-12 h-56 w-56" />
        </div>
        <div className="page-frame max-w-4xl">
          <SupabaseConfigState
            title="Dashboard is waiting for Supabase setup"
            description="This deployment cannot load user, vitals, or assistant data until the public Supabase environment variables are added in Vercel."
            backHref="/login"
            backLabel="Back to login"
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  const params = await searchParams;
  const showVitalsSaved = params?.success === "vitals-saved";
  const showDemoVitalsLoaded = params?.success === "demo-vitals-loaded";

  if (profile?.role === "provider") {
    const { data: patients } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .eq("role", "patient")
      .order("full_name", { ascending: true });
    const patientIds = (patients ?? []).map((patient) => patient.id);

    const { data: patientVitals } = await supabase
      .from("vitals")
      .select(
        "patient_id, heart_rate, systolic_bp, diastolic_bp, weight, created_at",
      )
      .order("created_at", { ascending: false });

    const { data: patientAlerts } = await supabase
      .from("alerts")
      .select("patient_id");
    const followUpsByPatient = await fetchFollowUpsByPatientIds(
      supabase,
      patientIds,
    );

    const latestVitalsByPatient = new Map<string, ProviderLatestVitals>();
    const alertsCountByPatient = new Map<string, number>();

    for (const vitals of patientVitals ?? []) {
      if (!latestVitalsByPatient.has(vitals.patient_id)) {
        latestVitalsByPatient.set(vitals.patient_id, vitals);
      }
    }

    for (const alert of patientAlerts ?? []) {
      alertsCountByPatient.set(
        alert.patient_id,
        (alertsCountByPatient.get(alert.patient_id) ?? 0) + 1,
      );
    }

    const providerPatients: ProviderPatient[] = (patients ?? [])
      .map((patient) => {
        const latestPatientVitals = latestVitalsByPatient.get(patient.id) ?? null;

        return {
          id: patient.id,
          full_name: patient.full_name,
          latestVitals: latestPatientVitals,
          risk: calculateRiskFromVitals(latestPatientVitals),
          alertsCount: alertsCountByPatient.get(patient.id) ?? 0,
          followUp: followUpsByPatient.get(patient.id) ?? null,
        };
      })
      .sort((left, right) => {
        const priorityDifference =
          riskPriority[left.risk.level] - riskPriority[right.risk.level];

        if (priorityDifference !== 0) {
          return priorityDifference;
        }

        return (left.full_name ?? "").localeCompare(right.full_name ?? "");
      });

    return (
      <>
        <ProviderDashboardView
          fullName={profile.full_name}
          email={user.email}
          patients={providerPatients}
        />
        <AuthenticatedHealthAssistant />
      </>
    );
  }

  let { data: latestVitals } = await supabase
    .from("vitals")
    .select(
      "heart_rate, systolic_bp, diastolic_bp, weight, symptoms, created_at",
    )
    .eq("patient_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<LatestVitals>();

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

  let { data: vitalsHistory } = await supabase
    .from("vitals")
    .select("id, heart_rate, systolic_bp, diastolic_bp, weight, created_at")
    .eq("patient_id", user.id)
    .order("created_at", { ascending: false })
    .limit(12);

  if (!vitalsHistory?.length) {
    const fallbackVitalsHistoryResponse = await supabase
      .from("vitals")
      .select("id, heart_rate, systolic_bp, diastolic_bp, weight")
      .eq("patient_id", user.id)
      .order("id", { ascending: false })
      .limit(12);

    vitalsHistory =
      fallbackVitalsHistoryResponse.data?.map((reading) => ({
        ...reading,
        created_at: null,
      })) ?? [];
  }

  const orderedVitalsHistory: VitalsTrendPoint[] = [...(vitalsHistory ?? [])].reverse();

  let { data: alerts } = await supabase
    .from("alerts")
    .select("id, alert_type, title, message, vitals_created_at, created_at")
    .eq("patient_id", user.id)
    .order("created_at", { ascending: false });

  if (!alerts) {
    alerts = [];
  }

  const medications = await fetchPatientMedications(supabase, user.id);
  const followUp = await fetchPatientFollowUp(supabase, user.id);

  let { data: carePlans } = await supabase
    .from("care_plans")
    .select("id, title, description, status, next_review_date, created_at")
    .eq("patient_id", user.id)
    .order("created_at", { ascending: false });

  if (!carePlans) {
    carePlans = [];
  }

  const risk = calculateRiskFromVitals(latestVitals);
  const healthSummary = generateHealthSummary({
    latestVitals,
    risk,
    alertTypes: alerts.map((alert) => alert.alert_type),
  });
  const medicationAdherence = getMedicationAdherenceSummary(medications);

  return (
    <>
      <PatientDashboardView
        fullName={profile?.full_name}
        email={user.email}
        role={profile?.role}
        latestVitals={latestVitals}
        vitalsHistory={orderedVitalsHistory}
        risk={risk}
        healthSummary={healthSummary}
        alerts={alerts}
        medications={medications}
        medicationAdherence={medicationAdherence}
        followUp={followUp}
        carePlans={carePlans}
        showVitalsSaved={showVitalsSaved}
        showDemoVitalsLoaded={showDemoVitalsLoaded}
      />
      <AuthenticatedHealthAssistant />
    </>
  );
}
