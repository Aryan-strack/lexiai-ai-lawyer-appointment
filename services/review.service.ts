import { createClient } from '@/lib/supabase/client'

export interface Review {
  id: string
  appointment_id: string
  client_id: string
  lawyer_id: string
  rating: number
  review_text: string
  lawyer_response?: string
  is_verified: boolean
  created_at: string
  updated_at: string
  client?: {
    id: string
    name: string
    avatar_url?: string
  }
}

export interface CreateReviewData {
  appointment_id: string
  rating: number
  review_text: string
}

export interface ReviewStats {
  averageRating: number
  totalReviews: number
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

class ReviewService {
  private supabase = createClient()

  async createReview(data: CreateReviewData): Promise<Review> {
    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create review')
    }

    const result = await response.json()
    return result.review
  }

  async getLawyerReviews(
    lawyerId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    reviews: Review[]
    stats: ReviewStats
    pagination: { total: number; page: number; limit: number; totalPages: number }
  }> {
    const url = new URL('/api/reviews', window.location.origin)
    url.searchParams.set('lawyerId', lawyerId)
    url.searchParams.set('page', page.toString())
    url.searchParams.set('limit', limit.toString())

    const response = await fetch(url.toString())
    if (!response.ok) throw new Error('Failed to fetch reviews')

    const data = await response.json()

    // Calculate stats
    const stats = this.calculateReviewStats(data.reviews)

    return {
      reviews: data.reviews,
      stats,
      pagination: data.pagination,
    }
  }

  async respondToReview(reviewId: string, response: string): Promise<Review> {
    const responseData = await fetch(`/api/reviews/${reviewId}/respond`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response }),
    })

    if (!responseData.ok) {
      const error = await responseData.json()
      throw new Error(error.error || 'Failed to respond to review')
    }

    const data = await responseData.json()
    return data.review
  }

  async getMyReviews(role: 'client' | 'lawyer'): Promise<Review[]> {
    const { data, error } = await this.supabase
      .from('reviews')
      .select(`
        *,
        client:client_id (id, name, avatar_url),
        appointment:appointment_id (
          appointment_date,
          lawyer:lawyer_id (
            users:user_id (name)
          )
        )
      `)
      .eq(role === 'client' ? 'client_id' : 'lawyer_id', (await this.supabase.auth.getUser()).data.user?.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async canReview(appointmentId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('appointments')
      .select('status, id')
      .eq('id', appointmentId)
      .single()

    if (error) return false

    // Check if appointment is completed and not yet reviewed
    if (data.status !== 'completed') return false

    const { data: existingReview } = await this.supabase
      .from('reviews')
      .select('id')
      .eq('appointment_id', appointmentId)
      .single()

    return !existingReview
  }

  private calculateReviewStats(reviews: Review[]): ReviewStats {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    let totalRating = 0

    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++
      totalRating += review.rating
    })

    return {
      averageRating: reviews.length > 0 ? totalRating / reviews.length : 0,
      totalReviews: reviews.length,
      ratingDistribution: distribution,
    }
  }

  async deleteReview(reviewId: string): Promise<void> {
    const { error } = await this.supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)

    if (error) throw error
  }

  async reportReview(reviewId: string, reason: string): Promise<void> {
    const { error } = await this.supabase
      .from('review_reports')
      .insert({
        review_id: reviewId,
        reason,
        reported_at: new Date().toISOString(),
      })

    if (error) throw error
  }
}

export const reviewService = new ReviewService()