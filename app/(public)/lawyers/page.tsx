'use client'

import { useState, useEffect } from 'react'
import { LawyerList } from '@/components/lawyers/LawyerList'
import { createClient } from '@/lib/supabase/client'

export default function LawyersPage() {
  const [lawyers, setLawyers] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLawyers = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('lawyers')
        .select(`
          *,
          users:user_id (
            name,
            email,
            avatar_url
          )
        `)
        .eq('verified', true)
        .order('rating', { ascending: false })

      if (!error && data) {
        const formattedLawyers = data.map((lawyer: any) => ({
          id: lawyer.id,
          name: lawyer.users.name,
          avatar: lawyer.users.avatar_url,
          specialization: lawyer.specialization,
          experience_years: lawyer.experience_years,
          city: lawyer.city,
          fee_per_hour: lawyer.fee_per_hour,
          rating: lawyer.rating,
          verified: lawyer.verified,
        }))
        setLawyers(formattedLawyers)
      }
      setIsLoading(false)
    }

    fetchLawyers()
  }, [])

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Find Your Perfect Lawyer
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse our network of verified lawyers and find the right legal expert for your case
          </p>
        </div>

        <LawyerList lawyers={lawyers} isLoading={isLoading} />
      </div>
    </div>
  )
}