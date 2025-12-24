import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } }
);

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Product IDs for both live and test mode
const PRODUCT_TIERS: Record<string, string> = {
  // Live mode
  "prod_TdrUhvfZzXYDTT": "Premium",
  "prod_TdrUORgbP3ko1q": "MVP",
  "prod_TdrUXgQVj7yCqw": "Law Office",
  // Test mode
  "prod_Tf1Qq9jGVEyUOM": "Premium",
  "prod_Tf1QUUhL8Tx1Ks": "MVP",
  "prod_Tf1QG2gr5j0a3z": "Law Office",
};

const TIER_DB_VALUES: Record<string, string> = {
  // Live mode
  "prod_TdrUhvfZzXYDTT": "premium",
  "prod_TdrUORgbP3ko1q": "mvp",
  "prod_TdrUXgQVj7yCqw": "law_office",
  // Test mode
  "prod_Tf1Qq9jGVEyUOM": "premium",
  "prod_Tf1QUUhL8Tx1Ks": "mvp",
  "prod_Tf1QG2gr5j0a3z": "law_office",
};

type EmailType = "welcome" | "update" | "support" | "cancel";

const EMAIL_FROM: Record<EmailType, string> = {
  welcome: "CoParrent <hello@coparrent.com>",
  update: "CoParrent <noreply@coparrent.com>",
  support: "CoParrent <support@coparrent.com>",
  cancel: "CoParrent <hello@coparrent.com>",
};

async function sendEmail(to: string, subject: string, html: string, type: EmailType = "update") {
  if (!RESEND_API_KEY) {
    logStep("RESEND_API_KEY not configured, skipping email");
    return null;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: EMAIL_FROM[type],
        to: [to],
        subject,
        html,
      }),
    });

    const data = await response.json();
    logStep("Email sent", { to, subject, response: data });
    return data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("Email send error", { error: errorMessage });
    return null;
  }
}

async function updateProfileSubscription(
  email: string,
  status: string,
  tier: string | null
) {
  logStep("Updating profile", { email, status, tier });
  
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      subscription_status: status,
      subscription_tier: tier,
    })
    .eq("email", email);

  if (error) {
    logStep("Error updating profile", { error: error.message });
    throw error;
  }
  
  logStep("Profile updated successfully");
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  logStep("Checkout completed", { sessionId: session.id });
  
  const customerEmail = session.customer_email || session.customer_details?.email;
  if (!customerEmail) {
    logStep("No customer email found");
    return;
  }

  if (session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );
    const productId = subscription.items.data[0]?.price?.product as string;
    const tier = TIER_DB_VALUES[productId] || null;
    const tierName = PRODUCT_TIERS[productId] || "Premium";
    
    await updateProfileSubscription(customerEmail, "active", tier);

    await sendEmail(
      customerEmail,
      "Welcome to CoParrent " + tierName + "! 🎉",
      `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #6366f1;">Welcome to CoParrent ${tierName}!</h1>
          <p>Thank you for subscribing to CoParrent. Your ${tierName} subscription is now active.</p>
          <p>You now have access to all premium features including:</p>
          <ul>
            <li>Unlimited messaging with tone analysis</li>
            <li>Shared calendar and scheduling</li>
            <li>Document storage and sharing</li>
            <li>Expense tracking and reports</li>
          </ul>
          <p>If you have any questions, feel free to reach out to our support team at <a href="mailto:support@coparrent.com">support@coparrent.com</a>.</p>
          <p>Best regards,<br>The CoParrent Team</p>
        </div>
      `,
      "welcome"
    );
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  logStep("Subscription updated", { 
    subscriptionId: subscription.id, 
    status: subscription.status 
  });

  const customer = await stripe.customers.retrieve(
    subscription.customer as string
  );
  
  if (customer.deleted) {
    logStep("Customer was deleted");
    return;
  }

  const email = customer.email;
  if (!email) {
    logStep("No customer email found");
    return;
  }

  const productId = subscription.items.data[0]?.price?.product as string;
  const tier = TIER_DB_VALUES[productId] || null;
  const tierName = PRODUCT_TIERS[productId] || "Premium";
  
  let status = subscription.status;
  let shouldSendEmail = false;
  let emailSubject = "";
  let emailHtml = "";

  if (status === "active" || status === "trialing") {
    status = "active";
    shouldSendEmail = true;
    emailSubject = `Your CoParrent plan has been updated to ${tierName}`;
    emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">Plan Updated!</h1>
        <p>Your CoParrent subscription has been updated to the <strong>${tierName}</strong> plan.</p>
        <p>Your new features are now active. Thank you for being a valued member!</p>
        <p>Best regards,<br>The CoParrent Team</p>
      </div>
    `;
  } else if (status === "past_due") {
    status = "past_due";
    shouldSendEmail = true;
    emailSubject = "⚠️ Action Required: Payment Issue with Your CoParrent Subscription";
    emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f59e0b;">Payment Issue</h1>
        <p>We were unable to process your latest payment for your CoParrent subscription.</p>
        <p>Please update your payment method to avoid service interruption.</p>
        <p>You can update your payment details by visiting your account settings.</p>
        <p>If you have any questions, please contact our support team.</p>
        <p>Best regards,<br>The CoParrent Team</p>
      </div>
    `;
  } else if (status === "canceled" || status === "unpaid") {
    status = "canceled";
  }

  await updateProfileSubscription(email, status, tier);

  if (shouldSendEmail) {
    const emailType: EmailType = status === "past_due" ? "support" : "update";
    await sendEmail(email, emailSubject, emailHtml, emailType);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  logStep("Subscription deleted", { subscriptionId: subscription.id });

  const customer = await stripe.customers.retrieve(
    subscription.customer as string
  );
  
  if (customer.deleted) {
    logStep("Customer was deleted");
    return;
  }

  const email = customer.email;
  if (!email) {
    logStep("No customer email found");
    return;
  }

  await updateProfileSubscription(email, "canceled", null);

  await sendEmail(
    email,
    "Your CoParrent subscription has been canceled",
    `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">Subscription Canceled</h1>
        <p>Your CoParrent subscription has been canceled.</p>
        <p>We're sorry to see you go! Your premium features will remain active until the end of your current billing period.</p>
        <p>If you change your mind, you can resubscribe at any time from your account settings.</p>
        <p>We'd love to hear your feedback on how we can improve. Feel free to reach out to us at <a href="mailto:hello@coparrent.com">hello@coparrent.com</a>.</p>
        <p>Best regards,<br>The CoParrent Team</p>
      </div>
    `,
    "cancel"
  );
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  logStep("Invoice payment failed", { invoiceId: invoice.id });

  const customerEmail = invoice.customer_email;
  if (!customerEmail) {
    logStep("No customer email found");
    return;
  }

  await updateProfileSubscription(customerEmail, "past_due", null);

  await sendEmail(
    customerEmail,
    "⚠️ Payment Failed - Action Required",
    `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ef4444;">Payment Failed</h1>
        <p>We were unable to process your payment of $${((invoice.amount_due || 0) / 100).toFixed(2)} for your CoParrent subscription.</p>
        <p>Please update your payment method as soon as possible to avoid losing access to premium features.</p>
        <p>Common reasons for payment failure:</p>
        <ul>
          <li>Expired credit card</li>
          <li>Insufficient funds</li>
          <li>Card declined by your bank</li>
        </ul>
        <p>You can update your payment details by visiting your account settings and clicking "Manage Subscription".</p>
        <p>If you need assistance, please contact us at <a href="mailto:support@coparrent.com">support@coparrent.com</a>.</p>
        <p>Best regards,<br>The CoParrent Team</p>
      </div>
    `,
    "support"
  );
}

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    logStep("Missing signature or webhook secret");
    return new Response("Missing signature or webhook secret", { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    
    logStep("Received event", { type: event.type });

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("Webhook error", { error: errorMessage });
    return new Response(`Webhook Error: ${errorMessage}`, { status: 400 });
  }
});
