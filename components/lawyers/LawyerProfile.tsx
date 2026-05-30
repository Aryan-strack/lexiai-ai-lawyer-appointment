'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  MapPin, 
  Star, 
  Clock, 
  Award, 
  Mail, 
  Phone, 
  Calendar,
  CheckCircle,
  BookOpen,
  Users,
  Briefcase,
  MessageCircle,
  ThumbsUp,
  Share2,
  Flag
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ReviewCard } from '@/components/reviews/ReviewCard'
import { RatingStars } from '@/components/reviews/RatingStars'
import { AppointmentCalendar } from '@/components/appointments/AppointmentCalendar'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'react-hot-toast'

interface LawyerProfileProps {
  lawyer: {
    id: string
    user_id: string
    name: string
    email: string
    phone?: string
    avatar_url?: string
    specialization: string[]
    experience_years: number
    bar_council_number: string
    city: string
    fee_per_hour: number
    verified: boolean
    verified_at?: string
    bio: string
    rating: number
    total_reviews: number
    languages: string[]
    education: string[]
    achievements: string[]
    availability: {
      day_of_week: number
      start_time: string
      end_time: string
    }[]
  }
}

export function LawyerProfile({ lawyer }: LawyerProfileProps) {
  const [selectedTab, setSelectedTab] = useState('about')
  const { user } = useAuth()
  const router = useRouter()

  const handleBookAppointment = () => {
    if (!user) {
      toast.error('Please login to book an appointment')
      router.push('/login')
      return
    }
    router.push(`/dashboard/client/appointments/book?lawyer=${lawyer.id}`)
  }

  const handleContact = () => {
    if (!user) {
      toast.error('Please login to contact lawyer')
      router.push('/login')
      return
    }
    router.push(`/dashboard/client/chat?lawyer=${lawyer.id}`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-white shadow-xl">
              <AvatarImage src={lawyer.avatar_url} />
              <AvatarFallback className="text-4xl bg-primary text-white">
                {lawyer.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl md:text-4xl font-bold">{lawyer.name}</h1>
                {lawyer.verified && (
                  <Badge variant="success" className="gap-1">
                    <Award className="h-3 w-3" />
                    Verified Lawyer
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                  <span className="font-semibold">{lawyer.rating}</span>
                  <span className="text-muted-foreground">
                    ({lawyer.total_reviews} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{lawyer.city}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{lawyer.experience_years}+ years experience</span>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground line-clamp-2">{lawyer.bio}</p>

            <div className="flex flex-wrap gap-3">
              <Button size="lg" onClick={handleBookAppointment}>
                <Calendar className="h-4 w-4 mr-2" />
                Book Appointment
              </Button>
              <Button size="lg" variant="outline" onClick={handleContact}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Lawyer
              </Button>
              <Button size="lg" variant="ghost">
                <Share2 className="h-4 w-4 mr-2" />
                Share Profile
              </Button>
            </div>
          </div>

          {/* Fee Card */}
          <div className="flex-shrink-0">
            <Card className="w-full md:w-64">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground">Consultation Fee</p>
                <p className="text-3xl font-bold text-primary mt-1">
                  {formatCurrency(lawyer.fee_per_hour)}
                </p>
                <p className="text-xs text-muted-foreground">per hour</p>
                <Separator className="my-4" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Response time:</span>
                    <span className="font-medium">Within 24 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Success rate:</span>
                    <span className="font-medium">98%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
        </TabsList>

        {/* About Tab */}
        <TabsContent value="about" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Biography</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {lawyer.bio}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Practice Areas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {lawyer.specialization.map((spec) => (
                      <Badge key={spec} variant="secondary" className="text-sm">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Languages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {lawyer.languages.map((lang) => (
                      <Badge key={lang} variant="outline">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{lawyer.email}</span>
                  </div>
                  {lawyer.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{lawyer.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{lawyer.city}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Cases Won</span>
                    </div>
                    <span className="font-semibold">250+</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Happy Clients</span>
                    </div>
                    <span className="font-semibold">500+</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Recommendation</span>
                    </div>
                    <span className="font-semibold">95%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Available Time Slots</CardTitle>
            </CardHeader>
            <CardContent>
              <AppointmentCalendar lawyerId={lawyer.id} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Rating Summary */}
            <div className="md:col-span-1">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-5xl font-bold text-primary">{lawyer.rating}</div>
                  <div className="flex justify-center mt-2">
                    <RatingStars rating={lawyer.rating} size="lg" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Based on {lawyer.total_reviews} reviews
                  </p>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-sm w-8">{star}★</span>
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${Math.random() * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {Math.floor(Math.random() * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reviews List */}
            <div className="md:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <ReviewCard key={i} />
              ))}
              <Button variant="outline" className="w-full">
                Load More Reviews
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Credentials Tab */}
        <TabsContent value="credentials" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lawyer.education.map((edu, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">{edu}</p>
                      <p className="text-sm text-muted-foreground">Graduated</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Professional Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lawyer.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">{achievement}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bar Council Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bar Council Number:</span>
                  <span className="font-mono">{lawyer.bar_council_number}</span>
                </div>
                {lawyer.verified_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Verified Since:</span>
                    <span>{formatDate(lawyer.verified_at)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}