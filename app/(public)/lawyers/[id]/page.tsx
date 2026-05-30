import { notFound } from 'next/navigation'
import { LawyerProfile } from '@/components/lawyers/LawyerProfile'
import { createClient } from '@/lib/supabase/server'

interface LawyerPageProps {
  params: {
    id: string
  }
}

export default async function LawyerPage({ params }: LawyerPageProps) {
  const supabase = createClient()
  
  const { data: lawyer, error } = await supabase
    .from('lawyers')
    .select(`
      *,
      users:user_id (
        name,
        email,
        phone,
        avatar_url
      )
    `)
    .eq('id', params.id)
    .single()

  if (error || !lawyer) {
    notFound()
  }

  // Get availability
  const { data: availability } = await supabase
    .from('availability')
    .select('*')
    .eq('lawyer_id', params.id)

  const formattedLawyer = {
    id: lawyer.id,
    user_id: lawyer.user_id,
    name: lawyer.users.name,
    email: lawyer.users.email,
    phone: lawyer.users.phone,
    avatar_url: lawyer.users.avatar_url,
    specialization: lawyer.specialization,
    experience_years: lawyer.experience_years,
    bar_council_number: lawyer.bar_council_number,
    city: lawyer.city,
    fee_per_hour: lawyer.fee_per_hour,
    verified: lawyer.verified,
    verified_at: lawyer.verified_at,
    bio: lawyer.bio,
    rating: lawyer.rating,
    total_reviews: lawyer.total_reviews,
    languages: lawyer.languages || ['English'],
    education: lawyer.education || [],
    achievements: lawyer.achievements || [],
    availability: availability || [],
  }

  return <LawyerProfile lawyer={formattedLawyer} />
}