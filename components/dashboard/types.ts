import { RiskAssessment } from "@/lib/risk";
import { PatientFollowUp } from "@/lib/follow-ups";

export type LatestVitals = {
  heart_rate: number;
  systolic_bp: number;
  diastolic_bp: number;
  weight: number | null;
  symptoms?: string | null;
  created_at: string | null;
};

export type VitalsTrendPoint = {
  id?: number;
  heart_rate: number;
  systolic_bp: number;
  diastolic_bp: number;
  weight: number | null;
  created_at: string | null;
};

export type ProviderLatestVitals = LatestVitals & {
  patient_id: string;
};

export type ProviderPatient = {
  id: string;
  full_name: string | null;
  latestVitals: ProviderLatestVitals | null;
  risk: RiskAssessment;
  alertsCount: number;
  followUp: PatientFollowUp | null;
};
