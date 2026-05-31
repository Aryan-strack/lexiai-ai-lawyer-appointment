import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getChatCompletion, detectIntent } from '@/lib/gemini/gemini'
import { supabaseAdmin } from '@/lib/supabase/admin'

// POST /api/ai — Send message to AI assistant
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, sessionId, history = [] } = await req.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Check AI usage limit
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('ai_calls_used, ai_calls_limit')
      .eq('user_id', user.id)
      .single()

    if (subscription && subscription.ai_calls_used >= subscription.ai_calls_limit) {
      return NextResponse.json(
        { error: 'AI usage limit reached. Please upgrade your plan.' },
        { status: 429 }
      )
    }

    // Save user message to DB
    await supabase
      .from('ai_chats')
      .insert({
        user_id: user.id,
        role: 'user',
        content: message,
        session_id: sessionId || null,
      })

    // Build conversation history for Gemini (role: 'user' | 'model')
    const geminiHistory = history.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      content: msg.content,
    }))
    geminiHistory.push({ role: 'user', content: message })

    // Detect intent and get AI response in parallel
    const [intent, response] = await Promise.all([
      detectIntent(message),
      getChatCompletion(geminiHistory),
    ])

    // Save AI response to DB
    const { data: aiMessage } = await supabase
      .from('ai_chats')
      .insert({
        user_id: user.id,
        role: 'assistant',
        content: response,
        session_id: sessionId || null,
        intent_detected: intent,
      })
      .select()
      .single()

    // Update AI usage count
    await supabase
      .from('subscriptions')
      .update({ ai_calls_used: (subscription?.ai_calls_used ?? 0) + 1 })
      .eq('user_id', user.id)

    // If lawyer recommendation intent, fetch top 3 verified lawyers
    let recommendedLawyers: any[] = []
    if (intent === 'lawyer_recommendation') {
      const { data: lawyers } = await supabaseAdmin
        .from('lawyers')
        .select(`
          id,
          specialization,
          experience_years,
          rating,
          fee_per_hour,
          users:user_id (name, avatar_url)
        `)
        .eq('verified', true)
        .order('rating', { ascending: false })
        .limit(3)

      recommendedLawyers = lawyers ?? []
    }

    return NextResponse.json({
      message: response,
      messageId: aiMessage?.id ?? null,
      intent,
      recommendedLawyers,
    })
  } catch (error) {
    console.error('AI Chat Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/ai — Get chat history
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)

    let query = supabase
      .from('ai_chats')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (sessionId) {
      query = query.eq('session_id', sessionId)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ messages: (data ?? []).reverse() })
  } catch (error) {
    console.error('Get Chat History Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/ai — Clear chat history
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')

    let query = supabase
      .from('ai_chats')
      .delete()
      .eq('user_id', user.id)

    if (sessionId) {
      query = query.eq('session_id', sessionId)
    }

    const { error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Clear Chat Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}