import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ADMIN-MANAGE-USERS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ error: "Authentication failed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const user = userData.user;
    logStep("User authenticated", { userId: user.id });

    // Check if user is admin using security definer function
    const { data: isAdminResult } = await supabaseClient.rpc('is_admin');
    
    // Also check via user_roles table with service role
    const { data: adminRole } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!adminRole) {
      logStep("Access denied - not an admin", { userId: user.id });
      return new Response(
        JSON.stringify({ error: "Access denied" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    logStep("Admin access verified");

    const method = req.method;
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // List all users with their subscription status (supports GET and POST)
    if (action === "list") {
      const search = url.searchParams.get("search") || "";
      
      // Get all profiles
      let query = supabaseClient
        .from("profiles")
        .select("id, user_id, email, full_name, subscription_status, subscription_tier, free_premium_access, access_reason, created_at")
        .order("created_at", { ascending: false });

      if (search) {
        query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
      }

      const { data: profiles, error: profilesError } = await query;

      if (profilesError) {
        logStep("Error fetching profiles", { error: profilesError.message });
        return new Response(
          JSON.stringify({ error: "Failed to fetch users" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      // Optionally fetch Stripe subscription status for each user
      const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
      let usersWithStripeStatus = profiles || [];

      if (stripeKey) {
        const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
        
        usersWithStripeStatus = await Promise.all(
          (profiles || []).map(async (profile) => {
            if (!profile.email) return { ...profile, stripe_status: null };
            
            try {
              const customers = await stripe.customers.list({ email: profile.email, limit: 1 });
              if (customers.data.length === 0) {
                return { ...profile, stripe_status: null };
              }

              const subscriptions = await stripe.subscriptions.list({
                customer: customers.data[0].id,
                status: "active",
                limit: 1,
              });

              return {
                ...profile,
                stripe_status: subscriptions.data.length > 0 ? "active" : "inactive",
                stripe_subscription_end: subscriptions.data.length > 0 
                  ? new Date(subscriptions.data[0].current_period_end * 1000).toISOString()
                  : null
              };
            } catch {
              return { ...profile, stripe_status: null };
            }
          })
        );
      }

      logStep("Fetched users", { count: usersWithStripeStatus.length });
      return new Response(JSON.stringify({ users: usersWithStripeStatus }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // POST: Update user's free_premium_access
    if (method === "POST" && action === "update-access") {
      const body = await req.json();
      const { profile_id, free_premium_access, access_reason } = body;

      if (!profile_id) {
        return new Response(
          JSON.stringify({ error: "Profile ID is required" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      // Validate access_reason length
      if (access_reason && access_reason.length > 255) {
        return new Response(
          JSON.stringify({ error: "Access reason must be 255 characters or less" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      const { error: updateError } = await supabaseClient
        .from("profiles")
        .update({ 
          free_premium_access: !!free_premium_access,
          access_reason: access_reason || null
        })
        .eq("id", profile_id);

      if (updateError) {
        logStep("Error updating profile", { error: updateError.message });
        return new Response(
          JSON.stringify({ error: "Failed to update user access" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      logStep("Updated user access", { profile_id, free_premium_access });
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
