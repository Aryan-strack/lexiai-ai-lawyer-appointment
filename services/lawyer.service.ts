import { createClient } from '@/lib/supabase/client'

export interface Lawyer {
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
}

export interface LawyerFilters {
  specialization?: string
  city?: string
  minRating?: number
  verified?: boolean
  minFee?: number
  maxFee?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

class LawyerService {
  private supabase = createClient()

  async getLawyers(
    filters: LawyerFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Lawyer>> {
    let query = this.supabase
      .from('lawyers')
      .select(`
        *,
        users:user_id (
          id,
          name,
          email,
          phone,
          avatar_url
        )
      `, { count: 'exact' })

    if (filters.specialization) {
      query = query.contains('specialization', [filters.specialization])
    }
    if (filters.city) {
      query = query.eq('city', filters.city)
    }
    if (filters.minRating) {
      query = query.gte('rating', filters.minRating)
    }
    if (filters.verified !== undefined) {
      query = query.eq('verified', filters.verified)
    }
    if (filters.minFee) {
      query = query.gte('fee_per_hour', filters.minFee)
    }
    if (filters.maxFee) {
      query = query.lte('fee_per_hour', filters.maxFee)
    }

    const offset = (page - 1) * limit
    const { data, error, count } = await query
      .order('rating', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    const formattedLawyers = data?.map((item: any) => ({
      ...item,
      name: item.users.name,
      email: item.users.email,
      phone: item.users.phone,
      avatar_url: item.users.avatar_url,
    })) || []

    return {
      data: formattedLawyers,
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    }
  }

  async getLawyerById(id: string): Promise<Lawyer | null> {
    const { data, error } = await this.supabase
      .from('lawyers')
      .select(`
        *,
        users:user_id (
          id,
          name,
          email,
          phone,
          avatar_url
        ),
        reviews (
          id,
          rating,
          review_text,
          created_at,
          client:client_id (
            name,
            avatar_url
          )
        ),
        availability (*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) return null

    return {
      ...data,
      name: data.users.name,
      email: data.users.email,
      phone: data.users.phone,
      avatar_url: data.users.avatar_url,
    } as Lawyer
  }

  async updateLawyerProfile(profile: Partial<Lawyer>): Promise<Lawyer> {
    const { data, error } = await this.supabase
      .from('lawyers')
      .update({
        specialization: profile.specialization,
        experience_years: profile.experience_years,
        bar_council_number: profile.bar_council_number,
        city: profile.city,
        fee_per_hour: profile.fee_per_hour,
        bio: profile.bio,
        languages: profile.languages,
        education: profile.education,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', profile.user_id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getAvailability(lawyerId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('availability')
      .select('*')
      .eq('lawyer_id', lawyerId)
      .eq('is_available', true)

    if (error) throw error
    return data
  }

  async updateAvailability(lawyerId: string, availability: any[]): Promise<void> {
    // Delete existing availability
    await this.supabase
      .from('availability')
      .delete()
      .eq('lawyer_id', lawyerId)

    // Insert new availability
    if (availability.length > 0) {
      const { error } = await this.supabase
        .from('availability')
        .insert(availability.map(slot => ({ ...slot, lawyer_id: lawyerId })))

      if (error) throw error
    }
  }

  async getLawyerStats(lawyerId: string): Promise<{
    totalAppointments: number
    totalClients: number
    totalEarnings: number
    averageRating: number
  }> {
    const { data: appointments } = await this.supabase
      .from('appointments')
      .select('client_id, fee, payment_status')
      .eq('lawyer_id', lawyerId)

    const uniqueClients = new Set(appointments?.map(apt => apt.client_id))
    const totalEarnings = appointments
      ?.filter(apt => apt.payment_status === 'paid')
      .reduce((sum, apt) => sum + (apt.fee || 0), 0) || 0

    const { data: lawyer } = await this.supabase
      .from('lawyers')
      .select('rating')
      .eq('id', lawyerId)
      .single()

    return {
      totalAppointments: appointments?.length || 0,
      totalClients: uniqueClients.size,
      totalEarnings,
      averageRating: lawyer?.rating || 0,
    }
  }

  async getSpecializations(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('lawyers')
      .select('specialization')

    if (error) throw error

    const allSpecializations = new Set<string>()
    data?.forEach(lawyer => {
      lawyer.specialization?.forEach((spec: string) => allSpecializations.add(spec))
    })

    return Array.from(allSpecializations).sort()
  }

  async getCities(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('lawyers')
      .select('city')
      .not('city', 'is', null)

    if (error) throw error

    const cities = new Set(data?.map(l => l.city).filter(Boolean))
    return Array.from(cities).sort()
  }
}

export const lawyerService = new LawyerService()