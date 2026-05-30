import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Scale, Heart, Target, Globe, Users, Award } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about LexiAI - Pakistan\'s leading AI-powered legal platform',
}

const values = [
  {
    icon: Heart,
    title: 'Accessibility',
    description: 'Making legal help available to everyone, everywhere',
  },
  {
    icon: Target,
    title: 'Excellence',
    description: 'Connecting you with the best legal professionals',
  },
  {
    icon: Globe,
    title: 'Innovation',
    description: 'Leveraging AI to transform legal services',
  },
]

const team = [
  {
    name: 'Sarah Ahmed',
    role: 'CEO & Founder',
    bio: 'Former lawyer with 10+ years experience in legal tech',
    image: '/team/sarah.jpg',
  },
  {
    name: 'Ali Raza',
    role: 'CTO',
    bio: 'AI expert specializing in legal technology',
    image: '/team/ali.jpg',
  },
  {
    name: 'Fatima Khan',
    role: 'Head of Legal',
    bio: 'Senior lawyer and legal tech consultant',
    image: '/team/fatima.jpg',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-background pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Revolutionizing Legal Services with AI
            </h1>
            <p className="text-xl text-muted-foreground">
              LexiAI is Pakistan's first AI-powered platform connecting people with verified lawyers.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                To democratize access to legal services by combining cutting-edge AI technology 
                with a network of verified legal professionals. We believe everyone deserves 
                quality legal help, regardless of their location or budget.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>10,000+ Clients Served</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span>500+ Verified Lawyers</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {values.map((value, index) => {
                const Icon = value.icon
                return (
                  <Card key={index}>
                    <CardHeader>
                      <Icon className="h-8 w-8 text-primary mb-2" />
                      <CardTitle className="text-lg">{value.title}</CardTitle>
                      <CardDescription>{value.description}</CardDescription>
                    </CardHeader>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Meet Our Leadership</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experienced professionals dedicated to transforming legal services
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="h-32 w-32 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                    <Scale className="h-12 w-12 text-primary" />
                  </div>
                  <CardTitle>{member.name}</CardTitle>
                  <CardDescription className="text-primary font-medium">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-12">
              <h3 className="text-2xl font-bold mb-4">Join Our Mission</h3>
              <p className="mb-6">Be part of the legal tech revolution in Pakistan</p>
              <div className="flex gap-4 justify-center">
                <Link href="/contact">
                  <Button variant="secondary">Contact Us</Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                    Get Started
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}