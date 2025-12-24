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

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

const PRODUCT_TIERS: Record<string, string> = {
  "prod_TdrUhvfZzXYDTT": "premium",
  "prod_TdrUORgbP3ko1q": "mvp",
  "prod_TdrUXgQVj7yCqw": "law_office",
};

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

  // Get subscription details
  if (session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );
    const productId = subscription.items.data[0]?.price?.product as string;
    const tier = PRODUCT_TIERS[productId] || null;
    
    await updateProfileSubscription(customerEmail, "active", tier);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  logStep("Subscription updated", { 
    subscriptionId: subscription.id, 
    status: subscription.status 
  });

  // Get customer email
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
  const tier = PRODUCT_TIERS[productId] || null;
  
  // Map Stripe status to our status
  let status = subscription.status;
  if (status === "active" || status === "trialing") {
    status = "active";
  } else if (status === "past_due") {
    status = "past_due";
  } else if (status === "canceled" || status === "unpaid") {
    status = "canceled";
  }

  await updateProfileSubscription(email, status, tier);
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
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  logStep("Invoice payment failed", { invoiceId: invoice.id });

  const customerEmail = invoice.customer_email;
  if (!customerEmail) {
    logStep("No customer email found");
    return;
  }

  // Update status to past_due
  await updateProfileSubscription(customerEmail, "past_due", null);
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
