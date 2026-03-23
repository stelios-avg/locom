import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { getStripe } from '@/lib/stripe/client'
import { createAdminClient } from '@/lib/supabase/admin'

type ProfileCheckout = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'user_id' | 'name' | 'full_name' | 'email' | 'stripe_customer_id'
>

interface CheckoutRequestBody {
  userId: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutRequestBody
    const userId = body?.userId

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    const priceId = process.env.STRIPE_PRO_PRICE_ID

    if (!appUrl) {
      throw new Error('NEXT_PUBLIC_APP_URL is not configured')
    }

    if (!priceId) {
      throw new Error('STRIPE_PRO_PRICE_ID is not configured')
    }

    const supabaseAdmin = createAdminClient()

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('user_id, name, full_name, email, stripe_customer_id')
      .eq('user_id', userId)
      .maybeSingle()

    if (profileError) {
      throw profileError
    }

    const profileRow = profile as ProfileCheckout | null

    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)

    if (userError) {
      throw userError
    }

    const authUser = userData?.user as User | undefined
    if (!authUser) {
      throw new Error('User not found')
    }

    const userEmail = authUser.email ?? profileRow?.email ?? undefined

    let profileRecord = profileRow

    if (!profileRecord) {
      const { data: newProfile, error: createProfileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: userId,
          name: authUser.user_metadata?.name ?? userEmail ?? null,
          email: userEmail ?? null,
        })
        .select('user_id, name, full_name, email, stripe_customer_id')
        .single()

      if (createProfileError) {
        throw createProfileError
      }

      profileRecord = newProfile
    } else if (!profileRecord.email && userEmail) {
      await supabaseAdmin
        .from('profiles')
        .update({ email: userEmail })
        .eq('user_id', userId)

      profileRecord.email = userEmail
    }

    let customerId = profileRecord?.stripe_customer_id ?? undefined

    if (!customerId) {
      const stripe = getStripe()
      const customer = await stripe.customers.create({
        email: userEmail,
        name: profileRecord?.full_name || profileRecord?.name || undefined,
        metadata: {
          userId,
        },
      })

      customerId = customer.id

      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ stripe_customer_id: customer.id })
        .eq('user_id', userId)

      if (updateError) {
        throw updateError
      }
    }

    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/billing/cancel`,
      subscription_data: {
        metadata: {
          userId,
        },
      },
      metadata: {
        userId,
      },
    })

    if (!session.url) {
      throw new Error('Failed to create checkout session URL')
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json({ error: 'Unable to start checkout session' }, { status: 500 })
  }
}
