"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getCurrentUtcDateKey } from "@/lib/medications";

type MedicationAdherenceButtonProps = {
  medicationId: string;
  takenToday: boolean;
  takenAt: string | null;
};

export function MedicationAdherenceButton({
  medicationId,
  takenToday,
  takenAt,
}: MedicationAdherenceButtonProps) {
  const supabase = createClient();
  const router = useRouter();
  const [isTaken, setIsTaken] = useState(takenToday);
  const [confirmedAt, setConfirmedAt] = useState(takenAt);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function markDoseTaken() {
    if (isTaken || isSaving) {
      return;
    }

    setError(null);
    setIsSaving(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError(userError?.message ?? "You must be signed in to mark a dose.");
      setIsSaving(false);
      return;
    }

    const takenOn = getCurrentUtcDateKey();
    const optimisticTimestamp = new Date().toISOString();
    const { error: insertError } = await supabase
      .from("medication_adherence")
      .insert({
        medication_id: medicationId,
        patient_id: user.id,
        taken_on: takenOn,
      });

    if (
      insertError &&
      !insertError.message.toLowerCase().includes("duplicate") &&
      !insertError.message.toLowerCase().includes("unique")
    ) {
      setError(insertError.message);
      setIsSaving(false);
      return;
    }

    setIsTaken(true);
    setConfirmedAt(confirmedAt ?? optimisticTimestamp);
    setIsSaving(false);
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={markDoseTaken}
        disabled={isTaken || isSaving}
        className={isTaken ? "secondary-btn h-11" : "primary-btn h-11"}
      >
        {isTaken
          ? confirmedAt
            ? `Taken ${new Date(confirmedAt).toLocaleTimeString(undefined, {
                hour: "numeric",
                minute: "2-digit",
              })}`
            : "Taken today"
          : isSaving
            ? "Saving..."
            : "Mark dose as taken"}
      </button>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
