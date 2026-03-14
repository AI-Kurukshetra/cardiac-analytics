export type RiskLevel = "low" | "medium" | "high" | "unknown";

export type RiskVitals = {
  heart_rate: number;
  systolic_bp: number;
  diastolic_bp: number;
};

export type RiskAssessment = {
  score: number;
  level: RiskLevel;
};

export function calculateRiskFromVitals(
  vitals: RiskVitals | null | undefined,
): RiskAssessment {
  if (!vitals) {
    return {
      score: 0,
      level: "unknown",
    };
  }

  let score = 0;

  if (vitals.heart_rate > 120) {
    score += 2;
  }

  if (vitals.systolic_bp > 180) {
    score += 3;
  }

  if (vitals.systolic_bp < 90) {
    score += 2;
  }

  if (vitals.diastolic_bp > 110) {
    score += 2;
  }

  if (score >= 4) {
    return {
      score,
      level: "high",
    };
  }

  if (score >= 2) {
    return {
      score,
      level: "medium",
    };
  }

  return {
    score,
    level: "low",
  };
}
