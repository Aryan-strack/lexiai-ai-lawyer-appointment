'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ReviewCard } from '@/components/reviews/ReviewCard'
import { RatingStars } from '@/components/reviews/RatingStars'
import { Review } from '@/types/review'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-hot-toast'

export default function LawyerReviewsPage() {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [responseText, setResponseText] = useState('')
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      const fetchReviews = async () => {
        const supabase = createClient()
        
        const { data: lawyer } = await supabase
          .from('lawyers')
          .select('id')
          .eq('user_id', user?.id)
          .single()

        if (lawyer) {
          const { data, error } = await supabase
            .from('reviews')
            .select(`
              *,
              client:client_id (
                name,
                avatar_url
              )
            `)
            .eq('lawyer_id', lawyer.id)
            .order('created_at', { ascending: false })

          if (!error && data) {
            setReviews(data)
            const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length || 0
            setAverageRating(avg)
          }
        }
        setIsLoading(false)
      }

      fetchReviews()
    }
  }, [user])

  const submitResponse = async () => {
    if (!responseText.trim()) return

    const supabase = createClient()
    const { error } = await supabase
      .from('reviews')
      .update({ lawyer_response: responseText })
      .eq('id', selectedReview?.id)

    if (error) {
      toast.error('Failed to submit response')
    } else {
      toast.success('Response submitted')
      setResponseText('')
      setSelectedReview(null)
      fetchReviews()
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout role="lawyer">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="lawyer">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Client Reviews</h1>
            <p className="text-muted-foreground mt-1">See what clients are saying</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
            <RatingStars rating={averageRating} />
            <p className="text-sm text-muted-foreground mt-1">{reviews.length} reviews</p>
          </div>
        </div>

        <div className="space-y-4">
           {reviews.map((review) => (
            <div key={review.id} className="relative">
              <ReviewCard review={review} />
              {!review.lawyer_response && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="absolute bottom-4 right-4"
                      onClick={() => setSelectedReview(review)}
                    >
                      Respond
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Respond to {review.client?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Write your response..."
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        rows={4}
                      />
                      <Button onClick={submitResponse} className="w-full">
                        Submit Response
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          ))}

          {reviews.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No reviews yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}