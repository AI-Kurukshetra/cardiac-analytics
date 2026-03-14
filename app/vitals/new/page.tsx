import { redirect } from "next/navigation";
import { AuthenticatedHealthAssistant } from "@/components/assistant/authenticated-health-assistant";
import { SupabaseConfigState } from "@/components/system/supabase-config-state";
import { NewVitalsForm } from "@/components/vitals/new-vitals-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export default async function NewVitalsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="page-shell">
        <div className="ambient-orbs">
          <span className="ambient-orb ambient-orb-teal left-[-4rem] top-20 h-48 w-48" />
          <span className="ambient-orb ambient-orb-sky right-[-4rem] top-12 h-52 w-52" />
        </div>
        <div className="page-frame max-w-4xl">
          <SupabaseConfigState
            title="Vitals entry needs Supabase setup"
            description="This deployment cannot save vitals until the public Supabase environment variables are configured in Vercel."
            backHref="/dashboard"
            backLabel="Back to dashboard"
          />
        </div>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
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
      <AuthenticatedHealthAssistant />
    </>
  );
}
