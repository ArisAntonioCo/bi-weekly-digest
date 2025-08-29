import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { CreateExpertInput } from '@/types/expert'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'name'
    const sortOrder = searchParams.get('sortOrder') || 'asc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build query
    let query = supabase.from('experts').select('*', { count: 'exact' })

    // Apply filters

    if (search) {
      query = query.or(`name.ilike.%${search}%,title.ilike.%${search}%,investing_law.ilike.%${search}%`)
    }

    // Apply sorting
    const order = { ascending: sortOrder === 'asc' }
    query = query.order(sortBy, order)

    // Apply pagination
    const startRange = (page - 1) * limit
    const endRange = startRange + limit - 1
    query = query.range(startRange, endRange)

    const { data: experts, error, count } = await query

    if (error) {
      console.error('Error fetching experts:', error)
      throw error
    }

    // Return paginated response with cache headers
    return NextResponse.json({
      experts: experts || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    })
  } catch (error) {
    console.error('Error fetching experts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch experts' },
      { status: 500 }
    )
  }
}

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

    const body: CreateExpertInput = await request.json()

    // Validate required fields
    if (!body.name || !body.investing_law) {
      return NextResponse.json(
        { error: 'Name and investing law are required' },
        { status: 400 }
      )
    }

    // Insert new expert into database
    const { data: newExpert, error } = await supabase
      .from('experts')
      .insert({
        name: body.name,
        title: body.title,
        investing_law: body.investing_law,
        framework_description: body.framework_description,
        avatar_seed: body.avatar_seed
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating expert:', error)
      throw error
    }

    return NextResponse.json(newExpert)
  } catch (error) {
    console.error('Error creating expert:', error)
    return NextResponse.json(
      { error: 'Failed to create expert' },
      { status: 500 }
    )
  }
}