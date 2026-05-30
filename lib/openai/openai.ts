import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// AI Assistant System Prompt
const SYSTEM_PROMPT = `You are LexiAI, a professional legal assistant for Pakistani law. 
Your role is to help users with:
1. Legal information and guidance (not legal advice - always recommend consulting a lawyer for specific cases)
2. Finding and recommending appropriate lawyers based on their legal issue
3. Assisting with appointment booking
4. Explaining legal procedures and documents
5. Answering FAQs about legal matters

Key principles:
- Be professional, accurate, and empathetic
- Always disclaim that you're an AI and not a substitute for a lawyer
- For complex cases, recommend consulting a qualified lawyer
- Keep responses concise and helpful
- Support both English and Urdu queries

Important disclaimers to include when appropriate:
- "I'm an AI assistant, not a lawyer"
- "Please consult a qualified lawyer for specific legal advice"
- "Laws may vary by jurisdiction"`

// Chat completion function
export async function getChatCompletion(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  options?: {
    temperature?: number
    maxTokens?: number
    model?: string
  }
) {
  const completion = await openai.chat.completions.create({
    model: options?.model || 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages,
    ],
    temperature: options?.temperature || 0.7,
    max_tokens: options?.maxTokens || 500,
  })

  return completion.choices[0].message.content || ''
}

// Intent detection function
export async function detectIntent(text: string) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: `Detect the intent of the user message. Choose one of: 
        'legal_question', 'lawyer_recommendation', 'appointment_booking', 'document_help', 'general_chat'`,
      },
      { role: 'user', content: text },
    ],
    temperature: 0.3,
    max_tokens: 50,
  })

  return completion.choices[0].message.content?.toLowerCase().trim() || 'general_chat'
}

// Lawyer recommendation function
export async function recommendLawyer(
  legalIssue: string,
  availableLawyers: Array<{
    id: string
    name: string
    specialization: string[]
    experience_years: number
    rating: number
    fee_per_hour: number
  }>
) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `Based on the legal issue, recommend the best lawyer from the available list.
        Consider specialization match, experience, rating, and fee.
        Return only the lawyer ID.`,
      },
      {
        role: 'user',
        content: `Legal Issue: ${legalIssue}\n\nAvailable Lawyers:\n${JSON.stringify(availableLawyers, null, 2)}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 50,
  })

  return completion.choices[0].message.content
}

// Document analysis function
export async function analyzeDocument(documentText: string) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `Analyze the legal document and provide:
        1. Document type
        2. Key clauses summary
        3. Potential risks
        4. Recommendations
        
        Be thorough but concise.`,
      },
      { role: 'user', content: documentText },
    ],
    temperature: 0.5,
    max_tokens: 1000,
  })

  return completion.choices[0].message.content
}

// Case summary generation
export async function generateCaseSummary(caseDetails: {
  clientName: string
  issue: string
  timeline: string
  documents: string[]
}) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `Generate a professional case summary for a lawyer's reference.
        Include: case overview, key facts, timeline, and recommended actions.`,
      },
      {
        role: 'user',
        content: JSON.stringify(caseDetails),
      },
    ],
    temperature: 0.5,
    max_tokens: 800,
  })

  return completion.choices[0].message.content
}

// Multilingual support (Urdu/English)
export async function translateText(text: string, targetLanguage: 'urdu' | 'english') {
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: `Translate the following text to ${targetLanguage === 'urdu' ? 'Urdu' : 'English'}. 
        Maintain professional legal tone.`,
      },
      { role: 'user', content: text },
    ],
    temperature: 0.3,
    max_tokens: 500,
  })

  return completion.choices[0].message.content
}