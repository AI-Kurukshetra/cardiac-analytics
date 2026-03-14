const requiredSupabaseEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

export function getMissingSupabaseEnvVars() {
  return requiredSupabaseEnvVars.filter((envVar) => !process.env[envVar]?.trim());
}

export function isSupabaseConfigured() {
  return getMissingSupabaseEnvVars().length === 0;
}

export function getSupabasePublicEnv() {
  const missingEnvVars = getMissingSupabaseEnvVars();

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing Supabase environment variables: ${missingEnvVars.join(", ")}`,
    );
  }

  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  };
}
