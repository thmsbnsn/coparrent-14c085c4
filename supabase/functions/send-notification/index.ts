import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { strictCors, getCorsHeaders } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface NotificationPayload {
  type: "new_message" | "schedule_change" | "schedule_response" | "document_upload" | "child_update" | "exchange_reminder";
  recipient_profile_id: string;
  sender_name?: string;
  title: string;
  message: string;
  action_url?: string;
  data?: Record<string, any>;
}

const getEmailTemplate = (payload: NotificationPayload): { subject: string; html: string } => {
  const baseStyles = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background-color: #ffffff;
  `;

  const headerStyles = `
    background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
    color: white;
    padding: 30px;
    text-align: center;
    border-radius: 12px 12px 0 0;
  `;

  const contentStyles = `
    padding: 30px;
    background-color: #f8faf8;
    border: 1px solid #e5ebe5;
    border-top: none;
    border-radius: 0 0 12px 12px;
  `;

  const buttonStyles = `
    display: inline-block;
    background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
    color: white;
    padding: 12px 24px;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    margin-top: 20px;
  `;

  const footerStyles = `
    text-align: center;
    padding: 20px;
    color: #666;
    font-size: 12px;
  `;

  const actionUrl = payload.action_url || "https://coparrent.lovable.app/dashboard";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="${baseStyles}">
      <div style="${headerStyles}">
        <h1 style="margin: 0; font-size: 24px;">CoParrent</h1>
        <p style="margin: 10px 0 0; opacity: 0.9;">Co-parenting made simpler</p>
      </div>
      <div style="${contentStyles}">
        <h2 style="color: #1e3a5f; margin-top: 0;">${payload.title}</h2>
        <p style="color: #333; line-height: 1.6;">${payload.message}</p>
        ${payload.sender_name ? `<p style="color: #666; font-size: 14px;">From: ${payload.sender_name}</p>` : ""}
        <a href="${actionUrl}" style="${buttonStyles}">View in CoParrent</a>
      </div>
      <div style="${footerStyles}">
        <p>You're receiving this because you have notifications enabled in CoParrent.</p>
        <p>To change your notification preferences, visit your <a href="https://coparrent.lovable.app/dashboard/settings" style="color: #1e3a5f;">settings</a>.</p>
      </div>
    </body>
    </html>
  `;

  const subjectMap: Record<NotificationPayload["type"], string> = {
    new_message: `New message from ${payload.sender_name || "your co-parent"}`,
    schedule_change: "Schedule change request",
    schedule_response: "Schedule request update",
    document_upload: "New document shared",
    child_update: "Child information updated",
    exchange_reminder: "Upcoming custody exchange",
  };

  return {
    subject: subjectMap[payload.type] || payload.title,
    html,
  };
};

const handler = async (req: Request): Promise<Response> => {
  // Strict CORS validation
  const corsResponse = strictCors(req);
  if (corsResponse) return corsResponse;
  
  const corsHeaders = getCorsHeaders(req);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: NotificationPayload = await req.json();
    console.log("Received notification request:", payload);

    // Get recipient's profile and preferences
    const { data: recipientProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, full_name, notification_preferences")
      .eq("id", payload.recipient_profile_id)
      .single();

    if (profileError || !recipientProfile) {
      console.error("Error fetching recipient profile:", profileError);
      return new Response(
        JSON.stringify({ error: "Recipient not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const preferences = recipientProfile.notification_preferences as Record<string, boolean> | null;
    
    // Check if notifications are enabled
    if (preferences && !preferences.enabled) {
      console.log("Notifications disabled for recipient");
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: "notifications_disabled" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check specific preference
    const preferenceMap: Record<string, string> = {
      new_message: "new_messages",
      schedule_change: "schedule_changes",
      schedule_response: "schedule_changes",
      document_upload: "document_uploads",
      child_update: "child_info_updates",
      exchange_reminder: "upcoming_exchanges",
    };

    const preferenceKey = preferenceMap[payload.type];
    if (preferences && preferenceKey && !preferences[preferenceKey]) {
      console.log(`Preference ${preferenceKey} is disabled for recipient`);
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: `${preferenceKey}_disabled` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create in-app notification
    const { error: notifError } = await supabase.from("notifications").insert({
      user_id: recipientProfile.id,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      related_id: payload.data?.related_id || null,
    });

    if (notifError) {
      console.error("Error creating notification:", notifError);
    }

    // Send email notification
    let emailSent = false;
    if (recipientProfile.email) {
      try {
        const { subject, html } = getEmailTemplate(payload);
        
        const { error: emailError } = await resend.emails.send({
          from: "CoParrent <notifications@resend.dev>",
          to: [recipientProfile.email],
          subject,
          html,
        });

        if (emailError) {
          console.error("Error sending email:", emailError);
        } else {
          emailSent = true;
          console.log("Email sent successfully to:", recipientProfile.email);
        }
      } catch (emailErr) {
        console.error("Email sending exception:", emailErr);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        notification_created: !notifError,
        email_sent: emailSent,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
