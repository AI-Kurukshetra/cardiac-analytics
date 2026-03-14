import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { createClient } from "@/lib/supabase/server";

export default async function SignupPage() {
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
