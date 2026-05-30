import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Star, Clock, Award } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LawyerCardProps {
  lawyer: {
    id: string
    name: string
    avatar?: string
    specialization: string[]
    experience_years: number
    city: string
    fee_per_hour: number
    rating: number
    verified: boolean
  }
  variant?: 'default' | 'compact'
}

export function LawyerCard({ lawyer, variant = 'default' }: LawyerCardProps) {
  if (variant === 'compact') {
    return (
      <Link href={`/lawyers/${lawyer.id}`}>
        <Card className="hover:shadow-lg transition-all cursor-pointer group">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold text-lg">
                  {lawyer.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {lawyer.name}
                  </h3>
                  <div className="flex items-center">
                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    <span className="text-sm ml-1">{lawyer.rating}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span>{lawyer.specialization[0]}</span>
                  <span>•</span>
                  <span>{lawyer.experience_years} years</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Card className="hover:shadow-xl transition-all duration-300 group overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative h-48 bg-gradient-to-r from-primary/20 to-primary/10">
          <div className="absolute top-4 right-4">
            {lawyer.verified && (
              <Badge variant="success" className="gap-1">
                <Award className="h-3 w-3" />
                Verified
              </Badge>
            )}
          </div>
          <div className="absolute -bottom-8 left-4">
            <div className="h-16 w-16 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center border-2 border-primary">
              <span className="text-primary font-bold text-xl">
                {lawyer.name.charAt(0)}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-10">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
              {lawyer.name}
            </h3>
            <div className="flex items-center space-x-1 mt-1">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <span className="text-sm font-medium">{lawyer.rating}</span>
              <span className="text-xs text-muted-foreground">(120 reviews)</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">${lawyer.fee_per_hour}</p>
            <p className="text-xs text-muted-foreground">per hour</p>
          </div>
        </div>

        <div className="space-y-2 mt-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{lawyer.city}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{lawyer.experience_years}+ years experience</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {lawyer.specialization.slice(0, 3).map((spec) => (
            <Badge key={spec} variant="secondary" className="text-xs">
              {spec}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Link href={`/lawyers/${lawyer.id}`} className="flex-1">
          <Button variant="outline" className="w-full">
            View Profile
          </Button>
        </Link>
        <Link href={`/dashboard/client/appointments/book?lawyer=${lawyer.id}`} className="flex-1">
          <Button className="w-full">
            Book Now
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}