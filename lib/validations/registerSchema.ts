import { z } from 'zod'

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Invalid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    role: z.enum(['client', 'lawyer']).default('client'),
    phone: z.string().optional(),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type RegisterInput = z.infer<typeof registerSchema>

// Lawyer-specific validation (extends base schema)
export const lawyerRegisterSchema = registerSchema.extend({
  specialization: z.array(z.string()).min(1, 'At least one specialization required'),
  experienceYears: z.number().min(0, 'Experience years must be positive'),
  barCouncilNumber: z.string().min(1, 'Bar council number is required'),
  city: z.string().min(1, 'City is required'),
  feePerHour: z.number().min(0, 'Fee must be positive'),
  bio: z.string().min(50, 'Bio must be at least 50 characters').max(500, 'Bio too long'),
})

export type LawyerRegisterInput = z.infer<typeof lawyerRegisterSchema>

// Validation helpers
export function validateRegister(data: unknown) {
  const result = registerSchema.safeParse(data)
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    return { success: false, errors }
  }
  return { success: true, data: result.data }
}

export function validateLawyerRegister(data: unknown) {
  const result = lawyerRegisterSchema.safeParse(data)
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    return { success: false, errors }
  }
  return { success: true, data: result.data }
}