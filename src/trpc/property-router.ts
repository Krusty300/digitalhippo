import { getPayloadClient } from '@/get-payload'
import { PropertyValidator } from '@/lib/validators/property'
import { privateProcedure, router } from './trpc'
import { z } from 'zod'

export const propertyRouter = router({
  list: privateProcedure
    .input(
      z
        .object({
          organizationId: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input, ctx }) => {
      const payload = await getPayloadClient()
      const {
        req: { user },
      } = ctx as any

      // orgs for user (if not provided)
      let organizationFilter: any = undefined
      if (input?.organizationId) {
        organizationFilter = { equals: input.organizationId }
      } else {
        const orgs = await payload.find({
          collection: 'organizations',
          where: { 'members.user': { equals: user.id } },
          limit: 100,
        })
        const orgIds = orgs.docs.map((o) => o.id as string)
        organizationFilter = { in: orgIds.length ? orgIds : ['___none___'] }
      }

      const { docs } = await payload.find({
        collection: 'properties',
        where: {
          organization: organizationFilter,
        },
        limit: 200,
        depth: 1,
      })

      return docs
    }),

  create: privateProcedure
    .input(PropertyValidator)
    .mutation(async ({ input, ctx }) => {
      const payload = await getPayloadClient()
      const {
        req: { user },
      } = ctx as any

      const created = await payload.create({
        collection: 'properties',
        data: {
          organization: input.organizationId,
          name: input.name,
          type: input.type,
          address1: input.address1,
          address2: input.address2,
          city: input.city,
          state: input.state,
          postalCode: input.postalCode,
          country: input.country,
          description: input.description,
          createdBy: user.id,
        },
      })

      return created
    }),

  byId: privateProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const payload = await getPayloadClient()
      const doc = await payload.findByID({
        collection: 'properties',
        id: input.id,
        depth: 2,
      })
      return doc
    }),
})