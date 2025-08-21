import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (roleData?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { ids, action } = await request.json()

    // Validate input
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Invalid expert IDs' },
        { status: 400 }
      )
    }

    if (!action || action !== 'delete') {
      return NextResponse.json(
        { error: 'Invalid action. Only delete is supported.' },
        { status: 400 }
      )
    }

    // Delete the experts
    const result = await supabase
      .from('experts')
      .delete()
      .in('id', ids)

    if (result.error) {
      throw result.error
    }

    return NextResponse.json({ 
      success: true,
      message: `Successfully ${action}d ${ids.length} expert(s)`
    })
  } catch (error) {
    console.error('Error performing bulk operation:', error)
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    )
  }
}