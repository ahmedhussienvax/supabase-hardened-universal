// Supabase Edge Function Master Entrypoint
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

console.info("🔥 Edge Function Engine Started!");

serve(async (req) => {
  const { name } = await req.json();
  const data = {
    message: `🚀 Hello ${name || "Master"}! Supabase Universal is Live!`,
  }

  return new Response(
    JSON.stringify(data),
    { headers: { "Content-Type": "application/json" } },
  )
})
