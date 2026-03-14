"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function NewMedicationForm() {
  const supabase = createClient();
  const [medicationName, setMedicationName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError(
        userError?.message ?? "You must be signed in to add medications.",
      );
      setLoading(false);
      return;
    }

    const medicationPayload = {
      patient_id: user.id,
      medication_name: medicationName.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      notes: notes.trim() || null,
    };

    let { error: insertError } = await supabase
      .from("medications")
      .insert(medicationPayload);

    if (
      insertError?.message.includes("medication_name") ||
      insertError?.message.includes("medicine_name") ||
      insertError?.message.includes("'medications'") ||
      insertError?.message.includes("schema cache")
    ) {
      let fallbackInsert = await supabase.from("medications").insert({
        patient_id: user.id,
        medicine_name: medicationName.trim(),
        dosage: dosage.trim(),
        frequency: frequency.trim(),
        notes: notes.trim() || null,
      });

      if (
        fallbackInsert.error?.message.includes("name") ||
        fallbackInsert.error?.message.includes("schema cache") ||
        fallbackInsert.error?.message.includes("not-null")
      ) {
        fallbackInsert = await supabase.from("medications").insert({
          patient_id: user.id,
          name: medicationName.trim(),
          dosage: dosage.trim(),
          frequency: frequency.trim(),
          notes: notes.trim() || null,
        });
      }

      insertError = fallbackInsert.error;
    }

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setMedicationName("");
    setDosage("");
    setFrequency("");
    setNotes("");
    setLoading(false);
    window.location.assign("/medications?success=medication-saved");
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-slate-800"
            htmlFor="medication-name"
          >
            Medication name
          </label>
          <input
            id="medication-name"
            type="text"
            value={medicationName}
            onChange={(event) => setMedicationName(event.target.value)}
            className="field-input"
            placeholder="Atorvastatin"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800" htmlFor="dosage">
            Dosage
          </label>
          <input
            id="dosage"
            type="text"
            value={dosage}
            onChange={(event) => setDosage(event.target.value)}
            className="field-input"
            placeholder="20 mg"
            required
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label
            className="text-sm font-medium text-slate-800"
            htmlFor="frequency"
          >
            Frequency
          </label>
          <input
            id="frequency"
            type="text"
            value={frequency}
            onChange={(event) => setFrequency(event.target.value)}
            className="field-input"
            placeholder="Once daily after dinner"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-800" htmlFor="notes">
          Notes
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="field-textarea"
          placeholder="Optional reminders or instructions"
        />
      </div>

      {error ? (
        <p className="banner-error">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={loading}
          className="primary-btn flex-1"
        >
          {loading ? "Saving..." : "Save medication"}
        </button>

        <Link
          href="/dashboard"
          className="secondary-btn"
        >
          Back to dashboard
        </Link>
      </div>
    </form>
  );
}
