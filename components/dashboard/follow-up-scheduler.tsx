"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type FollowUpSchedulerProps = {
  patientId: string;
  initialDate: string | null | undefined;
};

export function FollowUpScheduler({
  patientId,
  initialDate,
}: FollowUpSchedulerProps) {
  const router = useRouter();
  const supabase = createClient();
  const [nextFollowUpDate, setNextFollowUpDate] = useState(initialDate ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!nextFollowUpDate) {
      setError("Choose a follow-up date.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError(userError?.message ?? "You must be signed in to schedule follow-up.");
      setLoading(false);
      return;
    }

    const { error: upsertError } = await supabase.from("follow_ups").upsert(
      {
        patient_id: patientId,
        provider_id: user.id,
        next_follow_up_date: nextFollowUpDate,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "patient_id" },
    );

    if (upsertError) {
      setError(upsertError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.refresh();
  }

  return (
    <form className="space-y-2" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="date"
          value={nextFollowUpDate}
          onChange={(event) => setNextFollowUpDate(event.target.value)}
          className="field-input h-11 min-w-0 flex-1"
        />
        <button type="submit" disabled={loading} className="primary-btn h-11">
          {loading ? "Saving..." : "Set follow-up"}
        </button>
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </form>
  );
}
