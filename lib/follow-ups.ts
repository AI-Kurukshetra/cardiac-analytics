import { SupabaseClient } from "@supabase/supabase-js";
import { getCurrentUtcDateKey } from "@/lib/medications";

export type PatientFollowUp = {
  id: number;
  patient_id: string;
  provider_id: string;
  next_follow_up_date: string;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  isOverdue: boolean;
  isToday: boolean;
};

function withFollowUpStatus(followUp: {
  id: number;
  patient_id: string;
  provider_id: string;
  next_follow_up_date: string;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}) {
  const todayKey = getCurrentUtcDateKey();

  return {
    ...followUp,
    isOverdue: followUp.next_follow_up_date < todayKey,
    isToday: followUp.next_follow_up_date === todayKey,
  } satisfies PatientFollowUp;
}

export async function fetchPatientFollowUp(
  supabase: SupabaseClient,
  patientId: string,
) {
  const { data } = await supabase
    .from("follow_ups")
    .select(
      "id, patient_id, provider_id, next_follow_up_date, notes, created_at, updated_at",
    )
    .eq("patient_id", patientId)
    .maybeSingle();

  return data ? withFollowUpStatus(data) : null;
}

export async function fetchFollowUpsByPatientIds(
  supabase: SupabaseClient,
  patientIds: string[],
) {
  if (!patientIds.length) {
    return new Map<string, PatientFollowUp>();
  }

  const { data } = await supabase
    .from("follow_ups")
    .select(
      "id, patient_id, provider_id, next_follow_up_date, notes, created_at, updated_at",
    )
    .in("patient_id", patientIds);

  return new Map(
    (data ?? []).map((followUp) => [
      followUp.patient_id,
      withFollowUpStatus(followUp),
    ]),
  );
}
