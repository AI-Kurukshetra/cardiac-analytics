import { PatientFollowUp } from "@/lib/follow-ups";
import { HealthSummary } from "@/lib/health-summary";
import { MedicationAdherenceSummary, MedicationRecord } from "@/lib/medications";
import { RiskAssessment } from "@/lib/risk";

export type AssistantIntent =
  | "health_summary"
  | "latest_vitals"
  | "risk_level"
  | "alerts"
  | "medications"
  | "care_plans"
  | "trend_analysis"
  | "follow_up_guidance"
  | "fallback_general_help";

export type AssistantVitals = {
  id?: number;
  heart_rate: number;
  systolic_bp: number;
  diastolic_bp: number;
  weight: number | null;
  symptoms?: string | null;
  created_at: string | null;
};

export type AssistantAlert = {
  id: number;
  alert_type: string;
  title: string;
  message: string;
  vitals_created_at: string | null;
  created_at: string | null;
};

export type AssistantCarePlan = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  next_review_date: string | null;
  created_at: string | null;
};

export type AssistantPatientSnapshot = {
  viewerId: string;
  role: "patient";
  fullName: string | null;
  assistantName: string;
  assistantSubtitle: string;
  latestVitals: AssistantVitals | null;
  previousVitals: AssistantVitals | null;
  vitalsHistory: AssistantVitals[];
  risk: RiskAssessment;
  alerts: AssistantAlert[];
  medications: MedicationRecord[];
  medicationAdherence: MedicationAdherenceSummary;
  carePlans: AssistantCarePlan[];
  followUp: PatientFollowUp | null;
  healthSummary: HealthSummary;
};

export type AssistantProviderPatient = {
  id: string;
  fullName: string | null;
  latestVitals: AssistantVitals | null;
  previousVitals: AssistantVitals | null;
  risk: RiskAssessment;
  alertsCount: number;
  medicationsCount: number;
  activeCarePlansCount: number;
  needsReviewCarePlansCount: number;
  followUp: PatientFollowUp | null;
};

export type AssistantProviderSnapshot = {
  viewerId: string;
  role: "provider";
  fullName: string | null;
  assistantName: string;
  assistantSubtitle: string;
  patients: AssistantProviderPatient[];
  totalAlertsCount: number;
  activeCarePlansCount: number;
  needsReviewCarePlansCount: number;
  overdueFollowUpsCount: number;
  patientsWithoutMedicationsCount: number;
  patientsWithoutCarePlansCount: number;
};

export type AssistantSnapshot =
  | AssistantPatientSnapshot
  | AssistantProviderSnapshot;
