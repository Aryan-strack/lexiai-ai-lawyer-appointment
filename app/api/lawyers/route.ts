import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { z } from 'zod'

const lawyerProfileSchema = z.object({
  specialization: z.array(z.string()),
  experience_years: z.number().min(0),
  bar_council_number: z.string(),
  city: z.string(),
  fee_per_hour: z.number().min(0),
  bio: z.string().min(50),
  languages: z.array(z.string()),
  education: z.array(z.string()),
})

// GET /api/lawyers - Get all lawyers
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const specialization = searchParams.get('specialization')
    const city = searchParams.get('city')
    const minRating = parseFloat(searchParams.get('minRating') || '0')
    const verified = searchParams.get('verified') === 'true'
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')
    const offset = (page - 1) * limit

    const supabase = createClient()

    let query = supabase
      .from('lawyers')
      .select(`
        *,
        users:user_id (
          id,
          name,
          email,
          avatar_url
        )
      `, { count: 'exact' })

    // Apply filters
    if (specialization) {
      query = query.contains('specialization', [specialization])
    }
    if (city) {
      query = query.eq('city', city)
    }
    if (minRating > 0) {
      query = query.gte('rating', minRating)
    }
    if (verified) {
      query = query.eq('verified', true)
    }

    const { data, error, count } = await query
      .order('rating', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      lawyers: data,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Get Lawyers Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/lawyers/profile - Create/Update lawyer profile
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validated = lawyerProfileSchema.parse(body)



    // Check if user is a lawyer
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (user?.role !== 'lawyer') {
      return NextResponse.json(
        { error: 'User is not a lawyer' },
        { status: 403 }
      )
    }

    // Check if profile exists
    const { data: existing } = await supabase
      .from('lawyers')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    let result
    if (existing) {
      // Update existing profile
      const { data, error } = await supabase
        .from('lawyers')
        .update({
          ...validated,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('lawyers')
        .insert({
          user_id: user.id,
          ...validated,
          verified: false,
        })
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return NextResponse.json({ lawyer: result })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Update Lawyer Profile Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/lawyers/:id - Get specific lawyer
export async function GET_lawyer(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('lawyers')
      .select(`
        *,
        users:user_id (
          id,
          name,
          email,
          phone,
          avatar_url
        ),
        reviews (
          rating,
          review_text,
          created_at,
          client:client_id (
            name,
            avatar_url
          )
        ),
        availability (*)
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ lawyer: data })
  } catch (error) {
    console.error('Get Lawyer Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}