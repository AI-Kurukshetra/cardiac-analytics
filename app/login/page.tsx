import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
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
