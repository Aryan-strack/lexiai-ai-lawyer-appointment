import { User } from './user'
import { Lawyer } from './lawyer'
import { Appointment } from './appointment'

export interface Review {
  id: string
  appointment_id: string
  appointment?: Appointment
  client_id: string
  client?: User
  lawyer_id: string
  lawyer?: Lawyer
  rating: number // 1-5
  review_text: string
  lawyer_response?: string
  is_verified: boolean
  helpful_count: number
  created_at: string
  updated_at: string
}

export interface CreateReviewData {
  appointment_id: string
  rating: number
  review_text: string
}

export interface UpdateReviewData {
  review_text?: string
  rating?: number
}

export interface ReviewResponseData {
  review_id: string
  response: string
}

export interface ReviewStats {
  average_rating: number
  total_reviews: number
  rating_distribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
  verified_reviews: number
  response_rate: number
  average_response_time: number // in hours
}

export interface ReviewFilterParams {
  minRating?: number
  maxRating?: number
  hasResponse?: boolean
  isVerified?: boolean
  startDate?: Date
  endDate?: Date
  page?: number
  limit?: number
}

export interface ReviewReport {
  id: string
  review_id: string
  reporter_id: string
  reason: string
  status: 'pending' | 'reviewed' | 'dismissed' | 'action_taken'
  admin_notes?: string
  created_at: string
  resolved_at?: string
}

export interface TopReviewer {
  user_id: string
  name: string
  review_count: number
  average_rating: number
  helpful_count: number
}