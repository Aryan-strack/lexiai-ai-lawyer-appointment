'use client'

import { useState } from 'react'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TimeSlotPicker } from './TimeSlotPicker'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'

interface AppointmentCalendarProps {
  lawyerId?: string
  onSlotSelect?: (date: Date, time: string) => void
}

export function AppointmentCalendar({ lawyerId, onSlotSelect }: AppointmentCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Mock available time slots - in production, fetch from API
  const availableTimeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
  ]

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    setSelectedTime(null)
  }

  const handleTimeSelect = async (time: string) => {
    setSelectedTime(time)
    if (selectedDate && onSlotSelect) {
      setIsLoading(true)
      try {
        await onSlotSelect(selectedDate, time)
        toast.success('Time slot selected!')
      } catch (error) {
        toast.error('Failed to select time slot')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const isDateDisabled = (date: Date) => {
    // Disable past dates and weekends
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today || date.getDay() === 0 || date.getDay() === 6
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Calendar */}
      <Card className="p-4">
        <CalendarComponent
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          disabled={isDateDisabled}
          className="rounded-md"
        />
      </Card>

      {/* Time Slots */}
      {selectedDate && (
        <Card className="p-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">
                Available Slots for {format(selectedDate, 'MMMM dd, yyyy')}
              </h3>
              <TimeSlotPicker
                date={selectedDate}
                availableSlots={availableTimeSlots}
                onSelect={handleTimeSelect}
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}