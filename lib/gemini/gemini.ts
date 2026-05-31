import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Safety settings — allow legal discussion without over-filtering
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
]

// AI Assistant System Instruction
const SYSTEM_INSTRUCTION = `You are LexiAI, a professional legal assistant specialized in Pakistani law.
Your role is to help users with:
1. Legal information and guidance (NOT legal advice — always recommend consulting a lawyer for specific cases)
2. Finding and recommending appropriate lawyers based on their legal issue
3. Assisting with appointment booking
4. Explaining legal procedures and documents
5. Answering FAQs about legal matters in Pakistan

Key principles:
- Be professional, accurate, and empathetic
- Always disclaim that you are an AI and not a substitute for a qualified lawyer
- For complex or specific cases, strongly recommend consulting a verified lawyer
- Keep responses concise and helpful (under 300 words unless asked for detail)
- Support both English and Urdu queries naturally
- Mention relevant Pakistani laws where applicable (e.g., PPC, CPC, Family Laws)

Important disclaimers to include when appropriate:
- "I'm an AI assistant, not a lawyer"
- "Please consult a qualified lawyer for specific legal advice"
- "Laws may vary — always verify with a professional"`

// Main chat completion function
export async function getChatCompletion(
  messages: Array<{ role: 'user' | 'model'; content: string }>,
  options?: {
    temperature?: number
    maxTokens?: number
  }
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: SYSTEM_INSTRUCTION,
    safetySettings,
    generationConfig: {
      temperature: options?.temperature ?? 0.7,
      maxOutputTokens: options?.maxTokens ?? 600,
      topP: 0.8,
      topK: 40,
    },
  })

  // Convert messages to Gemini format
  const history = messages.slice(0, -1).map(msg => ({
    role: msg.role,
    parts: [{ text: msg.content }],
  }))

  const lastMessage = messages[messages.length - 1]

  const chat = model.startChat({ history })
  const result = await chat.sendMessage(lastMessage.content)
  return result.response.text()
}

// Intent detection function
export async function detectIntent(text: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: { temperature: 0.1, maxOutputTokens: 30 },
  })

  const prompt = `Detect the intent of this user message. Return ONLY one of these exact values:
legal_question, lawyer_recommendation, appointment_booking, document_help, general_chat

User message: "${text}"

Intent:`

  const result = await model.generateContent(prompt)
  const intent = result.response.text().toLowerCase().trim().replace(/[^a-z_]/g, '')

  const validIntents = ['legal_question', 'lawyer_recommendation', 'appointment_booking', 'document_help', 'general_chat']
  return validIntents.includes(intent) ? intent : 'general_chat'
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
): Promise<string | null> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: { temperature: 0.2, maxOutputTokens: 50 },
  })

  const prompt = `Based on the legal issue, recommend the best lawyer ID from the list.
Consider: specialization match, experience, rating, and fee.
Return ONLY the lawyer ID, nothing else.

Legal Issue: ${legalIssue}

Available Lawyers:
${JSON.stringify(availableLawyers, null, 2)}

Best Lawyer ID:`

  const result = await model.generateContent(prompt)
  return result.response.text().trim()
}

// Document analysis function
export async function analyzeDocument(documentText: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: SYSTEM_INSTRUCTION,
    safetySettings,
    generationConfig: { temperature: 0.4, maxOutputTokens: 1200 },
  })

  const prompt = `Analyze this legal document and provide:
1. **Document Type** — what kind of document is this?
2. **Key Clauses Summary** — bullet points of important clauses
3. **Potential Risks** — what could be risky for the signing party?
4. **Recommendations** — what should the user clarify before signing?

Document:
${documentText}`

  const result = await model.generateContent(prompt)
  return result.response.text()
}

// Case summary generation for lawyers
export async function generateCaseSummary(caseDetails: {
  clientName: string
  issue: string
  timeline: string
  documents: string[]
}): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: { temperature: 0.4, maxOutputTokens: 1000 },
  })

  const prompt = `Generate a professional case summary for a Pakistani lawyer's reference.
Include: Case Overview, Key Facts, Timeline, and Recommended Actions.

Case Details:
${JSON.stringify(caseDetails, null, 2)}`

  const result = await model.generateContent(prompt)
  return result.response.text()
}

// Multilingual support (Urdu/English)
export async function translateText(text: string, targetLanguage: 'urdu' | 'english'): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: { temperature: 0.2, maxOutputTokens: 600 },
  })

  const prompt = `Translate the following text to ${targetLanguage === 'urdu' ? 'Urdu' : 'English'}.
Maintain professional legal tone.

Text: ${text}`

  const result = await model.generateContent(prompt)
  return result.response.text()
}
