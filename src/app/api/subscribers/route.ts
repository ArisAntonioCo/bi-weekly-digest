import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Email validation function
function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}

// GET - Fetch all subscribers
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: subscribers, error } = await supabase
      .from('subscribers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch subscribers' },
        { status: 500 }
      )
    }

    return NextResponse.json({ subscribers: subscribers || [] })
  } catch (error) {
    console.error('Subscribers API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Add new subscriber
export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const trimmedEmail = email.toLowerCase().trim()

    // Validate email format
    if (!isValidEmail(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if subscriber already exists
    const { data: existingSubscriber } = await supabase
      .from('subscribers')
      .select('id, email, subscribed')
      .eq('email', trimmedEmail)
      .single()

    if (existingSubscriber) {
      if (existingSubscriber.subscribed) {
        return NextResponse.json(
          { error: 'Email is already subscribed' },
          { status: 409 }
        )
      } else {
        // Reactivate existing subscriber
        const { error } = await supabase
          .from('subscribers')
          .update({ subscribed: true })
          .eq('id', existingSubscriber.id)

        if (error) {
          console.error('Supabase reactivation error:', error)
          return NextResponse.json(
            { error: 'Failed to reactivate subscriber' },
            { status: 500 }
          )
        }

        return NextResponse.json({ 
          message: 'Subscriber reactivated successfully',
          subscriber: { ...existingSubscriber, subscribed: true }
        })
      }
    }

    // Add new subscriber
    const { data: newSubscriber, error } = await supabase
      .from('subscribers')
      .insert([{ email: trimmedEmail, subscribed: true }])
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { error: 'Failed to add subscriber' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Subscriber added successfully',
      subscriber: newSubscriber
    })
  } catch (error) {
    console.error('Add subscriber error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update subscriber (toggle subscription status)
export async function PUT(request: Request) {
  try {
    const { id, subscribed } = await request.json()

    if (!id || typeof subscribed !== 'boolean') {
      return NextResponse.json(
        { error: 'ID and subscription status are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('subscribers')
      .update({ subscribed })
      .eq('id', id)

    if (error) {
      console.error('Supabase update error:', error)
      return NextResponse.json(
        { error: 'Failed to update subscriber' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Subscriber updated successfully'
    })
  } catch (error) {
    console.error('Update subscriber error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Remove subscriber
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Subscriber ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('subscribers')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase delete error:', error)
      return NextResponse.json(
        { error: 'Failed to delete subscriber' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Subscriber deleted successfully'
    })
  } catch (error) {
    console.error('Delete subscriber error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}