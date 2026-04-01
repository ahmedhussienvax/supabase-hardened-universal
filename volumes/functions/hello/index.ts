// Supabase Edge Function 'Hello' Boilerplate
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

console.info("👋 Hello Edge Function Active!");

serve(async (req) => {
  return new Response(
    JSON.stringify({
      message: "👋 Hello from Supabase Hardened Universal!",
      status: "Healthy",
      environment: "Production/VPS"
    }),
    { headers: { "Content-Type": "application/json" } },
  )
})
