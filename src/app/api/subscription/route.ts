import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: subscriber, error } = await supabase
      .from('subscribers')
      .select('*')
      .eq('email', user.email)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching subscription status:', error)
      return NextResponse.json(
        { error: 'Failed to fetch subscription status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      isSubscribed: subscriber?.subscribed || false,
      subscription: subscriber || null,
      user: {
        id: user.id,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Subscription status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user || !user.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // First check if subscriber exists
    const { data: existingSubscriber } = await supabase
      .from('subscribers')
      .select('*')
      .eq('email', user.email)
      .single()

    if (existingSubscriber) {
      // Update existing subscriber
      const { data, error } = await supabase
        .from('subscribers')
        .update({ subscribed: true })
        .eq('email', user.email)
        .select()
        .single()

      if (error) {
        console.error('Error updating subscription:', error)
        return NextResponse.json(
          { error: 'Failed to update subscription' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: existingSubscriber.subscribed ? 'Already subscribed' : 'Successfully subscribed',
        subscription: data
      })
    } else {
      // Create new subscriber
      const { data, error } = await supabase
        .from('subscribers')
        .insert({
          email: user.email,
          subscribed: true
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating subscription:', error)
        return NextResponse.json(
          { error: 'Failed to create subscription' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Successfully subscribed',
        subscription: data
      })
    }
  } catch (error) {
    console.error('Subscribe error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user || !user.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('subscribers')
      .update({ subscribed: false })
      .eq('email', user.email)
      .select()
      .single()

    if (error) {
      console.error('Error unsubscribing:', error)
      return NextResponse.json(
        { error: 'Failed to unsubscribe' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed',
      subscription: data
    })
  } catch (error) {
    console.error('Unsubscribe error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}