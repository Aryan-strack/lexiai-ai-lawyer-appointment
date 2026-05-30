import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { getChatCompletion, detectIntent, recommendLawyer } from '@/lib/openai/openai'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// POST /api/ai/chat - Send message to AI assistant
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, sessionId, context } = await req.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const supabase = createClient()

    // Check AI usage limit
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('ai_calls_used, ai_calls_limit')
      .eq('user_id', session.user.id)
      .single()

    if (subscription && subscription.ai_calls_used >= subscription.ai_calls_limit) {
      return NextResponse.json(
        { error: 'AI usage limit reached. Please upgrade your plan.' },
        { status: 429 }
      )
    }

    // Save user message
    const { data: userMessage } = await supabase
      .from('ai_chats')
      .insert({
        user_id: session.user.id,
        role: 'user',
        content: message,
        session_id: sessionId,
      })
      .select()
      .single()

    // Detect intent
    const intent = await detectIntent(message)

    // Get AI response
    const response = await getChatCompletion([
      { role: 'user', content: message }
    ])

    // Save AI response
    const { data: aiMessage } = await supabase
      .from('ai_chats')
      .insert({
        user_id: session.user.id,
        role: 'assistant',
        content: response,
        session_id: sessionId,
        intent_detected: intent,
      })
      .select()
      .single()

    // Update AI usage count
    await supabase
      .from('subscriptions')
      .update({ ai_calls_used: (subscription?.ai_calls_used || 0) + 1 })
      .eq('user_id', session.user.id)

    // If intent is lawyer recommendation, fetch suggested lawyers
    let recommendedLawyers = []
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
        .limit(3)

      recommendedLawyers = lawyers || []
    }

    return NextResponse.json({
      message: response,
      messageId: aiMessage.id,
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

// GET /api/ai/history - Get chat history
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')
    const limit = parseInt(searchParams.get('limit') || '50')

    const supabase = createClient()

    let query = supabase
      .from('ai_chats')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (sessionId) {
      query = query.eq('session_id', sessionId)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ messages: data.reverse() })
  } catch (error) {
    console.error('Get Chat History Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/ai/clear - Clear chat history
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')

    const supabase = createClient()

    let query = supabase
      .from('ai_chats')
      .delete()
      .eq('user_id', session.user.id)

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