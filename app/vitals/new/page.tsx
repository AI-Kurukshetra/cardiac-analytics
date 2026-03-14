import { redirect } from "next/navigation";
import { NewVitalsForm } from "@/components/vitals/new-vitals-form";
import { createClient } from "@/lib/supabase/server";

export default async function NewVitalsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="space-y-2 border-b border-slate-200 pb-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Vitals
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Add a new vitals entry
          </h1>
          <p className="text-sm leading-6 text-slate-600">
            Record the latest measurements for your health dashboard.
          </p>
        </div>

        <div className="mt-8">
          <NewVitalsForm />
        </div>
      </div>
    </main>
  );
}
