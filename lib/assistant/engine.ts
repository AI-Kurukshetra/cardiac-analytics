import {
  AssistantCarePlan,
  AssistantIntent,
  AssistantProviderPatient,
  AssistantSnapshot,
  AssistantVitals,
} from "@/lib/assistant/types";
import { calculateRiskFromVitals } from "@/lib/risk";

type TrendSummary = {
  overall: "improving" | "stable" | "worsening";
  details: string[];
};

const patientSuggestions = [
  "How is my heart health?",
  "Show latest vitals",
  "Do I have alerts?",
  "What should I do next?",
];

const providerSuggestions = [
  "Summarize my patient panel",
  "Which patients are highest risk?",
  "Do we have active alerts?",
  "What needs attention next?",
];

const patientFallbackExamples = [
  "How is my heart health?",
  "Show latest vitals",
  "Do I have alerts?",
  "What should I do next?",
];

const providerFallbackExamples = [
  "Summarize my patient panel",
  "Which patients are highest risk?",
  "Do we have active alerts?",
  "Which follow-ups are overdue?",
];

function formatRiskLevel(level: string) {
  return level === "unknown"
    ? "Unknown Risk"
    : `${level.charAt(0).toUpperCase()}${level.slice(1)} Risk`;
}

function formatDateTime(date: string | null | undefined) {
  if (!date) {
    return "not recorded yet";
  }

  return new Date(date).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDate(date: string | null | undefined) {
  if (!date) {
    return "not scheduled";
  }

  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatWeight(weight: number | null | undefined) {
  if (weight === null || weight === undefined) {
    return "not recorded";
  }

  return `${weight} kg`;
}

function formatList(items: string[]) {
  if (!items.length) {
    return "";
  }

  if (items.length === 1) {
    return items[0];
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function getRiskAwareNextStep(riskLevel: string, alertsCount: number) {
  if (riskLevel === "high" || alertsCount >= 2) {
    return "Recommended next step: repeat vitals promptly and consider provider review, especially if symptoms are new or worsening.";
  }

  if (riskLevel === "medium" || alertsCount === 1) {
    return "Recommended next step: keep monitoring closely, review medications and symptoms, and consider follow-up if the next reading stays elevated.";
  }

  return "Recommended next step: continue routine monitoring and keep following the current care plan.";
}

function describeTrend(
  latest: AssistantVitals | null,
  previous: AssistantVitals | null,
) {
  if (!latest || !previous) {
    return null;
  }

  const latestRisk = calculateRiskFromVitals(latest);
  const previousRisk = calculateRiskFromVitals(previous);
  let overall: TrendSummary["overall"] = "stable";

  if (latestRisk.score > previousRisk.score) {
    overall = "worsening";
  } else if (latestRisk.score < previousRisk.score) {
    overall = "improving";
  }

  const details: string[] = [];
  const heartRateDelta = latest.heart_rate - previous.heart_rate;
  const systolicDelta = latest.systolic_bp - previous.systolic_bp;
  const diastolicDelta = latest.diastolic_bp - previous.diastolic_bp;
  const weightDelta =
    latest.weight !== null && previous.weight !== null
      ? Number((latest.weight - previous.weight).toFixed(1))
      : null;

  if (Math.abs(heartRateDelta) <= 4) {
    details.push(`heart rate is stable at ${latest.heart_rate} bpm`);
  } else if (heartRateDelta > 0) {
    details.push(
      `heart rate increased from ${previous.heart_rate} to ${latest.heart_rate} bpm`,
    );
  } else {
    details.push(
      `heart rate decreased from ${previous.heart_rate} to ${latest.heart_rate} bpm`,
    );
  }

  if (Math.abs(systolicDelta) <= 5 && Math.abs(diastolicDelta) <= 5) {
    details.push(
      `blood pressure is stable near ${latest.systolic_bp}/${latest.diastolic_bp} mmHg`,
    );
  } else {
    const direction =
      systolicDelta > 0 || diastolicDelta > 0 ? "rose" : "came down";
    details.push(
      `blood pressure ${direction} from ${previous.systolic_bp}/${previous.diastolic_bp} to ${latest.systolic_bp}/${latest.diastolic_bp} mmHg`,
    );
  }

  if (weightDelta === null) {
    details.push("weight change cannot be compared yet");
  } else if (Math.abs(weightDelta) <= 0.5) {
    details.push(`weight is stable at ${latest.weight} kg`);
  } else if (weightDelta > 0) {
    details.push(`weight increased by ${weightDelta} kg`);
  } else {
    details.push(`weight decreased by ${Math.abs(weightDelta)} kg`);
  }

  return {
    overall,
    details,
  } satisfies TrendSummary;
}

function detectProviderPriorityPatients(patients: AssistantProviderPatient[]) {
  return patients
    .filter((patient) => patient.risk.level === "high" || patient.alertsCount > 0)
    .slice(0, 3);
}

function getPatientCarePlanSummary(carePlans: AssistantCarePlan[]) {
  if (!carePlans.length) {
    return "No care plans are on file right now, which may indicate a care-plan gap.";
  }

  const activePlans = carePlans.filter((carePlan) => carePlan.status === "active");
  const needsReview = carePlans.filter(
    (carePlan) => carePlan.status === "needs_review",
  );
  const nextReview = carePlans.find((carePlan) => carePlan.next_review_date);

  return [
    `${carePlans.length} care plan${carePlans.length === 1 ? "" : "s"} recorded, with ${activePlans.length} active and ${needsReview.length} marked for review.`,
    nextReview
      ? `Next listed review is ${formatDate(nextReview.next_review_date)} for ${nextReview.title}.`
      : "No upcoming care plan review date is scheduled yet.",
  ].join(" ");
}

function getCapabilities(role: AssistantSnapshot["role"]) {
  return role === "provider"
    ? "I can summarize your patient panel, highlight risk and alerts, review trend changes, and point out follow-up, medication, or care-plan gaps."
    : "I can summarize your latest vitals, explain your risk level, review alerts, medications, care plans, and highlight what may need attention next.";
}

function getFallbackExamples(role: AssistantSnapshot["role"]) {
  return role === "provider"
    ? providerFallbackExamples
    : patientFallbackExamples;
}

export function detectAssistantIntent(input: string): AssistantIntent {
  const normalized = input.toLowerCase();

  if (
    /\b(show|latest|recent|current)\b/.test(normalized) &&
    /\b(vitals|reading|readings|heart rate|blood pressure|bp)\b/.test(normalized)
  ) {
    return "latest_vitals";
  }

  if (/\b(alert|alerts|warning|warnings)\b/.test(normalized)) {
    return "alerts";
  }

  if (/\b(medication|medications|medicine|medicines|drug|drugs|pill|pills)\b/.test(normalized)) {
    return "medications";
  }

  if (/\b(care plan|care plans|plan|plans)\b/.test(normalized)) {
    return "care_plans";
  }

  if (
    /\b(changed|change|trend|trends|compare|comparison|improving|worsening|stable|last reading|previous)\b/.test(
      normalized,
    )
  ) {
    return "trend_analysis";
  }

  if (
    /\b(follow up|follow-up|next step|next steps|pay attention|attention|what should i do|do i need follow)\b/.test(
      normalized,
    )
  ) {
    return "follow_up_guidance";
  }

  if (/\b(risk|risk level|safe|danger)\b/.test(normalized)) {
    return "risk_level";
  }

  if (
    /\b(summary|summarize|overview|overall|condition|heart health|health|panel)\b/.test(
      normalized,
    )
  ) {
    return "health_summary";
  }

  return "fallback_general_help";
}

function generatePatientResponse(
  snapshot: Extract<AssistantSnapshot, { role: "patient" }>,
  intent: AssistantIntent,
) {
  const trend = describeTrend(snapshot.latestVitals, snapshot.previousVitals);
  const latestVitals = snapshot.latestVitals;
  const alertsCount = snapshot.alerts.length;
  const adherence = snapshot.medicationAdherence;

  switch (intent) {
    case "latest_vitals":
      if (!latestVitals) {
        return [
          "I do not have any vitals on file yet.",
          "Summary: there is no heart rate or blood pressure reading available to interpret right now.",
          "Recommended next step: add a vitals reading so I can summarize your current status.",
        ].join("\n\n");
      }

      return [
        `Your latest vitals are ${latestVitals.heart_rate} bpm and ${latestVitals.systolic_bp}/${latestVitals.diastolic_bp} mmHg.`,
        `Summary: the reading was recorded ${formatDateTime(latestVitals.created_at)}. Weight is ${formatWeight(latestVitals.weight)}${latestVitals.symptoms?.trim() ? `, and your note says "${latestVitals.symptoms.trim()}".` : "."}`,
        getRiskAwareNextStep(snapshot.risk.level, alertsCount),
      ].join("\n\n");

    case "risk_level":
      return [
        `Your current status suggests ${formatRiskLevel(snapshot.risk.level)}.`,
        `Summary: ${snapshot.healthSummary.patientSummary}${alertsCount ? ` You also have ${alertsCount} active alert${alertsCount === 1 ? "" : "s"}.` : " There are no active alerts right now."}`,
        getRiskAwareNextStep(snapshot.risk.level, alertsCount),
      ].join("\n\n");

    case "alerts":
      if (!alertsCount) {
        return [
          "You do not have any active alerts right now.",
          "Summary: your latest reading did not trigger alert rules in this demo view.",
          "Recommended next step: keep monitoring and add a fresh reading if symptoms change.",
        ].join("\n\n");
      }

      return [
        `You currently have ${alertsCount} active alert${alertsCount === 1 ? "" : "s"}.`,
        `Summary: ${formatList(snapshot.alerts.slice(0, 3).map((alert) => alert.title))}. These alerts may indicate readings that need closer monitoring rather than a diagnosis.`,
        getRiskAwareNextStep(snapshot.risk.level, alertsCount),
      ].join("\n\n");

    case "medications":
      if (!snapshot.medications.length) {
        return [
          "I do not see any medications listed right now.",
          "Summary: that may indicate a medication list gap in the app rather than a clinical change.",
          "Recommended next step: review your medication list so your care team has the latest information.",
        ].join("\n\n");
      }

      return [
        `You have ${snapshot.medications.length} medication${snapshot.medications.length === 1 ? "" : "s"} on file.`,
        `Summary: ${formatList(snapshot.medications.slice(0, 3).map((medication) => medication.medication_name))}. ${adherence.takenToday} marked taken today and ${adherence.pendingToday} still pending, with ${adherence.adherenceRate}% adherence for today.`,
        "Recommended next step: confirm any pending doses in the app and review with your provider if the list looks incomplete.",
      ].join("\n\n");

    case "care_plans":
      return [
        snapshot.carePlans.length
          ? `You have ${snapshot.carePlans.length} care plan${snapshot.carePlans.length === 1 ? "" : "s"} available.`
          : "I do not see a care plan on file yet.",
        `Summary: ${getPatientCarePlanSummary(snapshot.carePlans)}`,
        snapshot.carePlans.length
          ? "Recommended next step: keep following the active plan and review any item marked as needs review."
          : "Recommended next step: consider asking your care team to add or confirm a current care plan in the app.",
      ].join("\n\n");

    case "trend_analysis":
      if (!trend) {
        return [
          "I need at least two vitals readings to compare changes over time.",
          "Summary: once another reading is available, I can show whether heart rate, blood pressure, and weight look improving, stable, or worsening.",
          "Recommended next step: record another vitals entry for a trend comparison.",
        ].join("\n\n");
      }

      return [
        `Compared with your previous reading, the recent trend looks ${trend.overall}.`,
        `Summary: ${formatList(trend.details)}.`,
        getRiskAwareNextStep(snapshot.risk.level, alertsCount),
      ].join("\n\n");

    case "follow_up_guidance":
      return [
        snapshot.followUp?.isOverdue
          ? "A follow-up appears overdue."
          : snapshot.followUp?.isToday
            ? "A follow-up is due today."
            : "Your next step depends on your latest readings and follow-up status.",
        `Summary: current status is ${formatRiskLevel(snapshot.risk.level)}${snapshot.followUp ? ` and the next follow-up is ${formatDate(snapshot.followUp.next_follow_up_date)}.` : ", and no follow-up is scheduled in the app yet."} ${alertsCount ? `There are ${alertsCount} active alert${alertsCount === 1 ? "" : "s"} to keep in view.` : ""}`,
        snapshot.followUp?.isOverdue || snapshot.risk.level === "high"
          ? "Recommended next step: consider provider review soon, especially if symptoms are present or readings stay elevated."
          : "Recommended next step: keep monitoring, stay on plan, and use the next scheduled follow-up to review any changes.",
      ].join("\n\n");

    case "health_summary":
      return [
        latestVitals
          ? `Your overall picture currently suggests ${formatRiskLevel(snapshot.risk.level)}.`
          : "I do not have enough vitals data yet for a full heart health summary.",
        `Summary: ${snapshot.healthSummary.patientSummary}${trend ? ` Compared with the previous reading, the trend looks ${trend.overall}.` : ""}`,
        latestVitals
          ? getRiskAwareNextStep(snapshot.risk.level, alertsCount)
          : "Recommended next step: add a vitals reading so I can summarize your current condition more clearly.",
      ].join("\n\n");

    case "fallback_general_help":
    default:
      return [
        "I couldn't match that to one of my supported health-data tasks yet.",
        `Summary: ${getCapabilities(snapshot.role)}`,
        `Try asking: ${formatList(getFallbackExamples(snapshot.role).map((item) => `"${item}"`))}.`,
      ].join("\n\n");
  }
}

function generateProviderResponse(
  snapshot: Extract<AssistantSnapshot, { role: "provider" }>,
  intent: AssistantIntent,
) {
  const highRiskPatients = snapshot.patients.filter(
    (patient) => patient.risk.level === "high",
  );
  const mediumRiskPatients = snapshot.patients.filter(
    (patient) => patient.risk.level === "medium",
  );
  const priorityPatients = detectProviderPriorityPatients(snapshot.patients);

  switch (intent) {
    case "latest_vitals": {
      const latestUpdatedPatient = [...snapshot.patients]
        .filter((patient) => patient.latestVitals?.created_at)
        .sort((left, right) => {
          const leftTime = new Date(left.latestVitals?.created_at ?? 0).getTime();
          const rightTime = new Date(right.latestVitals?.created_at ?? 0).getTime();

          return rightTime - leftTime;
        })[0];

      return [
        latestUpdatedPatient?.latestVitals
          ? `The most recent charted vitals are for ${latestUpdatedPatient.fullName ?? "an unnamed patient"}.`
          : "No patient has charted vitals yet.",
        latestUpdatedPatient?.latestVitals
          ? `Summary: recorded ${formatDateTime(latestUpdatedPatient.latestVitals.created_at)} with HR ${latestUpdatedPatient.latestVitals.heart_rate} bpm and BP ${latestUpdatedPatient.latestVitals.systolic_bp}/${latestUpdatedPatient.latestVitals.diastolic_bp} mmHg. No individual patient is selected, so this is a panel-level view.`
          : "Summary: the provider panel does not yet have vitals to review.",
        highRiskPatients.length
          ? `Recommended next step: review ${formatList(highRiskPatients.slice(0, 3).map((patient) => patient.fullName ?? "Unnamed patient"))} first because they currently sit in the highest risk range.`
          : "Recommended next step: continue routine panel review and watch for new charted readings.",
      ].join("\n\n");
    }

    case "risk_level":
      return [
        `Your panel currently has ${highRiskPatients.length} high-risk patient${highRiskPatients.length === 1 ? "" : "s"}.`,
        `Summary: ${mediumRiskPatients.length} additional patient${mediumRiskPatients.length === 1 ? "" : "s"} are medium risk, and ${snapshot.totalAlertsCount} active alert${snapshot.totalAlertsCount === 1 ? "" : "s"} are distributed across the panel.`,
        highRiskPatients.length
          ? `Recommended next step: prioritize review of ${formatList(highRiskPatients.slice(0, 3).map((patient) => patient.fullName ?? "Unnamed patient"))}.`
          : "Recommended next step: keep medium-risk and alert-linked patients under routine surveillance.",
      ].join("\n\n");

    case "alerts":
      return [
        snapshot.totalAlertsCount
          ? `There are ${snapshot.totalAlertsCount} active alerts across the patient panel.`
          : "There are no active alerts in the patient panel right now.",
        snapshot.totalAlertsCount
          ? `Summary: highest-priority alert-linked patients include ${formatList(priorityPatients.map((patient) => `${patient.fullName ?? "Unnamed patient"} (${patient.alertsCount} alerts)`))}.`
          : "Summary: no alert rules are currently firing based on the latest stored data.",
        snapshot.totalAlertsCount
          ? "Recommended next step: review the alert-linked patients alongside their latest vitals and follow-up status."
          : "Recommended next step: continue routine monitoring and watch for new abnormal readings.",
      ].join("\n\n");

    case "medications": {
      const totalMedicationRecords = snapshot.patients.reduce(
        (total, patient) => total + patient.medicationsCount,
        0,
      );

      return [
        `The panel has ${totalMedicationRecords} medication record${totalMedicationRecords === 1 ? "" : "s"} on file.`,
        `Summary: ${snapshot.patientsWithoutMedicationsCount} patient${snapshot.patientsWithoutMedicationsCount === 1 ? "" : "s"} currently have no medications recorded in the app, which may indicate documentation gaps.`,
        "Recommended next step: review patients without medication records and confirm whether those charts need medication reconciliation.",
      ].join("\n\n");
    }

    case "care_plans":
      return [
        `There are ${snapshot.activeCarePlansCount} active care plan${snapshot.activeCarePlansCount === 1 ? "" : "s"} across the panel.`,
        `Summary: ${snapshot.needsReviewCarePlansCount} plan${snapshot.needsReviewCarePlansCount === 1 ? "" : "s"} need review, and ${snapshot.patientsWithoutCarePlansCount} patient${snapshot.patientsWithoutCarePlansCount === 1 ? "" : "s"} have no care plan recorded.`,
        "Recommended next step: check patients with missing or review-needed plans so next actions stay clear in the dashboard.",
      ].join("\n\n");

    case "trend_analysis": {
      const worseningPatients = snapshot.patients
        .map((patient) => ({
          patient,
          trend: describeTrend(patient.latestVitals, patient.previousVitals),
        }))
        .filter(
          (item): item is {
            patient: AssistantProviderPatient;
            trend: TrendSummary;
          } => item.trend !== null,
        )
        .filter((item) => item.trend.overall === "worsening")
        .slice(0, 3);

      return [
        worseningPatients.length
          ? `${worseningPatients.length} patient${worseningPatients.length === 1 ? "" : "s"} show a worsening recent trend.`
          : "No clear worsening trend stands out across patients with at least two readings.",
        worseningPatients.length
          ? `Summary: ${formatList(worseningPatients.map((item) => `${item.patient.fullName ?? "Unnamed patient"}: ${item.trend.details[0]}`))}.`
          : "Summary: recent comparisons look stable or do not yet have enough data for a trend call.",
        worseningPatients.length
          ? "Recommended next step: review those patients first and compare their latest vitals with alerts and follow-up timing."
          : "Recommended next step: continue collecting serial vitals so trend detection stays meaningful.",
      ].join("\n\n");
    }

    case "follow_up_guidance":
      return [
        snapshot.overdueFollowUpsCount
          ? `${snapshot.overdueFollowUpsCount} follow-up${snapshot.overdueFollowUpsCount === 1 ? "" : "s"} are overdue.`
          : "There are no overdue follow-ups in the panel right now.",
        `Summary: ${highRiskPatients.length} patient${highRiskPatients.length === 1 ? "" : "s"} are high risk, ${snapshot.totalAlertsCount} active alert${snapshot.totalAlertsCount === 1 ? "" : "s"} remain open, and no individual patient is selected, so this is a provider overview.`,
        snapshot.overdueFollowUpsCount || highRiskPatients.length
          ? "Recommended next step: review overdue follow-ups and high-risk patients together so outreach happens in priority order."
          : "Recommended next step: keep follow-up dates current and continue regular panel review.",
      ].join("\n\n");

    case "health_summary":
      return [
        `Your provider overview suggests the main attention area is ${highRiskPatients.length ? "high-risk patients and active alerts" : "routine surveillance of the current panel"}.`,
        `Summary: ${snapshot.patients.length} total patients, ${highRiskPatients.length} high risk, ${mediumRiskPatients.length} medium risk, ${snapshot.totalAlertsCount} active alerts, and ${snapshot.overdueFollowUpsCount} overdue follow-up${snapshot.overdueFollowUpsCount === 1 ? "" : "s"}.`,
        highRiskPatients.length || snapshot.overdueFollowUpsCount
          ? `Recommended next step: start with ${formatList(priorityPatients.map((patient) => patient.fullName ?? "Unnamed patient"))} and align vitals review with follow-up scheduling.`
          : "Recommended next step: continue routine review and refresh the panel as new data comes in.",
      ].join("\n\n");

    case "fallback_general_help":
    default:
      return [
        "I couldn't map that request to a supported provider workflow yet.",
        `Summary: ${getCapabilities(snapshot.role)}`,
        `Try asking: ${formatList(getFallbackExamples(snapshot.role).map((item) => `"${item}"`))}.`,
      ].join("\n\n");
  }
}

export function getSuggestionPrompts(role: AssistantSnapshot["role"]) {
  return role === "provider" ? providerSuggestions : patientSuggestions;
}

export function getWelcomeMessage(snapshot: AssistantSnapshot) {
  if (snapshot.role === "provider") {
    return `Hello! I'm ${snapshot.assistantName}. I can summarize your patient panel, explain current risk and alerts, review medications, care plans, follow-ups, and highlight what may need attention next. How can I help you today?`;
  }

  return `Hello! I'm ${snapshot.assistantName}, your cardiac care assistant. I can summarize your latest vitals, explain your risk level, review alerts, medications, care plans, and highlight anything that may need attention. How can I help you today?`;
}

export function generateAssistantResponse(
  snapshot: AssistantSnapshot,
  input: string,
) {
  const intent = detectAssistantIntent(input);

  return snapshot.role === "provider"
    ? generateProviderResponse(snapshot, intent)
    : generatePatientResponse(snapshot, intent);
}
