import { getPayloadClient } from '@/get-payload'import { UnitValidator } from '@/lib/validators/unit'
import { privateProcedure, router } from './trpc'import { z } from 'zod'
export const unitRouter = router({
  listByProperty: privateProcedure    .input(z.object({ propertyId: z.string() }))
    .query(async ({ input }) => {      const payload = await getPayloadClient()
      const { docs } = await payload.find({        collection: 'units',
        where: { property: { equals: input.propertyId } },        limit: 500,
      })      return docs
    }),
  create: privateProcedure    .input(UnitValidator)
    .mutation(async ({ input, ctx }) => {      const payload = await getPayloadClient()
      const {        req: { user },
      } = ctx as any
      const created = await payload.create({        collection: 'units',
        data: {          property: input.propertyId,
          unitNumber: input.unitNumber,          bedrooms: input.bed