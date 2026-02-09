import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { strictCors, getCorsHeaders } from "../_shared/cors.ts";
import { checkFunctionRateLimit, createRateLimitResponse } from "../_shared/functionRateLimit.ts";

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[NOTIFY-THIRD-PARTY-ADDED] ${step}${detailsStr}`);
};

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isUuid = (value: string): boolean => UUID_RE.test(value);

type NotifyRequestBody = {
  thirdPartyName?: string;
  thirdPartyEmail?: string;
  primaryParentId?: string;
  new_member_name?: string;
  new_member_email?: string;
  primary_parent_id?: string;
};

const handler = async (req: Request): Promise<Response> => {
  // Strict CORS validation
  const corsResponse = strictCors(req);
  if (corsResponse) return corsResponse;
  
  const corsHeaders = getCorsHeaders(req);

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ success: false, error: "Method not allowed" }),
        { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      logStep("Missing Supabase environment configuration");
      return new Response(
        JSON.stringify({ success: false, error: "Service unavailable" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("Missing Authorization header");
      return new Response(
        JSON.stringify({ success: false, error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });
    const { data: authData, error: authError } = await authClient.auth.getUser();

    if (authError || !authData.user) {
      logStep("Authentication failed");
      return new Response(
        JSON.stringify({ success: false, error: "Authentication failed" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const supabaseClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const rateLimitResult = await checkFunctionRateLimit(
      supabaseUrl,
      serviceRoleKey,
      authData.user.id,
      "notify-third-party-added",
    );

    if (!rateLimitResult.allowed) {
      logStep("Rate limit exceeded", { userId: authData.user.id });
      return createRateLimitResponse(rateLimitResult, corsHeaders);
    }

    logStep("Function started");

    const body = (await req.json()) as NotifyRequestBody;
    const thirdPartyName = body.thirdPartyName ?? body.new_member_name;
    const thirdPartyEmail = body.thirdPartyEmail ?? body.new_member_email;
    const primaryParentId = body.primaryParentId ?? body.primary_parent_id;
    
    if (!thirdPartyName || !thirdPartyEmail || !primaryParentId || !isUuid(primaryParentId)) {
      logStep("Missing required fields");
      return new Response(
        JSON.stringify({ success: false, error: "Invalid request data" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { data: callerProfile, error: callerProfileError } = await supabaseClient
      .from("profiles")
      .select("id, co_parent_id")
      .eq("user_id", authData.user.id)
      .maybeSingle();

    if (callerProfileError) {
      logStep("Caller profile lookup failed");
      return new Response(
        JSON.stringify({ success: false, error: "Authorization check failed" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const callerOwnsFamily =
      callerProfile?.id === primaryParentId ||
      callerProfile?.co_parent_id === primaryParentId;

    const { data: familyMembership } = await supabaseClient
      .from("family_members")
      .select("id")
      .eq("user_id", authData.user.id)
      .eq("primary_parent_id", primaryParentId)
      .eq("status", "active")
      .maybeSingle();

    if (!callerOwnsFamily && !familyMembership) {
      logStep("Forbidden request", { userId: authData.user.id, primaryParentId });
      return new Response(
        JSON.stringify({ success: false, error: "Forbidden" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    logStep("Input validated", { primaryParentId });

    // Get the primary parent and co-parent
    const { data: primaryParent, error: parentError } = await supabaseClient
      .from("profiles")
      .select("id, full_name, email, co_parent_id")
      .eq("id", primaryParentId)
      .single();

    if (parentError || !primaryParent) {
      logStep("Primary parent not found", { error: parentError });
      return new Response(
        JSON.stringify({ success: false, error: "Primary parent not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const parentEmails = new Set<string>();

    if (primaryParent.email) {
      parentEmails.add(primaryParent.email);
    }

    // Get co-parent if exists
    if (primaryParent.co_parent_id) {
      const { data: coParent } = await supabaseClient
        .from("profiles")
        .select("email, full_name")
        .eq("id", primaryParent.co_parent_id)
        .single();

      if (coParent?.email) {
        parentEmails.add(coParent.email);
      }
    }

    if (parentEmails.size === 0) {
      logStep("No parent emails found");
      return new Response(
        JSON.stringify({ success: false, error: "No parent emails found" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    logStep("Found parents to notify", { total: parentEmails.size });

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      logStep("ERROR: RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Email service unavailable" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const fromAddress = "CoParrent <noreply@coparrent.com>";
    const appUrl = "https://coparrent.com";
    const safeName = escapeHtml(thirdPartyName);
    const safeEmail = escapeHtml(thirdPartyEmail);
    let sentCount = 0;
    let failedCount = 0;

    // Send notification to all parents
    for (const parentEmail of parentEmails.values()) {
      logStep("Sending notification email", { to: parentEmail });

      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [parentEmail],
          subject: `${thirdPartyName} has joined your family group`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .logo { font-size: 28px; font-weight: bold; color: #2563eb; }
                .logo-accent { color: #0d9488; }
                .content { background: #f8fafc; border-radius: 12px; padding: 30px; margin-bottom: 30px; }
                .alert-box { background: #dcfce7; border: 1px solid #86efac; border-radius: 8px; padding: 16px; margin-top: 20px; }
                .button { display: inline-block; background: linear-gradient(135deg, #2563eb, #0d9488); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; }
                .footer { text-align: center; color: #64748b; font-size: 14px; }
                .member-info { background: white; border-radius: 8px; padding: 16px; margin-top: 16px; border: 1px solid #e2e8f0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="logo">Co<span class="logo-accent">Parrent</span></div>
                </div>
                <div class="content">
                  <h2 style="margin-top: 0;">New Family Member Added</h2>
                  <p>A new family member has joined your family group on CoParrent.</p>
                  
                  <div class="member-info">
                    <p style="margin: 0;"><strong>Name:</strong> ${safeName}</p>
                    <p style="margin: 8px 0 0;"><strong>Email:</strong> ${safeEmail}</p>
                  </div>
                  
                  <div class="alert-box">
                    <p style="margin: 0; color: #166534;"><strong>What they can access:</strong></p>
                    <ul style="margin: 8px 0 0; color: #166534;">
                      <li>Family messaging</li>
                      <li>Calendar (view only)</li>
                      <li>Their own journal</li>
                      <li>Law library and blog</li>
                    </ul>
                  </div>
                  
                  <p style="margin-top: 20px;">If you did not expect this, you can manage your family members in the settings.</p>
                  
                  <p style="text-align: center; margin-top: 30px;">
                    <a href="${appUrl}/dashboard/settings" class="button">View Settings</a>
                  </p>
                </div>
                <div class="footer">
                  <p>© CoParrent - Making co-parenting easier</p>
                </div>
              </div>
            </body>
            </html>
          `,
        }),
      });

      const result = await emailResponse.json();

      if (!emailResponse.ok) {
        logStep("Resend API error", { status: emailResponse.status, error: result, to: parentEmail });
        failedCount += 1;
      } else {
        logStep("Email sent successfully", { messageId: result.id, to: parentEmail });
        sentCount += 1;
      }
    }

    return new Response(JSON.stringify({ success: true, sentCount, failedCount }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ success: false, error: "An unexpected error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
