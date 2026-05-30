import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>

// Validation errors helper
export function validateLogin(data: unknown) {
  const result = loginSchema.safeParse(data)
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    return { success: false, errors }
  }
  return { success: true, data: result.data }
}