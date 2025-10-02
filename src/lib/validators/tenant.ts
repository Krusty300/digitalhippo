import { z } from 'zod'

export const TenantValidator = z.object({
  organizationId: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  notes: z.string().optional(),
})

export type TTenantValidator = z.infer<typeof TenantValidator>