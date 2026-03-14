"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function NewVitalsForm() {
  const router = useRouter();
  const supabase = createClient();
  const [heartRate, setHeartRate] = useState("");
  const [systolicBp, setSystolicBp] = useState("");
  const [diastolicBp, setDiastolicBp] = useState("");
  const [weight, setWeight] = useState("");
  const [symptoms, setSymptoms] = useState("");
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
      setError(userError?.message ?? "You must be signed in to add vitals.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("vitals").insert({
      patient_id: user.id,
      heart_rate: Number(heartRate),
      systolic_bp: Number(systolicBp),
      diastolic_bp: Number(diastolicBp),
      weight: Number(weight),
      symptoms: symptoms.trim() || null,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.replace("/dashboard?success=vitals-saved");
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-slate-800"
            htmlFor="heart-rate"
          >
            Heart rate
          </label>
          <input
            id="heart-rate"
            type="number"
            inputMode="numeric"
            min="1"
            value={heartRate}
            onChange={(event) => setHeartRate(event.target.value)}
            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            placeholder="72"
            required
          />
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-slate-800"
            htmlFor="weight"
          >
            Weight
          </label>
          <input
            id="weight"
            type="number"
            inputMode="decimal"
            min="1"
            step="0.1"
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            placeholder="68.5"
            required
          />
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-slate-800"
            htmlFor="systolic-bp"
          >
            Systolic BP
          </label>
          <input
            id="systolic-bp"
            type="number"
            inputMode="numeric"
            min="1"
            value={systolicBp}
            onChange={(event) => setSystolicBp(event.target.value)}
            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            placeholder="120"
            required
          />
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-slate-800"
            htmlFor="diastolic-bp"
          >
            Diastolic BP
          </label>
          <input
            id="diastolic-bp"
            type="number"
            inputMode="numeric"
            min="1"
            value={diastolicBp}
            onChange={(event) => setDiastolicBp(event.target.value)}
            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            placeholder="80"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-800" htmlFor="symptoms">
          Symptoms
        </label>
        <textarea
          id="symptoms"
          value={symptoms}
          onChange={(event) => setSymptoms(event.target.value)}
          className="min-h-32 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          placeholder="Describe any symptoms or notes"
        />
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={loading}
          className="flex h-12 flex-1 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {loading ? "Saving..." : "Save vitals"}
        </button>

        <Link
          href="/dashboard"
          className="flex h-12 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
