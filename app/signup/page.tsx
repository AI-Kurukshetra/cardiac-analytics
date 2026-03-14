import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { SupabaseConfigState } from "@/components/system/supabase-config-state";
import { SignupForm } from "@/components/auth/signup-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export default async function SignupPage() {
  if (!isSupabaseConfigured()) {
    return (
      <AuthShell
        title="Environment setup required"
        description="This deployment is missing its Supabase connection settings."
        footerText="Need to revisit the landing page?"
        footerHref="/"
        footerLinkLabel="Go home"
      >
        <SupabaseConfigState compact />
      </AuthShell>
    );
  }

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <AuthShell
      title="Create your account"
      description="Register as a patient or provider and we will create your profile after signup."
      footerText="Already registered?"
      footerHref="/login"
      footerLinkLabel="Sign in"
    >
      <SignupForm />
    </AuthShell>
  );
}
