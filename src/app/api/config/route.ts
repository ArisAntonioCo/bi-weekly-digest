import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current configuration
    const { data, error } = await supabase
      .from('configurations')
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch configuration' }, { status: 500 })
    }

    return NextResponse.json({ configuration: data })
  } catch (error) {
    console.error('Config GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { system_prompt } = await request.json()

    if (!system_prompt) {
      return NextResponse.json({ error: 'System prompt is required' }, { status: 400 })
    }

    // Get existing configuration first
    const { data: existing } = await supabase
      .from('configurations')
      .select('id')
      .single()

    // Update or insert configuration
    const { data, error } = await supabase
      .from('configurations')
      .upsert({
        id: existing?.id || '00000000-0000-0000-0000-000000000001',
        system_prompt,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase update error:', error)
      return NextResponse.json({ error: 'Failed to update configuration' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      configuration: data,
      message: 'System prompt updated successfully' 
    })
  } catch (error) {
    console.error('Config PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}