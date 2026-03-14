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
        <label className="field-label" htmlFor="signup-full-name">
          Full name
        </label>
        <input
          id="signup-full-name"
          type="text"
          autoComplete="name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          className="field-input"
          placeholder="Enter your full name"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="field-label" htmlFor="signup-email">
          Email
        </label>
        <input
          id="signup-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="field-input"
          placeholder="name@example.com"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="field-label" htmlFor="signup-password">
          Password
        </label>
        <input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="field-input"
          placeholder="Create a password"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="field-label" htmlFor="signup-role">
          Role
        </label>
        <select
          id="signup-role"
          value={role}
          onChange={(event) => setRole(event.target.value)}
          className="field-input"
        >
          <option value="patient">Patient</option>
          <option value="provider">Provider</option>
        </select>
      </div>

      {error ? (
        <p className="banner-error">
          {error}
        </p>
      ) : null}

      {message ? (
        <p className="banner-success">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="primary-btn w-full"
      >
        {loading ? "Creating account..." : "Create account"}
      </button>

      <p className="text-center text-xs leading-5 text-slate-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-teal-700 transition hover:text-slate-950"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
