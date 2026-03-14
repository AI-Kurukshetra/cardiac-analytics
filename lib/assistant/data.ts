import { SupabaseClient } from "@supabase/supabase-js";
import {
  AssistantPatientSnapshot,
  AssistantProviderPatient,
  AssistantProviderSnapshot,
  AssistantVitals,
} from "@/lib/assistant/types";
import {
  fetchFollowUpsByPatientIds,
  fetchPatientFollowUp,
} from "@/lib/follow-ups";
import { generateHealthSummary } from "@/lib/health-summary";
import {
  fetchPatientMedications,
  getMedicationAdherenceSummary,
} from "@/lib/medications";
import { calculateRiskFromVitals } from "@/lib/risk";

const assistantBrand = {
  name: "PulseAI Assistant",
  subtitle: "Clinical insights powered by your health data",
} as const;

const riskPriority = {
  high: 0,
  medium: 1,
  low: 2,
  unknown: 3,
} as const;

async function fetchRecentPatientVitals(
  supabase: SupabaseClient,
  patientId: string,
  limit = 6,
) {
  let { data } = await supabase
    .from("vitals")
    .select(
      "id, heart_rate, systolic_bp, diastolic_bp, weight, symptoms, created_at",
    )
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!data?.length) {
    const fallbackResponse = await supabase
      .from("vitals")
      .select("id, heart_rate, systolic_bp, diastolic_bp, weight, symptoms")
      .eq("patient_id", patientId)
      .order("id", { ascending: false })
      .limit(limit);

    data =
      fallbackResponse.data?.map((reading) => ({
        ...reading,
        created_at: null,
      })) ?? [];
  }

  return (data ?? []) as AssistantVitals[];
}

async function buildPatientSnapshot(
  supabase: SupabaseClient,
  userId: string,
  fullName: string | null,
) {
  const vitalsHistory = await fetchRecentPatientVitals(supabase, userId);
  const latestVitals = vitalsHistory[0] ?? null;
  const previousVitals = vitalsHistory[1] ?? null;

  const { data: alertRows } = await supabase
    .from("alerts")
    .select("id, alert_type, title, message, vitals_created_at, created_at")
    .eq("patient_id", userId)
    .order("created_at", { ascending: false });

  const medications = await fetchPatientMedications(supabase, userId);
  const medicationAdherence = getMedicationAdherenceSummary(medications);
  const followUp = await fetchPatientFollowUp(supabase, userId);

  const { data: carePlans } = await supabase
    .from("care_plans")
    .select("id, title, description, status, next_review_date, created_at")
    .eq("patient_id", userId)
    .order("created_at", { ascending: false });

  const risk = calculateRiskFromVitals(latestVitals);
  const healthSummary = generateHealthSummary({
    latestVitals,
    risk,
    alertTypes: (alertRows ?? []).map((alert) => alert.alert_type),
  });

  return {
    viewerId: userId,
    role: "patient",
    fullName,
    assistantName: assistantBrand.name,
    assistantSubtitle: assistantBrand.subtitle,
    latestVitals,
    previousVitals,
    vitalsHistory,
    risk,
    alerts: alertRows ?? [],
    medications,
    medicationAdherence,
    carePlans: carePlans ?? [],
    followUp,
    healthSummary,
  } satisfies AssistantPatientSnapshot;
}

async function buildProviderSnapshot(
  supabase: SupabaseClient,
  userId: string,
  fullName: string | null,
) {
  const { data: patients } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "patient")
    .order("full_name", { ascending: true });

  const patientIds = (patients ?? []).map((patient) => patient.id);
  const followUpsByPatient = await fetchFollowUpsByPatientIds(supabase, patientIds);

  const { data: patientVitals } = await supabase
    .from("vitals")
    .select(
      "id, patient_id, heart_rate, systolic_bp, diastolic_bp, weight, symptoms, created_at",
    )
    .order("created_at", { ascending: false });

  const { data: alertRows } = await supabase.from("alerts").select("patient_id");
  const { data: medicationRows } = await supabase
    .from("medications")
    .select("id, patient_id");
  const { data: carePlanRows } = await supabase
    .from("care_plans")
    .select("patient_id, status");

  const latestVitalsByPatient = new Map<string, AssistantVitals>();
  const previousVitalsByPatient = new Map<string, AssistantVitals>();
  const alertsCountByPatient = new Map<string, number>();
  const medicationsCountByPatient = new Map<string, number>();
  const activeCarePlansByPatient = new Map<string, number>();
  const needsReviewCarePlansByPatient = new Map<string, number>();

  for (const vitals of patientVitals ?? []) {
    if (!latestVitalsByPatient.has(vitals.patient_id)) {
      latestVitalsByPatient.set(vitals.patient_id, vitals);
      continue;
    }

    if (!previousVitalsByPatient.has(vitals.patient_id)) {
      previousVitalsByPatient.set(vitals.patient_id, vitals);
    }
  }

  for (const alert of alertRows ?? []) {
    alertsCountByPatient.set(
      alert.patient_id,
      (alertsCountByPatient.get(alert.patient_id) ?? 0) + 1,
    );
  }

  for (const medication of medicationRows ?? []) {
    medicationsCountByPatient.set(
      medication.patient_id,
      (medicationsCountByPatient.get(medication.patient_id) ?? 0) + 1,
    );
  }

  for (const carePlan of carePlanRows ?? []) {
    if (carePlan.status === "active") {
      activeCarePlansByPatient.set(
        carePlan.patient_id,
        (activeCarePlansByPatient.get(carePlan.patient_id) ?? 0) + 1,
      );
    }

    if (carePlan.status === "needs_review") {
      needsReviewCarePlansByPatient.set(
        carePlan.patient_id,
        (needsReviewCarePlansByPatient.get(carePlan.patient_id) ?? 0) + 1,
      );
    }
  }

  const providerPatients = (patients ?? [])
    .map((patient) => {
      const latestVitals = latestVitalsByPatient.get(patient.id) ?? null;

      return {
        id: patient.id,
        fullName: patient.full_name,
        latestVitals,
        previousVitals: previousVitalsByPatient.get(patient.id) ?? null,
        risk: calculateRiskFromVitals(latestVitals),
        alertsCount: alertsCountByPatient.get(patient.id) ?? 0,
        medicationsCount: medicationsCountByPatient.get(patient.id) ?? 0,
        activeCarePlansCount: activeCarePlansByPatient.get(patient.id) ?? 0,
        needsReviewCarePlansCount:
          needsReviewCarePlansByPatient.get(patient.id) ?? 0,
        followUp: followUpsByPatient.get(patient.id) ?? null,
      } satisfies AssistantProviderPatient;
    })
    .sort((left, right) => {
      const priorityDifference =
        riskPriority[left.risk.level] - riskPriority[right.risk.level];

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      return (left.fullName ?? "").localeCompare(right.fullName ?? "");
    });

  return {
    viewerId: userId,
    role: "provider",
    fullName,
    assistantName: assistantBrand.name,
    assistantSubtitle: assistantBrand.subtitle,
    patients: providerPatients,
    totalAlertsCount: providerPatients.reduce(
      (total, patient) => total + patient.alertsCount,
      0,
    ),
    activeCarePlansCount: providerPatients.reduce(
      (total, patient) => total + patient.activeCarePlansCount,
      0,
    ),
    needsReviewCarePlansCount: providerPatients.reduce(
      (total, patient) => total + patient.needsReviewCarePlansCount,
      0,
    ),
    overdueFollowUpsCount: providerPatients.filter(
      (patient) => patient.followUp?.isOverdue,
    ).length,
    patientsWithoutMedicationsCount: providerPatients.filter(
      (patient) => patient.medicationsCount === 0,
    ).length,
    patientsWithoutCarePlansCount: providerPatients.filter(
      (patient) =>
        patient.activeCarePlansCount === 0 &&
        patient.needsReviewCarePlansCount === 0,
    ).length,
  } satisfies AssistantProviderSnapshot;
}

export async function fetchAssistantSnapshot(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.role === "provider") {
    return buildProviderSnapshot(supabase, userId, profile.full_name ?? null);
  }

  return buildPatientSnapshot(supabase, userId, profile?.full_name ?? null);
}
