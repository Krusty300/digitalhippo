import { z } from 'zod'

export const PropertyValidator = z.object({
  name: z.string().min(2),
  type: z.enum(['residential', 'commercial', 'mixed']),
  address1: z.string().min(3),
  address2: z.string().optional().nullable(),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(2),
  country: z.string().min(2),
  organizationId: z.string().optional(),
  description: z.string().optional().nullable(),
})

export type TPropertyValidator = z.infer<typeof PropertyValidator>