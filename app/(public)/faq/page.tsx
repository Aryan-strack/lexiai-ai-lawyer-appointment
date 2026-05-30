'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'

const faqs = [
  {
    category: 'General',
    questions: [
      {
        q: 'What is LexiAI?',
        a: 'LexiAI is Pakistan\'s first AI-powered legal platform that connects clients with verified lawyers and provides instant AI legal assistance.',
      },
      {
        q: 'Is LexiAI free to use?',
        a: 'We offer a free plan with basic features. Premium plans start at $29/month for advanced features and unlimited AI queries.',
      },
      {
        q: 'How do I book an appointment?',
        a: 'Simply search for a lawyer, view their profile, and select an available time slot. You can also ask our AI assistant to help you book.',
      },
    ],
  },
  {
    category: 'AI Assistant',
    questions: [
      {
        q: 'What can the AI assistant do?',
        a: 'Our AI can answer legal questions, recommend lawyers, help with document preparation, schedule appointments, and provide legal information.',
      },
      {
        q: 'Is the AI advice legally binding?',
        a: 'No, our AI provides informational guidance only. Always consult with a qualified lawyer for legally binding advice.',
      },
      {
        q: 'Does the AI support Urdu?',
        a: 'Yes! Our AI assistant supports both English and Urdu languages.',
      },
    ],
  },
  {
    category: 'Lawyers',
    questions: [
      {
        q: 'How are lawyers verified?',
        a: 'All lawyers undergo a strict verification process including bar council verification, experience validation, and background checks.',
      },
      {
        q: 'Can I become a lawyer on LexiAI?',
        a: 'Yes! Lawyers can sign up and complete our verification process to start accepting clients.',
      },
      {
        q: 'How are lawyers rated?',
        a: 'Clients can rate and review lawyers after completed consultations. We use a 5-star rating system.',
      },
    ],
  },
  {
    category: 'Payments & Security',
    questions: [
      {
        q: 'Is my payment information secure?',
        a: 'Yes, we use industry-standard encryption and never store your full payment details.',
      },
      {
        q: 'What payment methods are accepted?',
        a: 'We accept credit cards, EasyPaisa, and JazzCash for Pakistani clients.',
      },
      {
        q: 'What is your refund policy?',
        a: 'If you cancel within 24 hours of booking, you\'ll receive a full refund. Contact support for assistance.',
      },
    ],
  },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<{ category: number; question: number } | null>(null)

  const toggleQuestion = (categoryIndex: number, questionIndex: number) => {
    if (openIndex?.category === categoryIndex && openIndex?.question === questionIndex) {
      setOpenIndex(null)
    } else {
      setOpenIndex({ category: categoryIndex, question: questionIndex })
    }
  }

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-muted-foreground">
            Find answers to common questions about LexiAI
          </p>
        </div>

        <div className="space-y-8">
          {faqs.map((category, categoryIndex) => (
            <Card key={categoryIndex}>
              <CardHeader>
                <CardTitle className="text-2xl">{category.category}</CardTitle>
                <CardDescription>
                  Common questions about {category.category.toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {category.questions.map((faq, questionIndex) => {
                  const isOpen = openIndex?.category === categoryIndex && openIndex?.question === questionIndex
                  return (
                    <div key={questionIndex} className="border rounded-lg">
                      <button
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors rounded-lg"
                        onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                      >
                        <span className="font-semibold">{faq.q}</span>
                        {isOpen ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-4">
                          <p className="text-muted-foreground">{faq.a}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Still Have Questions */}
        <Card className="mt-12 bg-primary/5">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-2">Still have questions?</h3>
            <p className="text-muted-foreground mb-4">
              Can't find the answer you're looking for? Please contact our support team.
            </p>
            <Button asChild>
              <a href="/contact">Contact Support</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}