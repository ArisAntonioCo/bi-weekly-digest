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

    if (!action || !['activate', 'deactivate', 'delete'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    // Perform bulk operation based on action
    let result
    
    if (action === 'delete') {
      // Check if any of the experts are default
      const { data: defaultExperts } = await supabase
        .from('experts')
        .select('id')
        .in('id', ids)
        .eq('is_default', true)

      if (defaultExperts && defaultExperts.length > 0) {
        return NextResponse.json(
          { error: 'Cannot delete default experts' },
          { status: 400 }
        )
      }

      // Delete the experts
      result = await supabase
        .from('experts')
        .delete()
        .in('id', ids)
    } else {
      // Update is_active status
      const isActive = action === 'activate'
      result = await supabase
        .from('experts')
        .update({ is_active: isActive })
        .in('id', ids)
    }

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