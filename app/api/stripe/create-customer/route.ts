// @ts-nocheck - API routes are not used in mobile static export
import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/client'
import { createAdminClient } from '@/lib/supabase/admin'

interface CreateCustomerRequest {
  userId: string
  email: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateCustomerRequest
    const userId = body?.userId
    const email = body?.email

    if (!userId || !email) {
      return NextResponse.json({ error: 'Missing userId or email' }, { status: 400 })
    }

    const supabaseAdmin = createAdminClient()

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('user_id, email, full_name, stripe_customer_id')
      .eq('user_id', userId)
      .maybeSingle()

    if (profileError) {
      throw profileError
    }

    let profileRecord = profile

    if (!profileRecord) {
      const { data: newProfile, error: createProfileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: userId,
          email,
        })
        .select('user_id, email, full_name, stripe_customer_id')
        .single()

      if (createProfileError) {
        throw createProfileError
      }

      profileRecord = newProfile
    }

    if (profileRecord.stripe_customer_id) {
      // ensure email stays up to date
      if (profileRecord.email !== email) {
        await supabaseAdmin
          .from('profiles')
          .update({ email })
          .eq('user_id', userId)
      }

      return NextResponse.json({ customerId: profileRecord.stripe_customer_id })
    }

    const stripe = getStripe()
    const customer = await stripe.customers.create({
      email,
      metadata: {
        userId,
      },
    })

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ stripe_customer_id: customer.id, email })
      .eq('user_id', userId)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ customerId: customer.id })
  } catch (error) {
    console.error('Error creating Stripe customer:', error)
    return NextResponse.json({ error: 'Unable to create customer' }, { status: 500 })
  }
}
