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
    <main className="page-shell">
      <div className="ambient-orbs">
        <span className="ambient-orb ambient-orb-teal left-[-4rem] top-20 h-48 w-48" />
        <span className="ambient-orb ambient-orb-sky right-[-4rem] top-12 h-52 w-52" />
      </div>
      <div className="page-frame max-w-4xl">
        <div className="glass-panel surface-card">
          <div className="space-y-2 border-b pb-6 section-divider">
            <p className="eyebrow">
              Vitals
            </p>
            <h1 className="section-title sm:text-3xl">
              Add a new vitals entry
            </h1>
            <p className="section-copy">
              Record the latest measurements for your health dashboard.
            </p>
          </div>

          <div className="mt-8">
            <NewVitalsForm />
          </div>
        </div>
      </div>
    </main>
  );
}
