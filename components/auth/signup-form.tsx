"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function SignupForm() {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;

    if (!userId) {
      setError("Account created, but no user id was returned by Supabase.");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      full_name: fullName,
      role,
    });

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    if (!data.session) {
      setMessage(
        "Account created. Check your email to confirm your account, then sign in.",
      );
      setLoading(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label
          className="text-sm font-medium text-slate-800"
          htmlFor="signup-full-name"
        >
          Full name
        </label>
        <input
          id="signup-full-name"
          type="text"
          autoComplete="name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          placeholder="Enter your full name"
          required
        />
      </div>

      <div className="space-y-2">
        <label
          className="text-sm font-medium text-slate-800"
          htmlFor="signup-email"
        >
          Email
        </label>
        <input
          id="signup-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          placeholder="name@example.com"
          required
        />
      </div>

      <div className="space-y-2">
        <label
          className="text-sm font-medium text-slate-800"
          htmlFor="signup-password"
        >
          Password
        </label>
        <input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          placeholder="Create a password"
          required
        />
      </div>

      <div className="space-y-2">
        <label
          className="text-sm font-medium text-slate-800"
          htmlFor="signup-role"
        >
          Role
        </label>
        <select
          id="signup-role"
          value={role}
          onChange={(event) => setRole(event.target.value)}
          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
        >
          <option value="patient">Patient</option>
          <option value="provider">Provider</option>
        </select>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {message ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="flex h-12 w-full items-center justify-center rounded-xl bg-slate-950 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {loading ? "Creating account..." : "Create account"}
      </button>

      <p className="text-center text-xs leading-5 text-slate-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-slate-900 transition hover:text-slate-700"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
