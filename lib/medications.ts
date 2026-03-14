import { SupabaseClient } from "@supabase/supabase-js";

export type MedicationRecord = {
  id: string;
  medication_name: string;
  dosage: string | null;
  frequency: string | null;
  notes: string | null;
  created_at: string | null;
  takenToday: boolean;
  takenAt: string | null;
};

export type MedicationAdherenceSummary = {
  totalMedications: number;
  takenToday: number;
  pendingToday: number;
  adherenceRate: number;
};

export function getCurrentUtcDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function normalizeMedicationRows(
  medications:
    | Array<{
        id: string;
        medication_name: string;
        dosage: string | null;
        frequency: string | null;
        notes: string | null;
        created_at: string | null;
      }>
    | null,
) {
  return medications ?? [];
}

export async function fetchPatientMedications(
  supabase: SupabaseClient,
  patientId: string,
) {
  let { data: medications } = await supabase
    .from("medications")
    .select("id, medication_name, dosage, frequency, notes, created_at")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });

  if (!medications) {
    const fallbackResponse = await supabase
      .from("medications")
      .select("id, medicine_name, dosage, frequency, notes, created_at")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });

    medications =
      fallbackResponse.data?.map((medication) => ({
        ...medication,
        medication_name: medication.medicine_name,
      })) ?? null;
  }

  if (!medications?.length) {
    const legacyResponse = await supabase
      .from("medications")
      .select("id, name, dosage, frequency, notes, created_at")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });

    medications =
      legacyResponse.data?.map((medication) => ({
        ...medication,
        medication_name: medication.name,
      })) ?? medications;
  }

  const todayKey = getCurrentUtcDateKey();
  const { data: adherenceRows } = await supabase
    .from("medication_adherence")
    .select("medication_id, taken_at")
    .eq("patient_id", patientId)
    .eq("taken_on", todayKey);

  const adherenceByMedicationId = new Map<string, string | null>();

  for (const row of adherenceRows ?? []) {
    adherenceByMedicationId.set(row.medication_id, row.taken_at);
  }

  return normalizeMedicationRows(medications).map((medication) => ({
    ...medication,
    takenToday: adherenceByMedicationId.has(medication.id),
    takenAt: adherenceByMedicationId.get(medication.id) ?? null,
  })) satisfies MedicationRecord[];
}

export function getMedicationAdherenceSummary(
  medications: MedicationRecord[],
) {
  const totalMedications = medications.length;
  const takenToday = medications.filter((medication) => medication.takenToday).length;
  const pendingToday = totalMedications - takenToday;
  const adherenceRate =
    totalMedications > 0 ? Math.round((takenToday / totalMedications) * 100) : 0;

  return {
    totalMedications,
    takenToday,
    pendingToday,
    adherenceRate,
  } satisfies MedicationAdherenceSummary;
}
