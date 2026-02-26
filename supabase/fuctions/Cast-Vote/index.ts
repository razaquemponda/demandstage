import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RATE_LIMIT_WINDOW_MS = 2 * 60 * 1000; // 2 minutes
const RATE_LIMIT_MAX = 5; // max votes in window

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { artist, city, device_id } = await req.json();

    if (!artist || !city || !device_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get client IP from headers
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Check IP + artist + city uniqueness
    if (ip !== "unknown") {
      const { data: ipDupe } = await supabase
        .from("votes")
        .select("id")
        .eq("ip_address", ip)
        .eq("artist", artist)
        .eq("city", city)
        .maybeSingle();

      if (ipDupe) {
        return new Response(
          JSON.stringify({ error: "Already voted from this network for this artist in this city" }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // 2. Check device_id + artist + city uniqueness
    const { data: deviceDupe } = await supabase
      .from("votes")
      .select("id")
      .eq("device_id", device_id)
      .eq("artist", artist)
      .eq("city", city)
      .maybeSingle();

    if (deviceDupe) {
      return new Response(
        JSON.stringify({ error: "Already voted for this artist in this city" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Rate limiting — check recent votes from this device or IP
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();

    const { count: recentDeviceCount } = await supabase
      .from("votes")
      .select("*", { count: "exact", head: true })
      .eq("device_id", device_id)
      .gte("created_at", windowStart);

    const { count: recentIpCount } = await supabase
      .from("votes")
      .select("*", { count: "exact", head: true })
      .eq("ip_address", ip)
      .gte("created_at", windowStart);

    const recentCount = Math.max(recentDeviceCount ?? 0, recentIpCount ?? 0);
    const flagged = recentCount >= RATE_LIMIT_MAX;

    if (recentCount >= RATE_LIMIT_MAX * 2) {
      // Hard block at 2x threshold
      return new Response(
        JSON.stringify({ error: "Too many votes. Please slow down." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Insert vote
    const { error } = await supabase.from("votes").insert({
      artist,
      city,
      device_id,
      ip_address: ip,
      flagged,
    });

    if (error) {
      console.error("Insert error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to record vote" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, flagged }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
