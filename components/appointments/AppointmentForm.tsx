'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'react-hot-toast'

const appointmentSchema = z.object({
  date: z.date(),
  time: z.string().min(1, 'Please select a time'),
  duration: z.string().min(1, 'Please select duration'),
  notes: z.string().optional(),
})

type AppointmentFormData = z.infer<typeof appointmentSchema>

interface AppointmentFormProps {
  lawyerId: string
  lawyerName: string
  feePerHour: number
  onSubmit: (data: any) => Promise<void>
}

export function AppointmentForm({ lawyerId, lawyerName, feePerHour, onSubmit }: AppointmentFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
  })

  const selectedDate = watch('date')
  const selectedDuration = watch('duration')

  const calculateTotal = () => {
    const duration = parseInt(selectedDuration || '60')
    return (feePerHour * duration) / 60
  }

  const availableTimeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
  ]

  const onFormSubmit = async (data: AppointmentFormData) => {
    setIsLoading(true)
    try {
      const appointmentData = {
        lawyer_id: lawyerId,
        appointment_date: new Date(
          data.date.getFullYear(),
          data.date.getMonth(),
          data.date.getDate(),
          parseInt(data.time.split(':')[0]),
          data.time.includes('PM') && parseInt(data.time.split(':')[0]) !== 12 ? 
            parseInt(data.time.split(':')[0]) + 12 : 
            parseInt(data.time.split(':')[0])
        ),
        duration_minutes: parseInt(data.duration),
        notes: data.notes,
        fee: calculateTotal(),
      }
      await onSubmit(appointmentData)
      toast.success('Appointment booked successfully!')
    } catch (error) {
      toast.error('Failed to book appointment')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book Appointment with {lawyerName}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Date Picker */}
          <div className="space-y-2">
            <Label>Select Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date: Date | undefined) => date && setValue('date', date)}
                  disabled={(date: Date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label>Select Time</Label>
            <Select onValueChange={(value: string) => setValue('time', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select time slot" />
              </SelectTrigger>
              <SelectContent>
                {availableTimeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.time && (
              <p className="text-sm text-destructive">{errors.time.message}</p>
            )}
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label>Duration</Label>
            <Select onValueChange={(value: string) => setValue('duration', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
            {errors.duration && (
              <p className="text-sm text-destructive">{errors.duration.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Additional Notes (Optional)</Label>
            <Textarea
              {...register('notes')}
              placeholder="Describe your legal issue or any specific requirements..."
              rows={4}
            />
          </div>

          {/* Fee Summary */}
          <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Consultation Fee ({selectedDuration || '60'} min):</span>
              <span className="font-semibold">${calculateTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Platform Fee:</span>
              <span className="font-semibold">$0.00</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span>Total Amount:</span>
                <span className="text-primary">${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Confirm & Pay'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}