import { z } from 'zod'

export const UnitValidator = z.object({
  propertyId: z.string().min(1),
  unitNumber: z.string().min(1),
  bedrooms: z.coerce.number().min(0).max(20),
  bathrooms: z.coerce.number().min(0).max(20),
  rent: z.coerce.number().min(0),
  squareFeet: z.coerce.number().min(0).optional(),
  status: z.enum(['vacant', 'occupied', 'maintenance']).default('vacant'),
})

export type TUnitValidator = z.infer<typeof UnitValidator>