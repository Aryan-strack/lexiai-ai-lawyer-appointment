import { User } from './user'

export interface Lawyer {
  id: string
  user_id: string
  user?: User
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
  created_at: string
  updated_at: string
}

export interface LawyerAvailability {
  id: string
  lawyer_id: string
  day_of_week: number // 0 = Sunday, 1 = Monday, etc.
  start_time: string // "09:00"
  end_time: string // "17:00"
  is_recurring: boolean
  specific_date?: string
  is_available: boolean
  created_at: string
}

export interface LawyerVerificationRequest {
  id: string
  lawyer_id: string
  documents: {
    bar_council_certificate?: string
    id_proof?: string
    degree_certificate?: string
    experience_certificate?: string
  }
  status: 'pending' | 'approved' | 'rejected'
  admin_notes?: string
  reviewed_by?: string
  reviewed_at?: string
  created_at: string
}

export interface LawyerFilters {
  specialization?: string
  city?: string
  minRating?: number
  maxFee?: number
  verified?: boolean
  searchQuery?: string
}

export interface LawyerStats {
  totalAppointments: number
  totalClients: number
  totalEarnings: number
  averageRating: number
  completionRate: number
}

export interface CreateLawyerData {
  specialization: string[]
  experience_years: number
  bar_council_number: string
  city: string
  fee_per_hour: number
  bio: string
  languages: string[]
  education: string[]
  achievements?: string[]
}

export interface UpdateLawyerData extends Partial<CreateLawyerData> {
  verified?: boolean
}

export interface LawyerSearchResult {
  id: string
  name: string
  avatar_url?: string
  specialization: string[]
  city: string
  fee_per_hour: number
  rating: number
  experience_years: number
  verified: boolean
}