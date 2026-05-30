import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { z } from 'zod'

const reviewSchema = z.object({
  appointment_id: z.string().uuid(),
  rating: z.number().min(1).max(5),
  review_text: z.string().min(10).max(1000),
})

// POST /api/reviews - Create review
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validated = reviewSchema.parse(body)

    const supabase = createClient()

    // Verify appointment belongs to user and is completed
    const { data: appointment, error: aptError } = await supabase
      .from('appointments')
      .select('lawyer_id, status')
      .eq('id', validated.appointment_id)
      .eq('client_id', session.user.id)
      .single()

    if (aptError || !appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    if (appointment.status !== 'completed') {
      return NextResponse.json(
        { error: 'Can only review completed appointments' },
        { status: 400 }
      )
    }

    // Check if already reviewed
    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('appointment_id', validated.appointment_id)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Already reviewed this appointment' },
        { status: 409 }
      )
    }

    // Create review
    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        appointment_id: validated.appointment_id,
        client_id: session.user.id,
        lawyer_id: appointment.lawyer_id,
        rating: validated.rating,
        review_text: validated.review_text,
        is_verified: true,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update lawyer rating (handled by database trigger)
    // Create notification for lawyer
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: appointment.lawyer_id,
        title: 'New Review',
        message: `You received a ${validated.rating}-star review`,
        type: 'system',
        metadata: { review_id: review.id },
      })

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Create Review Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/reviews - Get reviews for a lawyer
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const lawyerId = searchParams.get('lawyerId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')
    const offset = (page - 1) * limit

    if (!lawyerId) {
      return NextResponse.json({ error: 'Lawyer ID required' }, { status: 400 })
    }

    const supabase = createClient()

    const { data, error, count } = await supabase
      .from('reviews')
      .select(`
        *,
        client:client_id (
          id,
          name,
          avatar_url
        )
      `, { count: 'exact' })
      .eq('lawyer_id', lawyerId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      reviews: data,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Get Reviews Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/reviews/:id/respond - Lawyer response to review
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { response } = body

    if (!response || response.length < 10) {
      return NextResponse.json(
        { error: 'Response must be at least 10 characters' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Get review details
    const { data: review, error: getError } = await supabase
      .from('reviews')
      .select('*, lawyer:lawyer_id(user_id)')
      .eq('id', params.id)
      .single()

    if (getError || !review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // Check if user is the lawyer
    if (review.lawyer.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update review with response
    const { data, error } = await supabase
      .from('reviews')
      .update({ lawyer_response: response })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ review: data })
  } catch (error) {
    console.error('Respond to Review Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}