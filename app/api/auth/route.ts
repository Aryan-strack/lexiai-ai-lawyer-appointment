import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  role: z.enum(['client', 'lawyer']).default('client'),
  phone: z.string().optional(),
  userId: z.string().uuid().optional(), // provided when called after signUp
})

// POST /api/auth — Create user profile after Supabase signUp
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = registerSchema.parse(body)

    // Use admin client to create the profile (bypasses RLS)
    const userId = validated.userId

    // Create user profile in users table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email: validated.email,
        name: validated.name,
        role: validated.role,
        phone: validated.phone ?? null,
      })
      .select()
      .single()

    if (profileError) {
      // If profile already exists (duplicate signup attempt), return existing
      if (profileError.code === '23505') {
        const { data: existing } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()
        return NextResponse.json({ user: existing }, { status: 200 })
      }
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // If role is lawyer, create lawyer profile
    if (validated.role === 'lawyer') {
      await supabaseAdmin
        .from('lawyers')
        .insert({
          user_id: userId,
          verified: false,
          fee_per_hour: 0,
          experience_years: 0,
          specialization: [],
        })
    }

    // Create free subscription for all new users
    await supabaseAdmin
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan_type: 'free',
        ai_calls_limit: 50,
        ai_calls_used: 0,
        status: 'active',
      })

    return NextResponse.json({ user: profile }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Register Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/auth — Get current authenticated user profile
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user: profile })
  } catch (error) {
    console.error('Get User Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/auth — Update user profile
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, phone, avatar_url } = body

    const { data, error } = await supabase
      .from('users')
      .update({
        name,
        phone,
        avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ user: data })
  } catch (error) {
    console.error('Update User Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}