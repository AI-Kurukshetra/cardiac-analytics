"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "needs_review", label: "Needs review" },
  { value: "completed", label: "Completed" },
];

export function NewCarePlanForm() {
  const supabase = createClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [nextReviewDate, setNextReviewDate] = useState("");
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
      setError(userError?.message ?? "You must be signed in to add care plans.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("care_plans").insert({
      patient_id: user.id,
      title: title.trim(),
      description: description.trim(),
      status,
      next_review_date: nextReviewDate || null,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setTitle("");
    setDescription("");
    setStatus("active");
    setNextReviewDate("");
    setLoading(false);
    window.location.assign("/care-plans?success=care-plan-saved");
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-800" htmlFor="title">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="field-input"
          placeholder="Daily blood pressure check"
          required
        />
      </div>

      <div className="space-y-2">
        <label
          className="text-sm font-medium text-slate-800"
          htmlFor="description"
        >
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="field-textarea"
          placeholder="Write the plan in simple steps so it is easy to follow."
          required
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800" htmlFor="status">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="field-input"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-slate-800"
            htmlFor="next-review-date"
          >
            Next review date
          </label>
          <input
            id="next-review-date"
            type="date"
            value={nextReviewDate}
            onChange={(event) => setNextReviewDate(event.target.value)}
            className="field-input"
          />
        </div>
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
          {loading ? "Saving..." : "Save care plan"}
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
