import { PulseAIAssistant } from "@/components/assistant/pulse-ai-assistant";
import { fetchAssistantSnapshot } from "@/lib/assistant/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export async function AuthenticatedHealthAssistant() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const snapshot = await fetchAssistantSnapshot(supabase, user.id);

  return <PulseAIAssistant snapshot={snapshot} />;
}
