'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { specialties, cities } from '@/constants/specialties'

export function LawyerFilter() {
  const [priceRange, setPriceRange] = useState([0, 500])
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const [selectedCities, setSelectedCities] = useState<string[]>([])

  const handleSpecialtyChange = (specialty: string) => {
    setSelectedSpecialties(prev =>
      prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    )
  }

  const handleCityChange = (city: string) => {
    setSelectedCities(prev =>
      prev.includes(city)
        ? prev.filter(c => c !== city)
        : [...prev, city]
    )
  }

  const handleReset = () => {
    setPriceRange([0, 500])
    setSelectedSpecialties([])
    setSelectedCities([])
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Price Range */}
        <div>
          <Label className="text-sm font-medium">Price Range (per hour)</Label>
          <div className="mt-4">
            <Slider
              min={0}
              max={500}
              step={10}
              value={priceRange}
              onValueChange={setPriceRange}
              className="my-4"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}+</span>
            </div>
          </div>
        </div>

        {/* Specializations */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Specialization</Label>
          <div className="grid grid-cols-2 gap-2">
            {specialties.map((specialty) => (
              <div key={specialty} className="flex items-center space-x-2">
                <Checkbox
                  id={specialty}
                  checked={selectedSpecialties.includes(specialty)}
                  onCheckedChange={() => handleSpecialtyChange(specialty)}
                />
                <Label htmlFor={specialty} className="text-sm cursor-pointer">
                  {specialty}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Cities */}
        <div>
          <Label className="text-sm font-medium mb-2 block">City</Label>
          <div className="grid grid-cols-2 gap-2">
            {cities.map((city) => (
              <div key={city} className="flex items-center space-x-2">
                <Checkbox
                  id={city}
                  checked={selectedCities.includes(city)}
                  onCheckedChange={() => handleCityChange(city)}
                />
                <Label htmlFor={city} className="text-sm cursor-pointer">
                  {city}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button onClick={handleReset} variant="outline" className="flex-1">
            Reset
          </Button>
          <Button className="flex-1">Apply Filters</Button>
        </div>
      </div>
    </Card>
  )
}