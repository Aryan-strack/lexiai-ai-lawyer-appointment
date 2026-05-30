'use client'

import { useState } from 'react'
import { LawyerCard } from './LawyerCard'
import { LawyerFilter } from './LawyerFilter'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LawyerListProps {
  lawyers: any[]
  isLoading?: boolean
}

export function LawyerList({ lawyers, isLoading }: LawyerListProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredLawyers = lawyers.filter((lawyer) => {
    if (!searchQuery) return true
    return (
      lawyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lawyer.specialization.some((spec: string) => 
        spec.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      lawyer.city.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, specialization, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="sm:w-auto"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Filters Panel */}
      <div className={cn(
        "transition-all duration-300 overflow-hidden",
        showFilters ? "max-h-96" : "max-h-0"
      )}>
        <LawyerFilter />
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Found {filteredLawyers.length} lawyers
        </p>
      </div>

      {/* Lawyer Grid */}
      {filteredLawyers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No lawyers found matching your criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLawyers.map((lawyer) => (
            <LawyerCard key={lawyer.id} lawyer={lawyer} />
          ))}
        </div>
      )}
    </div>
  )
}