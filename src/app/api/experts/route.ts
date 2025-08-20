import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { Expert, CreateExpertInput } from '@/types/expert'

// Mock data for development (will be replaced with database)
const mockExperts: Expert[] = [
  {
    id: '1',
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
  },
  {
    id: '2',
    name: 'Brad Gerstner',
    title: 'Founder of Altimeter Capital',
    focus_areas: 'AI transformation, growth at reasonable prices, tech platforms',
    investing_law: 'The best investments combine secular growth trends with reasonable valuations',
    framework_description: 'Seeks companies at the intersection of growth and value',
    is_default: true,
    is_active: true,
    display_order: 2,
    category: 'growth',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Stanley Druckenmiller',
    title: 'Legendary Macro Investor',
    focus_areas: 'Macro trends, market cycles, risk management',
    investing_law: "It's not whether you're right or wrong, but how much money you make when you're right and how much you lose when you're wrong",
    framework_description: 'Macro-driven approach with focus on risk/reward asymmetry',
    is_default: true,
    is_active: true,
    display_order: 3,
    category: 'macro',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Mary Meeker',
    title: 'Partner at Bond Capital, "Queen of the Internet"',
    focus_areas: 'Internet trends, digital transformation, data-driven insights',
    investing_law: 'Data is the new oil - companies that harness it effectively will dominate their industries',
    framework_description: 'Deep analysis of technology adoption curves and network effects',
    is_default: true,
    is_active: true,
    display_order: 4,
    category: 'tech',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Beth Kindig',
    title: 'Lead Tech Analyst at I/O Fund',
    focus_areas: 'Deep tech research, semiconductor cycles, AI infrastructure',
    investing_law: 'The biggest returns come from identifying technology inflection points before the crowd',
    framework_description: 'Technical analysis combined with fundamental research',
    is_default: true,
    is_active: true,
    display_order: 5,
    category: 'tech',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const type = searchParams.get('type')
    const sortBy = searchParams.get('sortBy') || 'display_order'
    const sortOrder = searchParams.get('sortOrder') || 'asc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // For now, use mock data
    let experts = [...mockExperts]

    // Apply filters
    if (active !== null) {
      experts = experts.filter(e => e.is_active === (active === 'true'))
    }

    if (category) {
      experts = experts.filter(e => e.category === category)
    }

    if (type) {
      if (type === 'default') {
        experts = experts.filter(e => e.is_default === true)
      } else if (type === 'custom') {
        experts = experts.filter(e => e.is_default === false)
      }
    }

    if (search) {
      const searchLower = search.toLowerCase()
      experts = experts.filter(e => 
        e.name.toLowerCase().includes(searchLower) ||
        e.focus_areas?.toLowerCase().includes(searchLower) ||
        e.investing_law.toLowerCase().includes(searchLower)
      )
    }

    // Apply sorting
    experts.sort((a, b) => {
      let compareValue = 0
      
      switch (sortBy) {
        case 'name':
          compareValue = a.name.localeCompare(b.name)
          break
        case 'created_at':
          compareValue = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
        case 'display_order':
        default:
          compareValue = (a.display_order || 999) - (b.display_order || 999)
          break
      }
      
      return sortOrder === 'asc' ? compareValue : -compareValue
    })

    // Store total count before pagination
    const total = experts.length

    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedExperts = experts.slice(startIndex, endIndex)

    // Return paginated response
    return NextResponse.json({
      experts: paginatedExperts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
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

    // For now, create mock expert
    const newExpert: Expert = {
      id: Date.now().toString(),
      ...body,
      is_default: false,
      is_active: body.is_active !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
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