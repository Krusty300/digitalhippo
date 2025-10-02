import { z } from 'zod'

export const MaintenanceValidator = z.object({
  organizationId: z.string().min(1),
  propertyId: z.string().min(1),
  unitId: z.string().optional(),
  tenantId: z.string().optional(),
  title: z.string().min(3),
  description: z.string().min(5),
  priority: z.enum(['low', 'medium', 'high', 'emergency']).default('medium'),
})

export type TMaintenanceValidator = z.infer<typeof MaintenanceValidator>