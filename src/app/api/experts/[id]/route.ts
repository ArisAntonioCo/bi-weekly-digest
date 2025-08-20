import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { UpdateExpertInput } from '@/types/expert'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const { data: expert, error } = await supabase
      .from('experts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Expert not found' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json(expert)
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

    // Update expert in database
    const { data: updatedExpert, error } = await supabase
      .from('experts')
      .update({
        ...(body.name !== undefined && { name: body.name }),
        ...(body.title !== undefined && { title: body.title }),
        ...(body.focus_areas !== undefined && { focus_areas: body.focus_areas }),
        ...(body.investing_law !== undefined && { investing_law: body.investing_law }),
        ...(body.framework_description !== undefined && { framework_description: body.framework_description }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.display_order !== undefined && { display_order: body.display_order }),
        ...(body.is_active !== undefined && { is_active: body.is_active }),
        ...(body.is_default !== undefined && { is_default: body.is_default }),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Expert not found' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json(updatedExpert)
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

    // Check if expert is default
    const { data: expert } = await supabase
      .from('experts')
      .select('is_default')
      .eq('id', id)
      .single()

    if (expert?.is_default) {
      return NextResponse.json(
        { error: 'Cannot delete default expert' },
        { status: 400 }
      )
    }

    // Delete the expert
    const { error } = await supabase
      .from('experts')
      .delete()
      .eq('id', id)

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Expert not found' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting expert:', error)
    return NextResponse.json(
      { error: 'Failed to delete expert' },
      { status: 500 }
    )
  }
}