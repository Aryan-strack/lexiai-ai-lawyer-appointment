'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, Globe,
  Loader2, User, Phone, Scale, Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const registerSchema = z.object({
  name: z.string().min(2, 'Naam kam az kam 2 characters ka hona chahiye'),
  email: z.string().email('Valid email address daalo'),
  phone: z.string().optional(),
  password: z
    .string()
    .min(8, 'Password kam az kam 8 characters ka hona chahiye')
    .regex(/[A-Z]/, 'Ek capital letter zaroori hai')
    .regex(/[0-9]/, 'Ek number zaroori hai'),
  confirmPassword: z.string(),
  role: z.enum(['client', 'lawyer']),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords match nahi ho rahe',
  path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

const roleOptions = [
  {
    value: 'client' as const,
    label: 'Client',
    description: 'Legal help chahiye',
    icon: Users,
  },
  {
    value: 'lawyer' as const,
    label: 'Lawyer',
    description: 'Clients ko services deni hain',
    icon: Scale,
  },
]

export default function RegisterPage() {
  const router = useRouter()
  const { signUp, signInWithGoogle, isLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'client' },
  })

  const selectedRole = watch('role')

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const user = await signUp(data.email, data.password, data.name, data.role)
      toast.success('Account ban gaya! Email verify karein.')
      router.push(`/dashboard/${user.role}`)
    } catch (error: any) {
      const msg = error?.message || 'Registration failed. Please try again.'
      if (msg.includes('already registered')) {
        toast.error('Ye email already registered hai. Login karein.')
      } else {
        toast.error(msg)
      }
    }
  }

  const handleGoogleSignup = async () => {
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch (error: any) {
      toast.error(error?.message || 'Google signup failed')
      setGoogleLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md"
    >
      <div className="glass rounded-2xl shadow-2xl p-8 border border-border/50">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Account Banayein</h1>
          <p className="text-muted-foreground mt-1.5">
            LexiAI ke saath apna legal journey shuru karein
          </p>
        </div>

        {/* Role Selection */}
        <div className="mb-6">
          <Label className="text-sm font-medium mb-3 block">Aap kaun hain?</Label>
          <div className="grid grid-cols-2 gap-3">
            {roleOptions.map((option) => {
              const Icon = option.icon
              const isSelected = selectedRole === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setValue('role', option.value)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer',
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/40 hover:bg-muted/50'
                  )}
                >
                  <div className={cn(
                    'h-10 w-10 rounded-lg flex items-center justify-center transition-colors',
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-center">
                    <div className={cn('font-semibold text-sm', isSelected && 'text-primary')}>
                      {option.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{option.description}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Google Signup */}
        <Button
          type="button"
          variant="outline"
          className="w-full h-11 gap-3 mb-5 font-medium"
          onClick={handleGoogleSignup}
          disabled={googleLoading || isSubmitting}
        >
          {googleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Globe className="h-4 w-4" />
          )}
          Google se Register karein
        </Button>

        {/* Divider */}
        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-card px-3 text-muted-foreground">ya email se</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Poora Naam</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                placeholder="Aapka poora naam"
                autoComplete="name"
                className="pl-10 h-11"
                {...register('name')}
              />
            </div>
            {errors.name && (
              <p className="text-destructive text-xs">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="aapka@email.com"
                autoComplete="email"
                className="pl-10 h-11"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-destructive text-xs">{errors.email.message}</p>
            )}
          </div>

          {/* Phone (optional) */}
          <div className="space-y-1.5">
            <Label htmlFor="phone">
              Phone Number <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="+92 300 1234567"
                autoComplete="tel"
                className="pl-10 h-11"
                {...register('phone')}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Strong password banayein"
                autoComplete="new-password"
                className="pl-10 pr-10 h-11"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-destructive text-xs">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Password Confirm karein</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Wahi password dobara daalo"
                autoComplete="new-password"
                className="pl-10 pr-10 h-11"
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-destructive text-xs">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-11 gap-2 font-semibold mt-2"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Account ban raha hai...
              </>
            ) : (
              <>
                Account Banayein
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Login link */}
        <p className="text-center text-sm text-muted-foreground mt-5">
          Pehle se account hai?{' '}
          <Link
            href="/login"
            className="text-primary font-medium hover:underline underline-offset-4"
          >
            Sign In karein
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
