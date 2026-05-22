import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Lazy-init Stripe so the build doesn't crash when keys are missing
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
  return new Stripe(key, { apiVersion: '2026-04-22.dahlia' });
}

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const clerkUserId = session.client_reference_id;

      if (!clerkUserId) {
        console.error('No client_reference_id found in checkout session');
        return NextResponse.json({ error: 'Missing client_reference_id' }, { status: 400 });
      }

      // Get the tier from session metadata (set during checkout creation)
      const tier = session.metadata?.tier || 'pro';

      const supabaseAdmin = getSupabaseAdmin();

      // Update the user's tier in Supabase and reset usage_count
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          tier,
          usage_count: 0,
          stripe_customer_id: session.customer as string || null,
        })
        .eq('id', clerkUserId);

      if (updateError) {
        console.error('Error updating user tier in Supabase:', updateError);
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }

      console.log(`✅ Updated user ${clerkUserId} to tier: ${tier}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error processing webhook event:', message);
    return NextResponse.json({ error: `Webhook handler error: ${message}` }, { status: 400 });
  }
}
