import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";
import { createClient } from "@/lib/supabase/server";

type DashboardPageProps = {
  searchParams?: Promise<{
    success?: string;
  }>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  const params = await searchParams;
  const showVitalsSaved = params?.success === "vitals-saved";

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
              Dashboard
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              Welcome, {profile?.full_name ?? "User"}
            </h1>
            <p className="text-sm leading-6 text-slate-600">
              Your authenticated account details are shown below.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <Link
              href="/vitals/new"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Add vitals
            </Link>
            <LogoutButton />
          </div>
        </div>

        {showVitalsSaved ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Vitals entry saved successfully.
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              Full name
            </p>
            <p className="mt-2 text-sm text-slate-900">
              {profile?.full_name ?? "Not set"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              Email
            </p>
            <p className="mt-2 break-all text-sm text-slate-900">
              {user.email ?? "No email available"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              Role
            </p>
            <p className="mt-2 text-sm capitalize text-slate-900">
              {profile?.role ?? "Not set"}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
