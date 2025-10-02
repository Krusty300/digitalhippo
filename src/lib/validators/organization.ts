import { z } from 'zod'

export const OrganizationValidator = z.object({
  name: z.string().min(2),
  type: z.enum(['landlord', 'pmc', 'enterprise']),
})

export type TOrganizationValidator = z.infer<typeof OrganizationValidator>