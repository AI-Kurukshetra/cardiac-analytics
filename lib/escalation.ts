import { RiskAssessment } from "@/lib/risk";

export type EscalationBannerContent = {
  title: string;
  message: string;
  action: string;
};

type ProviderEscalationPatient = {
  full_name: string | null;
  risk: RiskAssessment;
  alertsCount: number;
};

function formatAlertTypes(alertTypes: string[]) {
  if (!alertTypes.length) {
    return "the highest demo risk range";
  }

  return alertTypes.map((alertType) => alertType.replaceAll("_", " ")).join(", ");
}

export function getPatientEscalation(
  risk: RiskAssessment,
  alertTypes: string[],
): EscalationBannerContent | null {
  if (risk.level !== "high") {
    return null;
  }

  return {
    title: "Critical escalation",
    message: `Your latest vitals triggered ${formatAlertTypes(alertTypes)} and should be treated as urgent in this demo.`,
    action:
      "Recommended next action: contact your care team now and seek urgent evaluation if symptoms are getting worse.",
  };
}

export function getProviderEscalation(
  patients: ProviderEscalationPatient[],
): EscalationBannerContent | null {
  const criticalPatients = patients.filter((patient) => patient.risk.level === "high");

  if (!criticalPatients.length) {
    return null;
  }

  const patientNames = criticalPatients
    .slice(0, 3)
    .map((patient) => patient.full_name ?? "Unnamed patient")
    .join(", ");
  const additionalPatientsCount = criticalPatients.length - Math.min(criticalPatients.length, 3);
  const alertDrivenCount = criticalPatients.filter(
    (patient) => patient.alertsCount > 0,
  ).length;

  return {
    title: "Critical escalation",
    message: `${criticalPatients.length} patient${criticalPatients.length === 1 ? "" : "s"} currently in the highest risk range${alertDrivenCount ? ` with ${alertDrivenCount} alert-linked case${alertDrivenCount === 1 ? "" : "s"}` : ""}: ${patientNames}${additionalPatientsCount > 0 ? ` and ${additionalPatientsCount} more` : ""}.`,
    action:
      "Recommended next action: contact these patients now and arrange urgent clinical review.",
  };
}
