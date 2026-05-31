'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Check, Sparkles, Star, Crown } from 'lucide-react'

const plans = {
  monthly: [
    {
      name: 'Basic',
      price: 0,
      yearlyPrice: undefined,
      description: 'Perfect for occasional legal questions',
      features: [
        'AI Legal Assistant (50 queries/month)',
        'Basic lawyer search',
        'Email support',
        'Document storage (100MB)',
      ],
      cta: 'Get Started',
      popular: false,
      icon: Sparkles,
      savings: undefined,
    },
    {
      name: 'Pro',
      price: 29,
      yearlyPrice: undefined,
      description: 'Best for regular legal needs',
      features: [
        'Unlimited AI queries',
        'Priority lawyer matching',
        'Priority support 24/7',
        'Document storage (10GB)',
        'Video consultations',
        'AI case summaries',
      ],
      cta: 'Start Free Trial',
      popular: true,
      icon: Star,
      savings: undefined,
    },
    {
      name: 'Enterprise',
      price: 99,
      yearlyPrice: undefined,
      description: 'For law firms and businesses',
      features: [
        'Everything in Pro',
        'Custom AI model',
        'Dedicated account manager',
        'API access',
        'Bulk document analysis',
        'SLA guarantee',
        'White-label options',
      ],
      cta: 'Contact Sales',
      popular: false,
      icon: Crown,
      savings: undefined,
    },
  ],
  yearly: [
    {
      name: 'Basic',
      price: 0,
      yearlyPrice: 0,
      description: 'Perfect for occasional legal questions',
      features: [
        'AI Legal Assistant (50 queries/month)',
        'Basic lawyer search',
        'Email support',
        'Document storage (100MB)',
      ],
      cta: 'Get Started',
      popular: false,
      icon: Sparkles,
    },
    {
      name: 'Pro',
      price: 29,
      yearlyPrice: 290,
      description: 'Best for regular legal needs',
      features: [
        'Unlimited AI queries',
        'Priority lawyer matching',
        'Priority support 24/7',
        'Document storage (10GB)',
        'Video consultations',
        'AI case summaries',
      ],
      cta: 'Start Free Trial',
      popular: true,
      icon: Star,
      savings: 'Save $58/year',
    },
    {
      name: 'Enterprise',
      price: 99,
      yearlyPrice: 990,
      description: 'For law firms and businesses',
      features: [
        'Everything in Pro',
        'Custom AI model',
        'Dedicated account manager',
        'API access',
        'Bulk document analysis',
        'SLA guarantee',
        'White-label options',
      ],
      cta: 'Contact Sales',
      popular: false,
      icon: Crown,
      savings: 'Save $198/year',
    },
  ],
}

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false)
  const currentPlans = isYearly ? plans.yearly : plans.monthly

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Choose the plan that works best for you. All plans include a 14-day free trial.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <Label htmlFor="billing" className={!isYearly ? 'font-semibold' : 'text-muted-foreground'}>
              Monthly
            </Label>
            <Switch
              id="billing"
              checked={isYearly}
              onCheckedChange={setIsYearly}
            />
            <Label htmlFor="billing" className={isYearly ? 'font-semibold' : 'text-muted-foreground'}>
              Yearly
              <span className="ml-2 text-xs text-green-500 font-normal">Save 15%</span>
            </Label>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {currentPlans.map((plan, index) => {
            const Icon = plan.icon
            return (
              <Card
                key={index}
                className={`relative transition-all duration-300 ${
                  plan.popular
                    ? 'border-primary shadow-xl scale-105 md:-mt-4 md:mb-4'
                    : 'hover:shadow-lg'
                }`}
              >
                {plan.popular && (
                  <Badge
                    className="absolute -top-3 left-1/2 transform -translate-x-1/2"
                    variant="default"
                  >
                    Most Popular
                  </Badge>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                    {plan.savings && isYearly && (
                      <Badge variant="success" className="text-xs">
                        {plan.savings}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">
                      ${isYearly && plan.yearlyPrice ? plan.yearlyPrice : plan.price}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-muted-foreground">
                        /{isYearly ? 'year' : 'month'}
                      </span>
                    )}
                    {plan.price === 0 && <span className="text-muted-foreground">/forever</span>}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href={plan.name === 'Enterprise' ? '/contact' : '/register'} className="w-full">
                    <Button
                      className="w-full"
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {/* FAQ Link */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Have questions? Check out our{' '}
            <Link href="/faq" className="text-primary hover:underline">
              FAQ
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}