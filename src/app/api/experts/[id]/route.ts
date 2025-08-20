import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { UpdateExpertInput } from '@/types/expert'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // For now, return mock data
    // This will be replaced with actual database query
    return NextResponse.json({
      id,
      name: 'Bill Gurley',
      title: 'Legendary VC at Benchmark',
      focus_areas: 'Valuation discipline, marketplace dynamics, network effects',
      investing_law: 'All revenue is not created equal - focus on high-margin, recurring revenue with pricing power',
      framework_description: 'Focuses on sustainable unit economics and competitive moats',
      is_default: true,
      is_active: true,
      display_order: 1,
      category: 'value',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching expert:', error)
    return NextResponse.json(
      { error: 'Failed to fetch expert' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const body: UpdateExpertInput = await request.json()

    // For now, return updated mock data
    return NextResponse.json({
      id,
      ...body,
      updated_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error updating expert:', error)
    return NextResponse.json(
      { error: 'Failed to update expert' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params
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

    // For now, just return success
    // In production, check if expert is default before allowing deletion
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting expert:', error)
    return NextResponse.json(
      { error: 'Failed to delete expert' },
      { status: 500 }
    )
  }
}