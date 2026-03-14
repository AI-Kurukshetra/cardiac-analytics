import { LatestVitals } from "@/components/dashboard/types";
import { RiskAssessment } from "@/lib/risk";

type HealthSummaryInput = {
  latestVitals: LatestVitals | null;
  risk: RiskAssessment;
  alertTypes: string[];
};

export type HealthSummary = {
  patientSummary: string;
  providerSummary: string;
};

function getPatientStatus(risk: RiskAssessment, alertTypes: string[]) {
  if (risk.level === "high" || alertTypes.length >= 2) {
    return "Your latest readings look elevated and should be reviewed soon.";
  }

  if (risk.level === "medium" || alertTypes.length === 1) {
    return "Your latest readings show a few values that are worth watching.";
  }

  if (risk.level === "low") {
    return "Your latest readings look stable overall.";
  }

  return "There is not enough data yet to describe your current health trend.";
}

function getPatientAction(
  vitals: LatestVitals,
  risk: RiskAssessment,
  alertTypes: string[],
) {
  if (risk.level === "high" || alertTypes.includes("high_blood_pressure")) {
    return "Please keep monitoring symptoms and contact your care team if you feel worse.";
  }

  if (
    risk.level === "medium" ||
    alertTypes.includes("high_heart_rate") ||
    alertTypes.includes("low_blood_pressure")
  ) {
    return "A repeat reading and symptom check would be a good next step.";
  }

  if (vitals.symptoms?.trim()) {
    return "Your symptoms note is saved with this reading for follow-up.";
  }

  return "Keep following your current care plan and continue regular monitoring.";
}

export function generateHealthSummary({
  latestVitals,
  risk,
  alertTypes,
}: HealthSummaryInput): HealthSummary {
  if (!latestVitals) {
    return {
      patientSummary:
        "No health summary is available yet because there is no vitals reading on file.",
      providerSummary:
        "No clinical summary available. Latest vitals have not been recorded for this patient.",
    };
  }

  const hrNotes: string[] = [];
  const bpNotes: string[] = [];

  if (latestVitals.heart_rate > 120) {
    hrNotes.push("tachycardic");
  } else if (latestVitals.heart_rate < 60) {
    hrNotes.push("bradycardic");
  } else {
    hrNotes.push("heart rate within demo target range");
  }

  if (latestVitals.systolic_bp > 180 || latestVitals.diastolic_bp > 110) {
    bpNotes.push("severely elevated blood pressure");
  } else if (latestVitals.systolic_bp < 90) {
    bpNotes.push("low systolic pressure");
  } else {
    bpNotes.push("blood pressure without severe alert thresholds");
  }

  const patientSummary = [
    getPatientStatus(risk, alertTypes),
    `Heart rate is ${latestVitals.heart_rate} bpm and blood pressure is ${latestVitals.systolic_bp}/${latestVitals.diastolic_bp} mmHg.`,
    latestVitals.weight !== null
      ? `Recorded weight is ${latestVitals.weight} kg.`
      : null,
    latestVitals.symptoms?.trim()
      ? `Symptoms noted: ${latestVitals.symptoms.trim()}.`
      : null,
    getPatientAction(latestVitals, risk, alertTypes),
  ]
    .filter(Boolean)
    .join(" ");

  const providerSummary = [
    `Latest vitals indicate ${risk.level} risk (score ${risk.score}).`,
    `HR ${latestVitals.heart_rate} bpm, BP ${latestVitals.systolic_bp}/${latestVitals.diastolic_bp} mmHg${latestVitals.weight !== null ? `, weight ${latestVitals.weight} kg` : ""}.`,
    `Clinical impression: ${hrNotes.join(", ")}; ${bpNotes.join(", ")}.`,
    alertTypes.length
      ? `Triggered alerts: ${alertTypes
          .map((alertType) => alertType.replaceAll("_", " "))
          .join(", ")}.`
      : "No active alert rules triggered from the latest reading.",
    latestVitals.symptoms?.trim()
      ? `Patient-reported symptoms: ${latestVitals.symptoms.trim()}.`
      : "No patient-reported symptoms documented in the latest entry.",
  ].join(" ");

  return {
    patientSummary,
    providerSummary,
  };
}
