"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function NewVitalsForm() {
  const supabase = createClient();
  const [heartRate, setHeartRate] = useState("");
  const [systolicBp, setSystolicBp] = useState("");
  const [diastolicBp, setDiastolicBp] = useState("");
  const [weight, setWeight] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<"save" | "demo" | null>(
    null,
  );

  async function getSignedInUser() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error(userError?.message ?? "You must be signed in to add vitals.");
    }

    return user;
  }

  async function insertVitalsEntry(values: {
    patientId: string;
    heartRate: number;
    systolicBp: number;
    diastolicBp: number;
    weight: number;
    symptoms: string | null;
    createdAt?: string;
  }) {
    const { error: insertError } = await supabase.from("vitals").insert({
      patient_id: values.patientId,
      heart_rate: values.heartRate,
      systolic_bp: values.systolicBp,
      diastolic_bp: values.diastolicBp,
      weight: values.weight,
      symptoms: values.symptoms,
      created_at: values.createdAt,
    });

    if (insertError) {
      throw new Error(insertError.message);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoadingAction("save");
    setError(null);

    try {
      const user = await getSignedInUser();

      await insertVitalsEntry({
        patientId: user.id,
        heartRate: Number(heartRate),
        systolicBp: Number(systolicBp),
        diastolicBp: Number(diastolicBp),
        weight: Number(weight),
        symptoms: symptoms.trim() || null,
      });

      setHeartRate("");
      setSystolicBp("");
      setDiastolicBp("");
      setWeight("");
      setSymptoms("");
      window.location.assign("/dashboard?success=vitals-saved");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save vitals.",
      );
      setLoadingAction(null);
      return;
    }
  }

  async function handleInsertDemoVitals() {
    setLoadingAction("demo");
    setError(null);

    try {
      const user = await getSignedInUser();
      const now = Date.now();

      await insertVitalsEntry({
        patientId: user.id,
        heartRate: 72,
        systolicBp: 118,
        diastolicBp: 78,
        weight: 68.4,
        symptoms: "Feeling well. Routine baseline reading for demo.",
        createdAt: new Date(now - 60 * 60 * 1000).toISOString(),
      });

      await insertVitalsEntry({
        patientId: user.id,
        heartRate: 132,
        systolicBp: 188,
        diastolicBp: 116,
        weight: 69.1,
        symptoms: "Shortness of breath and dizziness. Demo reading to trigger alerts.",
        createdAt: new Date(now).toISOString(),
      });

      window.location.assign("/dashboard?success=demo-vitals-loaded");
    } catch (demoError) {
      setError(
        demoError instanceof Error
          ? demoError.message
          : "Unable to insert demo vitals.",
      );
      setLoadingAction(null);
    }
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
            className="field-input"
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
            className="field-input"
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
            className="field-input"
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
            className="field-input"
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
          className="field-textarea"
          placeholder="Describe any symptoms or notes"
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
          disabled={loadingAction !== null}
          className="primary-btn flex-1"
        >
          {loadingAction === "save" ? "Saving..." : "Save vitals"}
        </button>

        <button
          type="button"
          onClick={handleInsertDemoVitals}
          disabled={loadingAction !== null}
          className="flex h-12 flex-1 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-medium text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:border-emerald-100 disabled:bg-emerald-50 disabled:text-emerald-400"
        >
          {loadingAction === "demo" ? "Loading demo data..." : "Insert demo vitals"}
        </button>

        <Link
          href="/dashboard"
          className="secondary-btn"
        >
          Cancel
        </Link>
      </div>

      <p className="text-sm leading-6 text-slate-500">
        Demo helper inserts one normal reading and one abnormal reading that
        triggers alerts.
      </p>
    </form>
  );
}
