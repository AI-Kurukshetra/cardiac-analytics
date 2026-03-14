import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { SupabaseConfigState } from "@/components/system/supabase-config-state";
import { LoginForm } from "@/components/auth/login-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
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
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in with your email and password to continue to your dashboard."
      footerText="New to the platform?"
      footerHref="/signup"
      footerLinkLabel="Create an account"
    >
      <LoginForm />
    </AuthShell>
  );
}
