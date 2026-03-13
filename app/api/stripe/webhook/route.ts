import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/client'
import { createAdminClient } from '@/lib/supabase/admin'
import Stripe from 'stripe'

export const runtime = 'nodejs'

function getWebhookSecret(): string {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set')
  }
  return webhookSecret
}

const toIsoDate = (timestamp: number | null | undefined) =>
  timestamp ? new Date(timestamp * 1000).toISOString() : null

export async function POST(request: Request) {
  const rawBody = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    const webhookSecret = getWebhookSecret()
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (error) {
    console.error('Stripe webhook signature verification failed', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabaseAdmin = createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode !== 'subscription') {
          break
        }

        const userId = session.metadata?.userId
        const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id

        if (!userId || !subscriptionId) {
          console.warn('Missing userId or subscriptionId on checkout session')
          break
        }

        const subscription = await getStripe().subscriptions.retrieve(subscriptionId)

        await supabaseAdmin
          .from('subscriptions')
          .upsert(
            {
              user_id: userId,
              stripe_subscription_id: subscription.id,
              status: subscription.status,
              current_period_end: toIsoDate(subscription.current_period_end),
            },
            { onConflict: 'user_id' }
          )

        await supabaseAdmin
          .from('profiles')
          .update({ plan: 'pro', is_pro: true })
          .eq('user_id', userId)

        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id

        if (!subscriptionId) {
          break
        }

        const stripe = getStripe()
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)

        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_end: toIsoDate(subscription.current_period_end),
          })
          .eq('stripe_subscription_id', subscription.id)

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_end: toIsoDate(subscription.current_period_end),
          })
          .eq('stripe_subscription_id', subscription.id)

        const { data: subscriptionRow } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .maybeSingle()

        if (subscriptionRow?.user_id) {
          await supabaseAdmin
            .from('profiles')
            .update({ plan: 'free', is_pro: false })
            .eq('user_id', subscriptionRow.user_id)
        }

        break
      }

      default: {
        console.log(`Unhandled Stripe event: ${event.type}`)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook handler error', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
