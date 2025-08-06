import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Fetch the specific blog by ID
    const { data: blog, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(blog)
  } catch (error) {
    console.error('Blog API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog' },
      { status: 500 }
    )
  }
}